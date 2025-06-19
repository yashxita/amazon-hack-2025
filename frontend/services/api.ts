import axios from "axios";

// ============================================================================
// MOVIE RECOMMENDATION INTERFACES & FUNCTIONS
// ============================================================================

export interface RecommendationRequest {
  mood: string;
  user_history?: string[];
  top_n?: number;
}

export interface MovieRecommendation {
  title: string;
  score: number;
  genres: string[];
  poster_path: string;
  release_date: string;
}

export interface RecommendationResponse {
  recommendations: MovieRecommendation[];
}

export async function getRecommendations(
  mood: string
): Promise<RecommendationResponse["recommendations"]> {
  const requestBody: RecommendationRequest = {
    mood,
    user_history: ["Inception", "The Matrix"], // Dummy history
    top_n: 20,
  };

  try {
    const response = await axios.post<RecommendationResponse>(
      "http://0.0.0.0:8000/recommend",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.recommendations;
  } catch (error: any) {
    console.error(
      "Failed to fetch recommendations:",
      error.response?.data || error.message
    );
    return [];
  }
}

// ============================================================================
// AUTHENTICATION INTERFACES & FUNCTIONS
// ============================================================================

export interface User {
  id: string;
  username: string;
}

export interface SignupRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface ApiError {
  error: string;
}

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: "http://0.0.0.0:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH API FUNCTIONS
// ============================================================================

export async function signup(userData: SignupRequest): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>("/signup", userData);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || "Signup failed";
    throw new Error(errorMessage);
  }
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    const formData = new URLSearchParams();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await apiClient.post<AuthResponse>("/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || "Login failed";
    throw new Error(errorMessage);
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiClient.get<{ user: User }>("/me");
    return response.data.user;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error || "Failed to get user info";
    throw new Error(errorMessage);
  }
}

export async function logout(): Promise<void> {
  try {
    // Optional: await apiClient.post("/api/logout");

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  } catch (error) {
    console.error("Logout error:", error);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }
}


// ============================================================================
// TOKEN MANAGEMENT UTILITIES
// ============================================================================

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

export function removeStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
}

// ============================================================================
// USER PREFERENCES API (Future Enhancement)
// ============================================================================

export interface UserPreferences {
  favoriteGenres: string[];
  watchedMovies: string[];
  preferredMoods: string[];
}

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const response = await apiClient.get<UserPreferences>(
      "/api/user/preferences"
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to get user preferences:", error);
    // Return default preferences
    return {
      favoriteGenres: [],
      watchedMovies: [],
      preferredMoods: [],
    };
  }
}

export async function updateUserPreferences(
  preferences: Partial<UserPreferences>
): Promise<void> {
  try {
    await apiClient.put("/api/user/preferences", preferences);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error || "Failed to update preferences";
    throw new Error(errorMessage);
  }
}

// ============================================================================
// MOVIE HISTORY API (Future Enhancement)
// ============================================================================

// export interface MovieHistory {
//   movieId: string
//   title: string
//   watchedAt: string
//   rating?: number
//   mood: string
// }

// export async function addToHistory(movie: Omit<MovieHistory, "watchedAt">): Promise<void> {
//   try {
//     await apiClient.post("/api/user/history", {
//       ...movie,
//       watchedAt: new Date().toISOString(),
//     })
//   } catch (error: any) {
//     console.error("Failed to add to history:", error)
//   }
// }

// export async function getUserHistory(): Promise<MovieHistory[]> {
//   try {
//     const response = await apiClient.get<MovieHistory[]>("/api/user/history")
//     return response.data
//   } catch (error: any) {
//     console.error("Failed to get user history:", error)
//     return []
//   }
// }

// ============================================================================
// ENHANCED RECOMMENDATIONS WITH USER DATA
// ============================================================================

// export async function getPersonalizedRecommendations(
//   mood: string,
//   includeHistory = true,
// ): Promise<MovieRecommendation[]> {
//   try {
//     let userHistory: string[] = []

//     if (includeHistory && getStoredToken()) {
//       const history = await getUserHistory()
//       userHistory = history.map((h) => h.title)
//     }

//     const requestBody: RecommendationRequest = {
//       mood,
//       user_history: userHistory.length > 0 ? userHistory : ["Inception", "The Matrix"],
//       top_n: 20,
//     }

//     const response = await axios.post<RecommendationResponse>("http://0.0.0.0:8000/recommend", requestBody, {
//       headers: {
//         "Content-Type": "application/json",
//         ...(getStoredToken() && { Authorization: `Bearer ${getStoredToken()}` }),
//       },
//     })

//     return response.data.recommendations
//   } catch (error: any) {
//     console.error("Failed to fetch personalized recommendations:", error.response?.data || error.message)
//     // Fallback to basic recommendations
//     return getRecommendations(mood)
//   }
// }

// ============================================================================
// API HEALTH CHECK
// ============================================================================

export async function checkApiHealth(): Promise<boolean> {
  try {
    await apiClient.get("/api/health");
    return true;
  } catch {
    return false;
  }
}

// utils/userHistory.ts
const USER_HISTORY_KEY = "user_history";
const MAX_HISTORY = 20;

export function getUserHistory(): MovieRecommendation[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(USER_HISTORY_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToUserHistory(movie: MovieRecommendation) {
  if (typeof window === "undefined") return;
  const history = getUserHistory();

  const exists = history.find((m) => m.title === movie.title);
  let newHistory = exists
    ? [movie, ...history.filter((m) => m.title !== movie.title)]
    : [movie, ...history];

  if (newHistory.length > MAX_HISTORY) {
    newHistory = newHistory.slice(0, MAX_HISTORY);
  }

  localStorage.setItem(USER_HISTORY_KEY, JSON.stringify(newHistory));
}
