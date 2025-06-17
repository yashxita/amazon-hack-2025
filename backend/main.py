from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import asyncio
from typing import Optional, List, Dict

from model import (
    recommend_movies_by_mood,
    recommend_blend,
    assign_tag_from_movie_history,
    extract_genres,  # or extract_genres_from_string, as needed
    create_blend_code,
    join_blend_code,
    movie_title_to_genres  # if used by your tag assignment
)

app = FastAPI(title="Movie Recommendation API")

@app.get("/")
def read_root():
    return {"message": "Movie Recommendation API is running."}

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load artifacts at startup
@app.on_event("startup")
def load_artifacts():
    global tfidf, tfidf_matrix, movies, content_sim, mood_genre_mapping
    tfidf = joblib.load("tfidf_vectorizer.joblib")
    tfidf_matrix = joblib.load("tfidf_matrix.joblib")
    movies = joblib.load("movies_dataframe.joblib")
    content_sim = joblib.load("content_sim.joblib")
    mood_genre_mapping = joblib.load("mood_genre_mapping.joblib")

# Pydantic models
class RecommendationRequest(BaseModel):
    mood: str
    user_history: Optional[List[str]] = []
    top_n: int = 10

class MovieRecommendation(BaseModel):
    title: str
    score: float
    genres: List[str]

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

shared_blend_codes = {}
lock = asyncio.Lock()  # For thread safety

@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    try:
        # Use the imported function and pass required globals
        df = recommend_movies_by_mood(
            mood=request.mood,
            user_history_titles=request.user_history,
            top_n=request.top_n
        )
        # df should be a DataFrame with columns ['title', 'score', 'genres']
        return {
            "recommendations": [
                {
                    "title": row.title,
                    "score": round(row.score, 4),
                    "genres": row.genres
                } for _, row in df.iterrows()
            ]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/blend/create", response_model=BlendResponse)
async def create_blend_session(request: BlendCreateRequest):
    code = create_blend_code(request.user_history, request.user_id)
    result = join_blend_code(code, request.user_history, request.user_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    recs = result["recommendations"]
    if isinstance(recs, dict):
        recommendations = recs.get("blend_recommendations", [])
        overall_match_score = recs.get("overall_match_score", "0%")
    else:  # recs is a list (empty or fallback)
        recommendations = recs
        overall_match_score = "0%"
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
    if isinstance(recs, dict):
        recommendations = recs.get("blend_recommendations", [])
        overall_match_score = recs.get("overall_match_score", "0%")
    else:
        recommendations = recs
        overall_match_score = "0%"
    return {
        "blend_code": request.code,
        "users": result["users"],
        "user_tags": result["user_tags"],
        "recommendations": recommendations,
        "overall_match_score": overall_match_score
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)