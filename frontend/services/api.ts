import axios from "axios"

// ============================================================================
// MOVIE RECOMMENDATION INTERFACES & FUNCTIONS
// ============================================================================

export interface RecommendationRequest {
  mood: string
  user_history?: string[]
  top_n?: number
}

export interface MovieRecommendation {
  id: string
  title: string
  score: number
  genres: string[]
  poster_path: string
  release_date: string
}

export interface RecommendationResponse {
  recommendations: MovieRecommendation[]
}

export interface HistoryRecommendationResponse {
  recommendations: MovieRecommendation[]
  overall_match_score: string
}

export async function getRecommendations(mood: string): Promise<RecommendationResponse["recommendations"]> {
  const token = localStorage.getItem("token")

  const requestBody: RecommendationRequest = {
    mood,
    top_n: 20,
  }

  try {
    const response = await axios.post<RecommendationResponse>("http://localhost:8000/recommend", requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data.recommendations
  } catch (error: any) {
    console.error("Failed to fetch recommendations:", error.response?.data || error.message)
    return []
  }
}

export async function getHistoryBasedRecommendations(top_n = 20): Promise<HistoryRecommendationResponse> {
  const token = localStorage.getItem("token")

  try {
    const response = await axios.post<HistoryRecommendationResponse>(
      "http://localhost:8000/recommend/history",
      { top_n },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return response.data
  } catch (error: any) {
    console.error("Failed to fetch history-based recommendations:", error.response?.data || error.message)
    return {
      recommendations: [],
      overall_match_score: "0%",
    }
  }
}

// ============================================================================
// AUTHENTICATION INTERFACES & FUNCTIONS
// ============================================================================

export interface User {
  id: string
  username: string
}

export interface SignupRequest {
  username: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  message: string
  access_token: string
  user: User
}

export interface ApiError {
  error: string
}

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

// ============================================================================
// AUTH API FUNCTIONS
// ============================================================================

export async function signup(userData: SignupRequest): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>("/signup", userData)
    return response.data
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || "Signup failed"
    throw new Error(errorMessage)
  }
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    const formData = new URLSearchParams()
    formData.append("username", credentials.username)
    formData.append("password", credentials.password)

    const response = await apiClient.post<AuthResponse>("/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    return response.data
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || "Login failed"
    throw new Error(errorMessage)
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiClient.get<{ user: User }>("/me")
    return response.data.user
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || "Failed to get user info"
    throw new Error(errorMessage)
  }
}

export async function logout(): Promise<void> {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  } catch (error) {
    console.error("Logout error:", error)
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }
}

// ============================================================================
// BLEND – SHARED-LIST RECOMMENDATION SESSIONS
// ============================================================================

// Interfaces returned by backend (see FastAPI Pydantic models)
export interface BlendRecommendation {
  poster_path: string;
  title: string;
  genres: string[];
  match_score: number;
}

export interface BlendResponse {
  name: string;
  blend_code: string;
  users: string[];
  user_tags: Record<string, string>;
  recommendations: BlendRecommendation[];
  overall_match_score: string; // e.g. "87%"
}

export interface BlendSummary {
  code: string;
  name: string;
}

// ----------- Requests ------------
export interface CreateBlendRequest {
  name: string;
}

export interface InviteBlendRequest {
  blend_code: string;
  user_id: string;
}

export interface JoinBlendRequest {
  code: string;
}

export interface InviteBlendResponse {
  msg: string;
}

// ----------- API Calls -----------

export async function createBlend(payload: CreateBlendRequest): Promise<BlendResponse> {
  // correct FastAPI route is POST /blend/create
  const res = await apiClient.post<BlendResponse>("/blend/create", payload);
  return res.data;
}

export async function inviteToBlend(payload: InviteBlendRequest): Promise<InviteBlendResponse> {
  const res = await apiClient.post<InviteBlendResponse>("/blend/invite", payload);
  return res.data;
}

export async function joinBlend(payload: JoinBlendRequest): Promise<BlendResponse> {
  const res = await apiClient.post<BlendResponse>("/blend/join", payload);
  return res.data;
}

export async function listBlends(): Promise<BlendSummary[]> {
  const res = await apiClient.get<BlendSummary[]>("/blends");
  return res.data;
}

export async function getBlend(code: string): Promise<BlendResponse> {
  const res = await apiClient.get<BlendResponse>(`/blend/${code}`);
  return res.data;
}

export async function deleteBlend(code: string): Promise<void> {
  await apiClient.delete(`/blend/${code}`);
}

// ============================================================================
// TOKEN MANAGEMENT UTILITIES
// ============================================================================

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("token", token)
}

export function removeStoredToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch {
    return true
  }
}

// ============================================================================
// WATCH HISTORY API - DIRECT TO DATABASE
// ============================================================================

export interface WatchHistoryItem {
  movie_id: string
  movie_name: string
  watched_at: string
}

export interface AddToHistoryRequest {
  movie_id: string
  movie_name: string
}

// Add movie to watch history (directly to database)
export async function addToWatchHistory(movie: AddToHistoryRequest): Promise<void> {
  try {
    await apiClient.post("/history/add", movie)
  } catch (error: any) {
    console.error("Failed to add to watch history:", error.response?.data || error.message)
    throw new Error("Failed to add movie to watch history")
  }
}

// Get user's watch history from database
export async function getWatchHistory(): Promise<WatchHistoryItem[]> {
  try {
    const response = await apiClient.get<WatchHistoryItem[]>("/history")
    return response.data
  } catch (error: any) {
    console.error("Failed to get watch history:", error.response?.data || error.message)
    return []
  }
}

