from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import jwt, JWTError
from pydantic import BaseModel
from typing import Optional, List, Dict
from dotenv import load_dotenv
import databases, sqlalchemy, joblib, asyncio, os, uuid

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

class WatchlistCreate(BaseModel):
    movie_id: str
    movie_name: str

class WatchlistUpdate(BaseModel):
    movie_name: str

class RecommendationRequest(BaseModel):
    mood: str
    user_history: Optional[List[str]] = []
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
    user_history: List[str]
    user_id: str = "User1"

class BlendJoinRequest(BaseModel):
    code: str
    user_history: List[str]
    user_id: str = "User2"

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

# === Database Setup ===
database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

users = sqlalchemy.Table(
    "users", metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("username", sqlalchemy.String, unique=True),
    sqlalchemy.Column("hashed_password", sqlalchemy.String),
)

watchlists = sqlalchemy.Table(
    "watchlists", metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("user_id", sqlalchemy.String, sqlalchemy.ForeignKey("users.id")),
    sqlalchemy.Column("movie_id", sqlalchemy.String),
    sqlalchemy.Column("movie_name", sqlalchemy.String),
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
            raise HTTPException(status_code=401, detail="Invalid token")
        query = users.select().where(users.c.id == user_id)
        return await database.fetch_one(query)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

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

# === Watchlist Routes ===
@app.post("/watchlist", status_code=201)
async def create_watchlist(item: WatchlistCreate, user=Depends(get_current_user)):
    existing = await database.fetch_one(
        watchlists.select().where(
            (watchlists.c.user_id == user["id"]) & (watchlists.c.movie_id == item.movie_id)
        )
    )
    if existing:
        raise HTTPException(status_code=400, detail="Movie already in watchlist")
    query = watchlists.insert().values(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        movie_id=item.movie_id,
        movie_name=item.movie_name
    )
    await database.execute(query)
    return {"msg": "Movie added to watchlist"}

@app.get("/watchlist")
async def read_watchlist(user=Depends(get_current_user)):
    query = watchlists.select().where(watchlists.c.user_id == user["id"])
    return await database.fetch_all(query)

@app.put("/watchlist/{movie_id}")
async def update_watchlist(movie_id: str, item: WatchlistUpdate, user=Depends(get_current_user)):
    query = watchlists.update().where(
        (watchlists.c.user_id == user["id"]) & (watchlists.c.movie_id == movie_id)
    ).values(movie_name=item.movie_name)
    await database.execute(query)
    return {"msg": "Movie updated"}

@app.delete("/watchlist/{movie_id}")
async def delete_watchlist(movie_id: str, user=Depends(get_current_user)):
    query = watchlists.delete().where(
        (watchlists.c.user_id == user["id"]) & (watchlists.c.movie_id == movie_id)
    )
    await database.execute(query)
    return {"msg": "Movie removed from watchlist"}

# === Recommendation Routes ===
@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    try:
        df = recommend_movies_by_mood(
            mood=request.mood,
            user_history_titles=request.user_history,
            top_n=request.top_n
        )
        return {
            "recommendations": [
                {
                    "title": row.title,
                    "score": round(row.score, 4),
                    "genres": row['Genres'],
                    "poster_path": row['poster_path'],
                    "release_date": row['release_date']
                } for _, row in df.iterrows()
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/blend/create", response_model=BlendResponse)
async def create_blend_session(request: BlendCreateRequest):
    code = create_blend_code(request.user_history, request.user_id)
    result = join_blend_code(code, request.user_history, request.user_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    recs = result["recommendations"]
    recommendations = recs.get("blend_recommendations", []) if isinstance(recs, dict) else recs
    overall_match_score = recs.get("overall_match_score", "0%") if isinstance(recs, dict) else "0%"
    return {
        "blend_code": code,
        "users": result["users"],
        "user_tags": result["user_tags"],
        "recommendations": recommendations,
        "overall_match_score": overall_match_score
    }

@app.post("/blend/join", response_model=BlendResponse)
async def join_blend_session(request: BlendJoinRequest):
    result = join_blend_code(request.code, request.user_history, request.user_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    recs = result["recommendations"]
    recommendations = recs.get("blend_recommendations", []) if isinstance(recs, dict) else recs
    overall_match_score = recs.get("overall_match_score", "0%") if isinstance(recs, dict) else "0%"
    return {
        "blend_code": request.code,
        "users": result["users"],
        "user_tags": result["user_tags"],
        "recommendations": recommendations,
        "overall_match_score": overall_match_score
    }

# === Root ===
@app.get("/")
def read_root():
    return {"message": "Movie Recommendation API is running."}

# === Run with Uvicorn ===
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
