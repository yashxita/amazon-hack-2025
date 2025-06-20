from fastapi import FastAPI, HTTPException, Depends, Response, status
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

from model import (
    recommend_movies_by_mood,
    recommend_blend,
    assign_tag_from_movie_history,
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

class WatchlistCreate(BaseModel):
    movie_id: str
    movie_name: str

class WatchlistMovieOut(BaseModel):
    id: str
    movie_id: str
    movie_name: str

class WatchlistDetailOut(BaseModel):
    id: str
    name: str
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

class BlendResponse(BaseModel):
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

engine = sqlalchemy.create_engine(DATABASE_URL.replace("aiosqlite", "pysqlite"))
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
    tfidf = joblib.load("./artifacts/tfidf_vectorizer.joblib")
    tfidf_matrix = joblib.load("./artifacts/tfidf_matrix.joblib")
    movies = joblib.load("./artifacts/movies_dataframe.joblib")
    content_sim = joblib.load("./artifacts/content_sim.joblib")
    mood_genre_mapping = joblib.load("./artifacts/mood_genre_mapping.joblib")

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# === Auth Routes ===
@app.post("/signup")
async def signup(user: UserCreate):
    query = users.select().where(users.c.username == user.username)
    if await database.fetch_one(query):
        raise HTTPException(status_code=400, detail="Username already exists")
    user_id = str(uuid.uuid4())
    hashed_pw = hash_password(user.password)
    query = users.insert().values(id=user_id, username=user.username, hashed_password=hashed_pw)
    await database.execute(query)
    return {"msg": "Signup successful"}

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    query = users.select().where(users.c.username == form_data.username)
    user = await database.fetch_one(query)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_token(user["id"])
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me")
async def read_users_me(user=Depends(get_current_user)):
    return {"id": user["id"], "username": user["username"]}

# === Recommendation Routes ===
@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest, user=Depends(get_current_user)):
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

# === Watchlist Routes ===
@app.post("/watchlists", response_model=WatchlistGroupOut)
async def create_watchlist(item: WatchlistGroupCreate, user=Depends(get_current_user)):
    query = watchlist_groups.select().where(
        (watchlist_groups.c.user_id == user["id"]) &
        (watchlist_groups.c.name == item.name)
    )
    existing = await database.fetch_one(query)
    if existing:
        raise HTTPException(status_code=400, detail="Watchlist already exists.")
    group_id = str(uuid.uuid4())
    query = watchlist_groups.insert().values(id=group_id, user_id=user["id"], name=item.name)
    await database.execute(query)
    return {"id": group_id, "name": item.name}

@app.get("/watchlists", response_model=List[WatchlistGroupOut])
async def list_all_watchlists(user=Depends(get_current_user)):
    query = watchlist_groups.select().where(watchlist_groups.c.user_id == user["id"])
    rows = await database.fetch_all(query)
    return [{"id": row["id"], "name": row["name"]} for row in rows]

@app.post("/watchlists/{group_id}/movies", status_code=201)
async def add_movie_to_watchlist(group_id: str, item: WatchlistCreate, user=Depends(get_current_user)):
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

@app.get("/watchlists/{group_id}", response_model=WatchlistDetailOut)
async def get_watchlist_detail(group_id: str, user=Depends(get_current_user)):
    group = await database.fetch_one(watchlist_groups.select().where(
        (watchlist_groups.c.id == group_id) & (watchlist_groups.c.user_id == user["id"])
    ))
    if not group:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    query = watchlists.select().where(watchlists.c.group_id == group_id)
    movies = await database.fetch_all(query)
    return {
        "id": group["id"],
        "name": group["name"],
        "movies": [
            {"id": m["id"], "movie_id": m["movie_id"], "movie_name": m["movie_name"]}
            for m in movies
        ]
    }