// Bulk add movies to watch history (for migration purposes)
export async function bulkAddToWatchHistory(movies: AddToHistoryRequest[]): Promise<void> {
  try {
    // Add movies one by one to ensure proper error handling
    for (const movie of movies) {
      await addToWatchHistory(movie)
    }
  } catch (error: any) {
    console.error("Failed to bulk add to watch history:", error)
    throw new Error("Failed to add movies to watch history")
  }
}

// ============================================================================
// WATCHLIST API FUNCTIONS
// ============================================================================

export interface WatchlistGroup {
  id: string
  name: string
}

export interface WatchlistMovie {
  id: string
  movie_id: string
  movie_name: string
  poster_path: string
}

export interface WatchlistDetail {
  id: string
  name: string
  movies: WatchlistMovie[]
}

export interface CreateWatchlistRequest {
  name: string
}

export interface AddMovieToWatchlistRequest {
  movie_id: string
  movie_name: string
}

// Create a new watchlist
export async function createWatchlist(watchlist: CreateWatchlistRequest): Promise<WatchlistGroup> {
  try {
    const response = await apiClient.post<WatchlistGroup>("/watchlists", watchlist)
    return response.data
  } catch (error: any) {
    console.error("Failed to create watchlist:", error.response?.data || error.message)
    throw new Error("Failed to create watchlist")
  }
}

// Get all user's watchlists
export async function getWatchlists(): Promise<WatchlistGroup[]> {
  try {
    const response = await apiClient.get<WatchlistGroup[]>("/watchlists")
    return response.data
  } catch (error: any) {
    console.error("Failed to get watchlists:", error.response?.data || error.message)
    return []
  }
}

// Get watchlist details with movies
export async function getWatchlistDetail(watchlistId: string): Promise<WatchlistDetail | null> {
  try {
    const response = await apiClient.get<WatchlistDetail>(`/watchlists/${watchlistId}`)
    return response.data
  } catch (error: any) {
    console.error("Failed to get watchlist detail:", error.response?.data || error.message)
    return null
  }
}

// Add movie to watchlist
export async function addMovieToWatchlist(watchlistId: string, movie: AddMovieToWatchlistRequest): Promise<void> {
  try {
    await apiClient.post(`/watchlists/${watchlistId}/movies`, movie)
  } catch (error: any) {
    console.error("Failed to add movie to watchlist:", error.response?.data || error.message)
    throw new Error("Failed to add movie to watchlist")
  }
}

// Remove movie from watchlist
export async function removeMovieFromWatchlist(watchlistId: string, movieId: string): Promise<void> {
  try {
    await apiClient.delete(`/watchlists/${watchlistId}/movies/${movieId}`)
  } catch (error: any) {
    console.error("Failed to remove movie from watchlist:", error.response?.data || error.message)
    throw new Error("Failed to remove movie from watchlist")
  }
}

// Delete entire watchlist
export async function deleteWatchlist(watchlistId: string): Promise<void> {
  try {
    await apiClient.delete(`/watchlists/${watchlistId}`)
  } catch (error: any) {
    console.error("Failed to delete watchlist:", error.response?.data || error.message)
    throw new Error("Failed to delete watchlist")
  }
}

// ============================================================================
// API HEALTH CHECK
// ============================================================================

export async function checkApiHealth(): Promise<boolean> {
  try {
    await apiClient.get("/")
    return true
  } catch {
    return false
  }
}

// ============================================================================
// UTILITY FUNCTIONS FOR MOVIE INTERACTIONS
// ============================================================================

// Mark movie as watched (adds to history and can remove from watchlist)
export async function markMovieAsWatched(
  movie: { movie_id: string; movie_name: string },
  watchlistId?: string,
): Promise<void> {
  try {
    // Add to watch history
    await addToWatchHistory(movie)

    // Optionally remove from watchlist if provided
    if (watchlistId) {
      await removeMovieFromWatchlist(watchlistId, movie.movie_id)
    }
  } catch (error: any) {
    console.error("Failed to mark movie as watched:", error)
    throw new Error("Failed to mark movie as watched")
  }
}

// Get personalized recommendations based on user's watch history
export async function getPersonalizedRecommendations(
  top_n = 20,
): Promise<{ recommendations: MovieRecommendation[]; matchScore: string }> {
  try {
    const result = await getHistoryBasedRecommendations(top_n)
    return {
      recommendations: result.recommendations,
      matchScore: result.overall_match_score,
    }
  } catch (error: any) {
    console.error("Failed to get personalized recommendations:", error)
    return {
      recommendations: [],
      matchScore: "0%",
    }
  }
}

export async function getWatchlist(watchlistId: string): Promise<WatchlistDetail | null> {
  try {
    const response = await apiClient.get<WatchlistDetail>(`/watchlists/${watchlistId}`)
    return response.data
  } catch (error: any) {
    console.error("Failed to get watchlist detail:", error.response?.data || error.message)
    return null
  }
}

export async function addHardcodedHistory(): Promise<void> {
  const movies = prompt(
    "Enter your movie history (comma-separated):\nExample: Inception, The Matrix, Interstellar, The Dark Knight",
  )

  if (!movies) return

  const movieList = movies
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)

  for (const movie of movieList) {
    try {
      await addToWatchHistory({
        movie_id: `hardcoded_${Date.now()}_${Math.random()}`,
        movie_name: movie,
      })
    } catch (error) {
      console.error(`Failed to add ${movie}:`, error)
    }
  }
}
// export async function addToWatchHistory(payload: WatchHistoryAddRequest): Promise<{ msg: string }> {
//   const res = await apiClient.post("/history/add", payload)
//   return res.data
// }
export interface WatchHistoryAddRequest {
  movie_id: string
  movie_name: string
}