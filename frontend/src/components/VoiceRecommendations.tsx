"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, X, RefreshCw } from "lucide-react";
import MovieCard from "./MovieCard";

export interface VoiceRecommendation {
  title: string;
  score: number;
  genres: string[] | string;
  poster_path: string;
  release_date: string;
  [key: string]: any;
}

interface VoiceRecommendationsProps {
  recommendations: VoiceRecommendation[];
  onClose: () => void;
  onNewVoiceSearch: () => void;
  isVisible: boolean;
}

export default function VoiceRecommendations({
  recommendations,
  onClose,
  onNewVoiceSearch,
  isVisible,
}: VoiceRecommendationsProps) {

  if (!isVisible || recommendations.length === 0) {
    return null;
  }

  const averageScore =
    recommendations.length > 0
      ? (
          (recommendations.reduce((sum, movie) => sum + movie.score, 0) /
            recommendations.length) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
      <Card className="bg-gray-900 border-gray-700 shadow-2xl">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">
                  🎤 Voice Search Results
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  Found {recommendations.length} movies • Average match:{" "}
                  {averageScore}%
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={onNewVoiceSearch}
                variant="outline"
                size="sm"
                className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                New Search
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {recommendations.length === 0 ? (
            <div className="text-center py-12">
              <Mic className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">
                No Voice Recommendations
              </h3>
              <p className="text-gray-400 mb-4">
                Try describing what type of movie you`&apos;`re looking for.
              </p>
              <Button
                onClick={onNewVoiceSearch}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Mic className="w-4 h-4 mr-2" />
                Try Voice Search
              </Button>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-lg">
                    Recommended Movies Based on Your Voice
                  </h3>
                  <div className="text-sm text-gray-400">
                    Sorted by relevance
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"></div>
              </div>

              {/* Movie Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((movie, index) => (
                  <MovieCard
                    key={`${movie.title}-${index}`}
                    movie={{
                      poster: movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "/placeholder.svg",
                      genre: Array.isArray(movie.genres)
                        ? movie.genres
                        : [movie.genres],
                      year: movie.release_date?.slice(0, 4) || "N/A",
                      title: movie.title,
                      match: Math.round(movie.score * 100), // optional if you want to show match badge
                      // ... any other fields needed
                    }}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <p>
                    💡 Tip: Try being more specific in your voice search for
                    better results
                  </p>
                  <Button
                    onClick={onNewVoiceSearch}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Search Again
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