@app.delete("/watchlists/{group_id}/movies/{movie_id}")
async def remove_movie_from_watchlist(group_id: str, movie_id: str, user=Depends(get_current_user)):
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

@app.delete("/watchlists/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_watchlist(group_id: str, user=Depends(get_current_user)):
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

# === Blend Routes ===
@app.post("/blend/create", response_model=BlendResponse)
async def create_blend_session(request: BlendCreateRequest, user=Depends(get_current_user)):
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
        "blend_code": code,
        "users": [user["username"]],
        "user_tags": {},
        "recommendations": [],
        "overall_match_score": ""
    }

@app.post("/blend/invite")
async def invite_to_blend(request: BlendInviteRequest, user=Depends(get_current_user)):
    # Check blend exists and user is a member
    blend = await database.fetch_one(blends.select().where(blends.c.code == request.blend_code))
    if not blend:
        raise HTTPException(status_code=404, detail="Blend not found")
    member = await database.fetch_one(
        blend_members.select().where(
            (blend_members.c.blend_code == request.blend_code) & (blend_members.c.user_id == user["id"])
        )
    )
    if not member:
        raise HTTPException(status_code=403, detail="You are not a member of this blend")
    # Check user to invite exists
    invited_user = await database.fetch_one(users.select().where(users.c.id == request.user_id))
    if not invited_user:
        raise HTTPException(status_code=404, detail="User not found")
    # Create invitation
    invite_id = str(uuid.uuid4())
    await database.execute(blend_invitations.insert().values(
        id=invite_id,
        blend_code=request.blend_code,
        invited_user_id=request.user_id,
        invited_by_id=user["id"],
        status="pending",
        created_at=datetime.utcnow()
    ))
    return {"msg": "Invitation sent"}

@app.post("/blend/invitation/respond")
async def respond_to_blend_invitation(request: BlendInvitationAction, user=Depends(get_current_user)):
    # Fetch invitation
    invite = await database.fetch_one(
        blend_invitations.select().where(
            (blend_invitations.c.id == request.invitation_id) &
            (blend_invitations.c.invited_user_id == user["id"])
        )
    )
    if not invite or invite["status"] != "pending":
        raise HTTPException(status_code=404, detail="Invitation not found or already handled")
    # Update status
    await database.execute(
        blend_invitations.update()
        .where(blend_invitations.c.id == request.invitation_id)
        .values(status=request.action)
    )
    if request.action == "accept":
        # Add user to blend_members
        await database.execute(
            blend_members.insert().values(
                id=str(uuid.uuid4()),
                blend_code=invite["blend_code"],
                user_id=user["id"]
            )
        )
    return {"msg": "Invitation {}".format(request.action)}

@app.post("/blend/join", response_model=BlendResponse)
async def join_blend_session(request: BlendJoinRequest, user=Depends(get_current_user)):
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

    # 3. Fetch all members and build blend response as before
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
        "blend_code": request.code,
        "users": usernames,
        "user_tags": user_tags,
        "recommendations": recommendations,
        "overall_match_score": overall_match_score
    }

@app.get("/blend/invitations", response_model=List[BlendInvitationOut])
async def get_my_blend_invitations(user=Depends(get_current_user)):
    # Query all pending invitations for the current user
    query = blend_invitations.select().where(
        (blend_invitations.c.invited_user_id == user["id"]) &
        (blend_invitations.c.status == "pending")
    )
    invites = await database.fetch_all(query)
    # Format the results as a list of dicts
    return [
        {
            "id": inv["id"],
            "blend_code": inv["blend_code"],
            "invited_by_id": inv["invited_by_id"],
            "status": inv["status"],
            "created_at": inv["created_at"].isoformat() if inv["created_at"] else None
        }
        for inv in invites
    ]

