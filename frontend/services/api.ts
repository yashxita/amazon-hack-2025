import axios from "axios";
export interface RecommendationRequest {
  mood: string;
  user_history?: string[];
  top_n?: number;
}

export interface MovieRecommendation {
  title: string;
  score: number;
  genres: string[];
  poster_path: string; // Optional in case API doesn't return it
  release_date: string; // For extracting the year
}

export interface RecommendationResponse {
  recommendations: MovieRecommendation[];
}


export async function getRecommendations(mood: string): Promise<RecommendationResponse["recommendations"]> {
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
    console.error("Failed to fetch recommendations:", error.response?.data || error.message);
    return [];
  }
}

