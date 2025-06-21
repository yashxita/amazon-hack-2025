from fastapi import FastAPI, HTTPException, Depends, Response, status, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import jwt, JWTError
from pydantic import BaseModel
from typing import Optional, List, Dict
from dotenv import load_dotenv
import databases, sqlalchemy, joblib, asyncio, os, uuid
import sqlalchemy
from datetime import datetime
import pandas as pd
import base64
from sqlalchemy import select

from model import (
    recommend_movies_by_mood,
    recommend_blend,
    assign_tag_from_movie_history,
    handle_voice_search,
    extract_genres,
    create_blend_code,
    join_blend_code,
    movie_title_to_genres
)

# Load environment variables
load_dotenv()

# === Config ===
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./users.db") 
SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# === App & Middleware ===
app = FastAPI(title="Movie Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Models ===
class UserCreate(BaseModel):
    username: str
    password: str

class WatchlistGroupCreate(BaseModel):
    name: str

class WatchlistGroupOut(BaseModel):
    id: str
    name: str
    cover_image: Optional[str] = None

class WatchlistCreate(BaseModel):
    movie_id: str
    movie_name: str

class WatchlistMovieOut(BaseModel):
    id: str
    movie_id: str
    movie_name: str
    poster_path: str
    release_date: str

class WatchlistDetailOut(BaseModel):
    id: str
    name: str
    cover_image: Optional[str] = None
    movies: List[WatchlistMovieOut]

class WatchlistUpdate(BaseModel):
    movie_name: str

class WatchHistoryAddRequest(BaseModel):
    movie_id: str
    movie_name: str

class WatchHistoryItem(BaseModel):
    movie_id: str
    movie_name: str
    watched_at: str  # ISO format string
    poster_path: str
    release_date: str

class RecommendationRequest(BaseModel):
    mood: str
    top_n: int = 10

class MovieRecommendation(BaseModel):
    title: str
    score: float
    genres: List[str]
    poster_path: str
    release_date: str

class RecommendationResponse(BaseModel):
    recommendations: List[MovieRecommendation]

class HistoryRecommendationRequest(BaseModel):
    top_n: int = 10

class HistoryRecommendationResponse(BaseModel):
    recommendations: List[MovieRecommendation]
    overall_match_score: str

class VoiceRecommendationRequest(BaseModel):
    top_n: int = 10

class VoiceRecommendationResponse(BaseModel):
    recommendations: List[MovieRecommendation]

class BlendCreateRequest(BaseModel):
    name: str  # blend name

class BlendInviteRequest(BaseModel):
    blend_code: str
    user_id: str  # user to invite

class BlendInvitationAction(BaseModel):
    invitation_id: str
    action: str  # "accept" or "decline"

class BlendInvitationOut(BaseModel):
    id: str
    blend_code: str
    invited_by_id: str
    status: str
    created_at: str

class BlendJoinRequest(BaseModel):
    code: str

class BlendRecommendation(BaseModel):
    title: str
    genres: List[str]
    match_score: float
    poster_path: str
    release_date: str

class BlendResponse(BaseModel):
    name: str
    blend_code: str
    users: List[str]
    user_tags: Dict[str, str]
    recommendations: List[BlendRecommendation]
    overall_match_score: str

class BlendSummary(BaseModel):
    code: str
    name: str

# === Database Setup ===
database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

users = sqlalchemy.Table(
    "users", metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("username", sqlalchemy.String, unique=True),
    sqlalchemy.Column("hashed_password", sqlalchemy.String),
)

# --- Watchlist tables ---
watchlist_groups = sqlalchemy.Table(
    "watchlist_groups", metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("user_id", sqlalchemy.String, sqlalchemy.ForeignKey("users.id")),
    sqlalchemy.Column("name", sqlalchemy.String),
    sqlalchemy.Column("cover_image", sqlalchemy.LargeBinary, nullable=True),  # Store binary image data
)

watchlists = sqlalchemy.Table(
    "watchlists", metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("group_id", sqlalchemy.String, sqlalchemy.ForeignKey("watchlist_groups.id")),
    sqlalchemy.Column("movie_id", sqlalchemy.String),
    sqlalchemy.Column("movie_name", sqlalchemy.String),
)

# --- Watch History table ---
watch_history = sqlalchemy.Table(
    "watch_history", metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("user_id", sqlalchemy.String, sqlalchemy.ForeignKey("users.id")),
    sqlalchemy.Column("movie_id", sqlalchemy.String),
    sqlalchemy.Column("movie_name", sqlalchemy.String),
    sqlalchemy.Column("watched_at", sqlalchemy.DateTime),
)

# --- Blend tables ---
blends = sqlalchemy.Table(
    "blends", metadata,
    sqlalchemy.Column("code", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("creator_id", sqlalchemy.String, sqlalchemy.ForeignKey("users.id")),
    sqlalchemy.Column("name", sqlalchemy.String, nullable=False),
)

blend_members = sqlalchemy.Table(
    "blend_members", metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("blend_code", sqlalchemy.String, sqlalchemy.ForeignKey("blends.code")),
    sqlalchemy.Column("user_id", sqlalchemy.String, sqlalchemy.ForeignKey("users.id")),
)

blend_invitations = sqlalchemy.Table(
    "blend_invitations", metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("blend_code", sqlalchemy.String, sqlalchemy.ForeignKey("blends.code")),
    sqlalchemy.Column("invited_user_id", sqlalchemy.String, sqlalchemy.ForeignKey("users.id")),
    sqlalchemy.Column("invited_by_id", sqlalchemy.String, sqlalchemy.ForeignKey("users.id")),
    sqlalchemy.Column("status", sqlalchemy.String, default="pending"),  # "pending", "accepted", "declined"
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, default=datetime.utcnow)
)

engine = sqlalchemy.create_engine(DATABASE_URL)
metadata.create_all(engine)

# === Security Helpers ===
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def create_token(user_id: str):
    return jwt.encode({"sub": user_id}, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        query = users.select().where(users.c.id == user_id)
        user = await database.fetch_one(query)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token signature")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth error: {str(e)}")


# === Startup/Shutdown ===
@app.on_event("startup")
async def startup():
    await database.connect()
    global tfidf, tfidf_matrix, movies, content_sim, mood_genre_mapping
    try:
        tfidf = joblib.load("./artifacts/tfidf_vectorizer.joblib")
        tfidf_matrix = joblib.load("./artifacts/tfidf_matrix.joblib")
        movies = joblib.load("./artifacts/movies_dataframe.joblib")
        content_sim = joblib.load("./artifacts/content_sim.joblib")
        mood_genre_mapping = joblib.load("./artifacts/mood_genre_mapping.joblib")
        print("✅ All ML artifacts loaded successfully")
    except Exception as e:
        print(f"⚠️ Warning: Could not load ML artifacts: {e}")
        # Initialize with empty/default values
        movies = pd.DataFrame()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# === Auth Routes ===
@app.post("/signup")
async def signup(user: UserCreate):
    try:
        query = users.select().where(users.c.username == user.username)
        if await database.fetch_one(query):
            raise HTTPException(status_code=400, detail="Username already exists")
        user_id = str(uuid.uuid4())
        hashed_pw = hash_password(user.password)
        query = users.insert().values(id=user_id, username=user.username, hashed_password=hashed_pw)
        await database.execute(query)
        return {"msg": "Signup successful"}
    except Exception as e:
        print(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        query = users.select().where(users.c.username == form_data.username)
        user = await database.fetch_one(query)
        if not user or not verify_password(form_data.password, user["hashed_password"]):
            raise HTTPException(status_code=400, detail="Invalid credentials")
        token = create_token(user["id"])
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/me")
async def read_users_me(user=Depends(get_current_user)):
    return {"id": user["id"], "username": user["username"]}

# === Recommendation Routes ===
@app.post("/recommend", response_model=RecommendationResponse)
async def recommend_by_mood(request: RecommendationRequest, user=Depends(get_current_user)):
    # Fetch the user's watch history from the DB
    movie_rows = await database.fetch_all(
        watch_history.select()
        .where(watch_history.c.user_id == user["id"])
        .order_by(watch_history.c.watched_at.desc())
    )
    user_history = [m["movie_name"] for m in movie_rows]

    try:
        df = recommend_movies_by_mood(
            mood=request.mood,
            user_history_titles=user_history,
            top_n=request.top_n
        )
        return {
            "recommendations": [
                {
                    "title": row.title,
                    "score": round(row.score, 4),
                    "genres": row['Genres'],
                    "poster_path": row['poster_path'],
                    "release_date": row['release_date'],
                    "id":row['Movie_id']
                } for _, row in df.iterrows()
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

from model import recommend_for_user

@app.post("/recommend/history", response_model=HistoryRecommendationResponse)
async def recommend_by_history(request: HistoryRecommendationRequest, user=Depends(get_current_user)):
    # Fetch user's watch history from DB
    movie_rows = await database.fetch_all(
        watch_history.select()
        .where(watch_history.c.user_id == user["id"])
        .order_by(watch_history.c.watched_at.desc())
    )
    user_history = [m["movie_name"] for m in movie_rows]

    try:
        recs = recommend_for_user(user_history, top_n=request.top_n)
        if isinstance(recs, list):
            # No recommendations, return empty list and default score
            recommendations = []
            overall_match_score = "0%"
        else:
            recommendations = recs.get("user_recommendations", [])
            overall_match_score = recs.get("overall_match_score", "0%")
        return {
            "recommendations": [
                {
                    "title": r["title"],
                    "score": r["match_score"],
                    "genres": r["genres"],
                    "poster_path": r["poster_path"],
                    "release_date": r["release_date"]
                } for r in recommendations
            ],
            "overall_match_score": overall_match_score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/recommend/voice", response_model=VoiceRecommendationResponse)
async def recommend_by_voice(
    audio: UploadFile = File(...),
    top_n: int = 10,
    user=Depends(get_current_user)
):
    # Fetch user's watch history from DB
    movie_rows = await database.fetch_all(
        watch_history.select()
        .where(watch_history.c.user_id == user["id"])
        .order_by(watch_history.c.watched_at.desc())
    )
    user_history = [m["movie_name"] for m in movie_rows]
    
    # Save the uploaded audio to a temporary file
    audio_bytes = await audio.read()
    temp_path = f"/tmp/{audio.filename}"
    with open(temp_path, "wb") as f:
        f.write(audio_bytes)
    
    try:
        df = handle_voice_search(temp_path, user_history_titles=user_history, top_n=top_n)
        recommendations = [
            {
                "title": row["title"],
                "score": float(row["score"]),
                "genres": row["Genres"],
                "poster_path": row["poster_path"],
                "release_date": row["release_date"]
            }
            for _, row in df.iterrows()
        ]
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        # Clean up temp file
        import os
        if os.path.exists(temp_path):
            os.remove(temp_path)

# === Watchlist Routes ===
@app.post("/watchlists", response_model=WatchlistGroupOut)
async def create_watchlist(
    name: str = Form(...),
    cover_image: Optional[UploadFile] = File(None),
    user=Depends(get_current_user)
):
    try:
        print(f"📝 Creating watchlist with name: '{name}'")
        
        if not name or not name.strip():
            raise HTTPException(status_code=400, detail="Watchlist name cannot be empty")
        
        # Check for existing watchlist
        query = watchlist_groups.select().where(
            (watchlist_groups.c.user_id == user["id"]) &
            (watchlist_groups.c.name == name.strip())
        )
        existing = await database.fetch_one(query)
        if existing:
            raise HTTPException(status_code=400, detail="Watchlist with this name already exists.")

        # Handle cover image
        image_bytes = None
        if cover_image and cover_image.filename:
            try:
                print(f"📷 Processing cover image: {cover_image.filename}")
                image_data = await cover_image.read()
                
                # Validate file size (5MB limit)
                if len(image_data) > 5 * 1024 * 1024:
                    raise HTTPException(status_code=400, detail="Image file too large. Maximum size is 5MB.")
                
                # Validate file type
                allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
                if cover_image.content_type not in allowed_types:
                    raise HTTPException(status_code=400, detail="Invalid image format. Allowed: JPEG, PNG, GIF, WebP")
                
                image_bytes = image_data
                print(f"✅ Image processed successfully, size: {len(image_bytes)} bytes")
            except HTTPException:
                raise
            except Exception as e:
                print(f"❌ Image processing error: {e}")
                raise HTTPException(status_code=400, detail="Failed to process image file")

        # Create watchlist
        group_id = str(uuid.uuid4())
        query = watchlist_groups.insert().values(
            id=group_id,
            user_id=user["id"],
            name=name.strip(),
            cover_image=image_bytes
        )
        await database.execute(query)
        
        print(f"✅ Watchlist created successfully with ID: {group_id}")

        return {
            "id": group_id,
            "name": name.strip(),
            "cover_image": base64.b64encode(image_bytes).decode() if image_bytes else None
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Create watchlist error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/watchlists", response_model=List[WatchlistGroupOut])
async def list_all_watchlists(user=Depends(get_current_user)):
    try:
        query = watchlist_groups.select().where(watchlist_groups.c.user_id == user["id"])
        rows = await database.fetch_all(query)
        return [{
            "id": row["id"],
            "name": row["name"],
            "cover_image": base64.b64encode(row["cover_image"]).decode() if row["cover_image"] else None
        } for row in rows]
    except Exception as e:
        print(f"List watchlists error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/watchlists/{group_id}/movies", status_code=201)
async def add_movie_to_watchlist(group_id: str, item: WatchlistCreate, user=Depends(get_current_user)):
    try:
        group = await database.fetch_one(watchlist_groups.select().where(
            (watchlist_groups.c.id == group_id) & (watchlist_groups.c.user_id == user["id"])
        ))
        if not group:
            raise HTTPException(status_code=404, detail="Watchlist not found")
        existing = await database.fetch_one(
            watchlists.select().where(
                (watchlists.c.group_id == group_id) & (watchlists.c.movie_id == item.movie_id)
            )
        )
        if existing:
            raise HTTPException(status_code=400, detail="Movie already in watchlist")
        movie_entry_id = str(uuid.uuid4())
        query = watchlists.insert().values(
            id=movie_entry_id,
            group_id=group_id,
            movie_id=item.movie_id,
            movie_name=item.movie_name
        )
        await database.execute(query)
        return {"msg": "Movie added to watchlist"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Add movie error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/watchlists/{group_id}", response_model=WatchlistDetailOut)
async def get_watchlist_detail(group_id: str, user=Depends(get_current_user)):
    try:
        group = await database.fetch_one(watchlist_groups.select().where(
            (watchlist_groups.c.id == group_id) & (watchlist_groups.c.user_id == user["id"])
        ))
        if not group:
            raise HTTPException(status_code=404, detail="Watchlist not found")

        query = watchlists.select().where(watchlists.c.group_id == group_id)
        movies_in_watchlist = await database.fetch_all(query)

        detailed_movies = []
        for m in movies_in_watchlist:
            movie_id = m["movie_id"]
            
            # Access global movies DataFrame correctly
            poster_path = ""
            release_date = ""
            if isinstance(movies, pd.DataFrame) and not movies.empty:
                # Filter using pandas DataFrame syntax
                movie_meta_row = movies[
                    movies['Movie_id'].astype(str).str.strip() == str(movie_id).strip()
                ]
                
                if not movie_meta_row.empty:
                    poster_path = movie_meta_row.iloc[0].get("poster_path", "")
                    release_date = movie_meta_row.iloc[0].get("release_date", "")

            detailed_movies.append({
                "id": m["id"],
                "movie_id": m["movie_id"],
                "movie_name": m["movie_name"],
                "poster_path": poster_path,
                "release_date": release_date
            })

        return {
            "id": group["id"],
            "name": group["name"],
            "cover_image": base64.b64encode(group["cover_image"]).decode() if group["cover_image"] else None,
            "movies": detailed_movies
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get watchlist detail error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/watchlists/{group_id}/movies/{movie_id}")
async def remove_movie_from_watchlist(group_id: str, movie_id: str, user=Depends(get_current_user)):
    try:
        group = await database.fetch_one(watchlist_groups.select().where(
            (watchlist_groups.c.id == group_id) & (watchlist_groups.c.user_id == user["id"])
        ))
        if not group:
            raise HTTPException(status_code=404, detail="Watchlist not found")
        query = watchlists.delete().where(
            (watchlists.c.group_id == group_id) & (watchlists.c.movie_id == movie_id)
        )
        await database.execute(query)
        return {"msg": "Movie removed from watchlist"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Remove movie error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/watchlists/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_watchlist(group_id: str, user=Depends(get_current_user)):
    try:
        # Check if the watchlist group exists and belongs to the user
        group = await database.fetch_one(watchlist_groups.select().where(
            (watchlist_groups.c.id == group_id) & (watchlist_groups.c.user_id == user["id"])
        ))
        if not group:
            raise HTTPException(status_code=404, detail="Watchlist not found")
        # Delete all movies in the watchlist group
        await database.execute(watchlists.delete().where(watchlists.c.group_id == group_id))
        # Delete the watchlist group
        await database.execute(watchlist_groups.delete().where(watchlist_groups.c.id == group_id))
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete watchlist error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# === Blend Routes ===
@app.post("/blend/create", response_model=BlendResponse)
async def create_blend_session(request: BlendCreateRequest, user=Depends(get_current_user)):
    try:
        code = str(uuid.uuid4())[:8]
        await database.execute(blends.insert().values(
            code=code,
            creator_id=user["id"],
            name=request.name
        ))
        await database.execute(blend_members.insert().values(
            id=str(uuid.uuid4()),
            blend_code=code,
            user_id=user["id"]
        ))
        return {
            "name": request.name,
            "blend_code": code,
            "users": [user["username"]],
            "user_tags": {},
            "recommendations": [],
            "overall_match_score": "0%"
        }
    except Exception as e:
        print(f"Create blend error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/blend/join", response_model=BlendResponse)
async def join_blend_session(request: BlendJoinRequest, user=Depends(get_current_user)):
    try:
        # 1. Check if blend exists
        blend = await database.fetch_one(
            blends.select().where(blends.c.code == request.code)
        )
        if not blend:
            raise HTTPException(status_code=404, detail="Blend not found.")

        # 2. Check if user is already a member
        member = await database.fetch_one(
            blend_members.select().where(
                (blend_members.c.blend_code == request.code) &
                (blend_members.c.user_id == user["id"])
            )
        )
        if not member:
            # Add user as a member
            await database.execute(
                blend_members.insert().values(
                    id=str(uuid.uuid4()),
                    blend_code=request.code,
                    user_id=user["id"]
                )
            )

        # 3. Fetch all members and build blend response
        members = await database.fetch_all(
            blend_members.select().where(blend_members.c.blend_code == request.code)
        )
        user_ids = [m["user_id"] for m in members]
        user_histories = []
        user_tags = {}
        usernames = []
        for uid in user_ids:
            movie_rows = await database.fetch_all(
                watch_history.select()
                .where(watch_history.c.user_id == uid)
                .order_by(watch_history.c.watched_at.desc())
            )
            history = [m["movie_name"] for m in movie_rows]
            user_histories.append(history)
            user_tags[uid] = assign_tag_from_movie_history(history)
            u = await database.fetch_one(users.select().where(users.c.id == uid))
            usernames.append(u["username"] if u else uid)
        
        recs = recommend_blend(user_histories)
        recommendations = recs.get("blend_recommendations", []) if isinstance(recs, dict) else recs
        overall_match_score = recs.get("overall_match_score", "0%") if isinstance(recs, dict) else "0%"
        
        return {
            "name": blend["name"],
            "blend_code": request.code,
            "users": usernames,
            "user_tags": user_tags,
            "recommendations": recommendations,
            "overall_match_score": overall_match_score
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Join blend error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/blends", response_model=List[BlendSummary])
async def list_all_blends(current_user: dict = Depends(get_current_user)):
    try:
        query = (
            select(blends.c.code, blends.c.name)
            .select_from(
                blends.join(blend_members, blends.c.code == blend_members.c.blend_code)
            )
            .where(blend_members.c.user_id == current_user["id"])
        )
        rows = await database.fetch_all(query)
        return [BlendSummary(code=r.code, name=r.name) for r in rows]
    except Exception as e:
        print(f"List blends error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/blend/{code}", response_model=BlendResponse)
async def get_blend_details(code: str, user=Depends(get_current_user)):
    try:
        # Check if user is a member of the blend
        member = await database.fetch_one(
            blend_members.select().where(
                (blend_members.c.blend_code == code) &
                (blend_members.c.user_id == user["id"])
            )
        )
        if not member:
            raise HTTPException(status_code=403, detail="You are not a member of this blend.")

        # Get blend info
        blend = await database.fetch_one(blends.select().where(blends.c.code == code))
        if not blend:
            raise HTTPException(status_code=404, detail="Blend not found")

        # Get all user_ids in this blend
        members = await database.fetch_all(
            blend_members.select().where(blend_members.c.blend_code == code)
        )
        user_ids = [m["user_id"] for m in members]

        # For each user, get their LATEST watch history from database
        user_histories = []
        user_tags = {}
        usernames = []
        for uid in user_ids:
            # Fetch FRESH watch history from database every time
            movie_rows = await database.fetch_all(
                watch_history.select()
                .where(watch_history.c.user_id == uid)
                .order_by(watch_history.c.watched_at.desc())
            )
            history = [m["movie_name"] for m in movie_rows]
            user_histories.append(history)
            
            # Generate user tag based on CURRENT history
            user_tags[uid] = assign_tag_from_movie_history(history)
            
            # Get username
            u = await database.fetch_one(users.select().where(users.c.id == uid))
            usernames.append(u["username"] if u else uid)

        # ALWAYS generate fresh recommendations from current members' histories
        print(f"🔄 Generating fresh blend recommendations for {len(user_histories)} users")
        recs = recommend_blend(user_histories)
        recommendations = recs.get("blend_recommendations", []) if isinstance(recs, dict) else recs
        overall_match_score = recs.get("overall_match_score", "0%") if isinstance(recs, dict) else "0%"

        print(f"✅ Generated {len(recommendations)} recommendations with {overall_match_score} match score")

        return {
            "name": blend["name"],
            "blend_code": code,
            "users": usernames,
            "user_tags": user_tags,
            "recommendations": recommendations,
            "overall_match_score": overall_match_score
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get blend details error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# === Watch History Routes ===
@app.post("/history/add")
async def add_to_watch_history(request: WatchHistoryAddRequest, user=Depends(get_current_user)):
    try:
        # Remove any previous instance of this movie for this user
        delete_query = watch_history.delete().where(
            (watch_history.c.user_id == user["id"]) &
            (watch_history.c.movie_id == request.movie_id)
        )
        await database.execute(delete_query)

        # Add the new (most recent) watch history entry
        entry_id = str(uuid.uuid4())
        insert_query = watch_history.insert().values(
            id=entry_id,
            user_id=user["id"],
            movie_id=request.movie_id,
            movie_name=request.movie_name,
            watched_at=datetime.utcnow()
        )
        await database.execute(insert_query)

        return {"msg": "Added to watch history"}
    except Exception as e:
        print(f"Add to history error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/history", response_model=List[WatchHistoryItem])
async def get_watch_history(user=Depends(get_current_user)):
    try:
        query = watch_history.select().where(
            watch_history.c.user_id == user["id"]
        ).order_by(watch_history.c.watched_at.desc())
        rows = await database.fetch_all(query)
        history = []
        for row in rows:
            poster_path = ""
            release_date = ""
            if isinstance(movies, pd.DataFrame) and not movies.empty:
                movie_id = str(row["movie_id"]).strip()
                movie_meta_row = movies[movies['Movie_id'].astype(str).str.strip() == movie_id]
                if not movie_meta_row.empty:
                    poster_path = movie_meta_row.iloc[0].get("poster_path", "")
                    release_date = movie_meta_row.iloc[0].get("release_date", "")
            history.append({
                "movie_id": row["movie_id"],
                "movie_name": row["movie_name"],
                "watched_at": row["watched_at"].isoformat() if row["watched_at"] else None,
                "poster_path": poster_path,
                "release_date": release_date
            })
        return history
    except Exception as e:
        print(f"Get history error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/")
def read_root():
    return {"message": "Movie Recommendation API is running."}

# Load movie data for search
try:
    df = pd.read_csv('./data/10000 Movies Data')
except:
    df = pd.DataFrame()  # Fallback if file doesn't exist

@app.get("/search")
def search_movies(title: str = Query(..., description="Movie title to search")):
    if df.empty:
        return {"message": "Movie database not available."}
    
    query = title.lower()
    results = df[df['title'].str.lower().str.contains(query, na=False)]

    if results.empty:
        return {"message": "No movies found with that name."}

    return results.to_dict(orient="records")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Movie Recommendation API...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📖 API docs will be available at: http://localhost:8000/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
