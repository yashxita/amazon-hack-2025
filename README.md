# CINEAI - AI-Powered Movie Recommendation Platform

CINEAI is a modern movie recommendation platform that combines individual preferences with collaborative filtering to provide personalized movie suggestions. The platform features individual watchlist management, mood-based recommendations, voice-powered descriptive search, collaborative "blend" sessions, and comprehensive watch history tracking.

## Features

### Mood-Based Recommendations
- Get movie suggestions based on your current mood
- AI-powered mood detection from user input
- Personalized recommendations using TF-IDF vectorization and cosine similarity

### Voice-Powered Search
- Search for movies using voice commands
- Get results based on descriptive searches
- Natural language processing for enhanced search results

### Collaborative Blends
- Create shared recommendation sessions with friends
- Join blend sessions using unique codes
- Get group recommendations based on combined watch histories
- Real-time collaboration features

### Watch History & Personalization
- Track your movie viewing history
- Get recommendations based on your viewing patterns
- Personalized user profiles and preferences

### Individual Watchlist Management
- Maintain multiple watchlists as per need
- Provides recommendation based on watch history
- Easy-to-navigate user interface

### Advanced Search & Discovery
- Search movies by title, genre, or description
- TMDB API integration for rich movie metadata
- Trending movies and popular recommendations

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight database with SQLAlchemy ORM
- **JWT Authentication** - Secure user authentication
- **Pydantic** - Data validation and serialization

### Machine Learning
- **scikit-learn** - TF-IDF vectorization and cosine similarity
- **pandas** - Data manipulation and analysis
- **joblib** - Model persistence and caching
- **OpenAI Whisper API** - Speech recognition

### External APIs
- **TMDB API** - Movie metadata and posters
- **OpenAI Whisper** - Voice transcription

## Architecture

CINEAI follows a three-tier architecture:

```
Frontend (Next.js) ↔ Backend (FastAPI) ↔ ML Engine + Database (SQLite)
```

### Key Components
- **API Service Layer** (`frontend/services/api.ts`) - Frontend-backend communication
- **FastAPI Backend** (`backend/main.py`) - HTTP endpoints and business logic
- **ML Recommendation Engine** (`backend/model.py`) - Recommendation algorithms
- **Database Layer** - User management and data persistence

## API Endpoints

### Authentication
- `POST /signup` - User registration
- `POST /login` - User login
- `GET /me` - Get current user profile

### Recommendations
- `POST /recommend` - Get mood-based recommendations
- `POST /recommend/history` - Get history-based recommendations
- `POST /recommend/voice` - Voice-powered descriptive recommendations

### Collaborative Features
- `POST /blend/create` - Create a new blend session
- `POST /blend/join` - Join an existing blend
- `GET /blends` - List user's blend sessions
- `GET /blend/{code}` - Get blend details

### User Data
- `POST /history/add` - Add movie to watch history
- `GET /history` - Get user's watch history
- `POST /watchlists` - Create watchlist
- `GET /watchlists` - Get user's watchlists

## Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `watch_history` - User movie viewing history
- `watchlist_groups` & `watchlists` - User movie collections
- `blends` & `blend_members` - Collaborative recommendation sessions

## Machine Learning Pipeline

The recommendation engine uses:
1. **TF-IDF Vectorization** - Convert movie features to numerical vectors
2. **Cosine Similarity** - Calculate movie similarity scores
3. **Weighted Rating System** - Combine popularity and ratings
4. **Collaborative Filtering** - Group-based recommendations for blends