@app.get("/blends", response_model=List[BlendSummary])
async def list_all_blends(user=Depends(get_current_user)):
    # Get all blend membership records for this user
    member_rows = await database.fetch_all(
        blend_members.select().where(blend_members.c.user_id == user["id"])
    )
    blend_codes = [row["blend_code"] for row in member_rows]
    if not blend_codes:
        return []
    blends_query = blends.select().where(blends.c.code.in_(blend_codes))
    blends_info = await database.fetch_all(blends_query)
    # Only return blends that actually exist (ignore None)
    return [
        {"code": b["code"], "name": b["name"] or "Unnamed Blend"}
        for b in blends_info if b["name"] is not None
    ]

@app.get("/blend/{code}", response_model=BlendResponse)
async def get_blend_details(code: str, user=Depends(get_current_user)):
    # Check if user is a member of the blend
    member = await database.fetch_one(
        blend_members.select().where(
            (blend_members.c.blend_code == code) &
            (blend_members.c.user_id == user["id"])
        )
    )
    if not member:
        raise HTTPException(status_code=403, detail="You are not a member of this blend.")

    # Get all user_ids in this blend
    members = await database.fetch_all(
        blend_members.select().where(blend_members.c.blend_code == code)
    )
    user_ids = [m["user_id"] for m in members]

    # For each user, get their watch history
    user_histories = []
    user_tags = {}
    usernames = []
    for uid in user_ids:
        # Fetch watch history from database
        movie_rows = await database.fetch_all(
            watch_history.select()
            .where(watch_history.c.user_id == uid)
            .order_by(watch_history.c.watched_at.desc())
        )
        history = [m["movie_name"] for m in movie_rows]
        user_histories.append(history)
        
        # Generate user tag based on history
        user_tags[uid] = assign_tag_from_movie_history(history)
        
        # Get username
        u = await database.fetch_one(users.select().where(users.c.id == uid))
        usernames.append(u["username"] if u else uid)

    # Generate recommendations from all members' histories
    recs = recommend_blend(user_histories)
    recommendations = recs.get("blend_recommendations", []) if isinstance(recs, dict) else recs
    overall_match_score = recs.get("overall_match_score", "0%") if isinstance(recs, dict) else "0%"

    return {
        "blend_code": code,
        "users": usernames,
        "user_tags": user_tags,
        "recommendations": recommendations,
        "overall_match_score": overall_match_score
    }

@app.delete("/blend/{code}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blend(code: str, user=Depends(get_current_user)):
    # Check if blend exists and user is the creator
    blend = await database.fetch_one(blends.select().where(
        (blends.c.code == code) & (blends.c.creator_id == user["id"])
    ))
    if not blend:
        raise HTTPException(status_code=404, detail="Blend not found or you are not the creator")
    # Delete all blend members
    await database.execute(blend_members.delete().where(blend_members.c.blend_code == code))
    # Delete the blend
    await database.execute(blends.delete().where(blends.c.code == code))
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# === Watch History Routes ===
@app.post("/history/add")
async def add_to_watch_history(request: WatchHistoryAddRequest, user=Depends(get_current_user)):
    entry_id = str(uuid.uuid4())
    await database.execute(
        watch_history.insert().values(
            id=entry_id,
            user_id=user["id"],
            movie_id=request.movie_id,
            movie_name=request.movie_name,
            watched_at=datetime.utcnow()
        )
    )
    return {"msg": "Added to watch history"}

@app.get("/history", response_model=List[WatchHistoryItem])
async def get_watch_history(user=Depends(get_current_user)):
    # Fetch watch history for the current user, most recent first
    query = watch_history.select().where(
        watch_history.c.user_id == user["id"]
    ).order_by(watch_history.c.watched_at.desc())
    rows = await database.fetch_all(query)
    return [
        {
            "movie_id": row["movie_id"],
            "movie_name": row["movie_name"],
            "watched_at": row["watched_at"].isoformat() if row["watched_at"] else None
        }
        for row in rows
    ]

@app.get("/")
def read_root():
    return {"message": "Movie Recommendation API is running."}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

