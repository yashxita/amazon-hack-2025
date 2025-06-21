"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Copy, RefreshCw, ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import {
  getBlend,
  getCurrentUser,
  addToWatchHistory,
  type BlendResponse,
} from "../../../../services/api";
import MovieCard from "../../../components/MovieCard";

const getInitials = (name: string) =>
  name
    .split(/[ @._-]/)
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

export default function BlendDetailPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [blend, setBlend] = useState<BlendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBlend = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const blendData = await getBlend(code);
        setBlend(blendData);

        if (isRefresh) {
          toast.success("Blend updated with latest recommendations!");
        }
      } catch (err: unknown) {
        const error = err as {
          response?: { status: number };
          message?: string;
        };
        const errorMsg =
          error.response?.status === 404
            ? "Blend not found"
            : error.message || "Failed to load blend";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [code]
  );

  useEffect(() => {
    const init = async () => {
      try {
        await getCurrentUser();
        await loadBlend();
      } catch {
        setError("Failed to load user info. Please login.");
        toast.error("Please login to access this blend.");
      }
    };
    init();
  }, [loadBlend]);

  const copyBlendCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Blend code copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleAddHistory = async () => {
    const movies = prompt(
      "Enter your movie history (comma-separated):\nExample: Inception, The Matrix, Interstellar, The Dark Knight"
    );

    if (!movies) return;

    const movieList = movies
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    try {
      toast.loading("Adding movies to your history...");

      for (const movie of movieList) {
        await addToWatchHistory({
          movie_id: `manual_${Date.now()}_${Math.random()}`,
          movie_name: movie,
        });
      }

      toast.dismiss();
      toast.success("Movie history added! Refreshing blend...");

      setTimeout(() => loadBlend(true), 1500);
    } catch {
      toast.dismiss();
      toast.error("Failed to add movie history");
    }
  };

  const handleManualRefresh = async () => {
    await loadBlend(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
          <p className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Loading blend...
          </p>
        </div>
      </div>
    );
  }

  if (error || !blend) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-black border-2 border-red-500/50 shadow-2xl shadow-red-500/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              Error
            </h2>
            <p className="text-gray-300 mb-6">{error || "Blend not found"}</p>
            <Button
              onClick={() => router.push("/blend")}
              className="w-full bg-red-500 hover:bg-red-600 border border-red-400 shadow-lg shadow-red-500/30 text-white font-bold"
            >
              Back to Blends
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/blend")}
            className="flex items-center gap-2 text-blue-400 border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-400 shadow-lg shadow-blue-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Blend:{" "}
              <span className="text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                {code}
              </span>
            </h1>
            <p className="text-gray-300">
              <span className="text-blue-400">{blend.users.length}</span> member
              {blend.users.length !== 1 ? "s" : ""} • Match:{" "}
              <span className="text-red-400 font-bold">
                {blend.overall_match_score}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyBlendCode}
              className="text-blue-400 border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-400 shadow-lg shadow-blue-500/20"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="text-red-400 border-red-500/50 hover:bg-red-500/10 hover:border-red-400 shadow-lg shadow-red-500/20"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Updating..." : "Refresh Blend"}
            </Button>
          </div>
        </div>

        {/* Add History Button */}
        <div className="mb-8">
          <Card className="bg-black border-2 border-blue-500/50 shadow-2xl shadow-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-blue-400 font-semibold drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    Need better recommendations?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Add your movie history to improve blend results
                  </p>
                </div>
                <Button
                  onClick={handleAddHistory}
                  className="bg-blue-500 hover:bg-blue-600 border border-blue-400 shadow-lg shadow-blue-500/30 text-white font-bold"
                >
                  Add History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Members Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-black border-2 border-cyan-400/60 shadow-2xl shadow-cyan-400/20 hover:shadow-cyan-400/30 transition-all duration-300">
              <CardHeader className="border-b border-cyan-400/30">
                <CardTitle className="text-white flex items-center gap-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Members (
                  <span className="text-cyan-400">{blend.users.length}</span>)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap gap-3">
                  {blend.users.map((username, index) => (
                    <div
                      key={`${username}-${index}`}
                      className="flex flex-col items-center gap-2"
                    >
                      <Avatar className="w-12 h-12 bg-gradient-to-br from-red-600 to-blue-600 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30">
                        <AvatarFallback className="text-white font-bold bg-gradient-to-br from-red-600 to-blue-600">
                          {getInitials(username)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-gray-300 text-xs text-center max-w-[60px] truncate">
                        {username}
                      </span>
                    </div>
                  ))}
                </div>

                {Object.keys(blend.user_tags).length > 0 && (
                  <div className="pt-4 border-t border-cyan-400/30">
                    <h4 className="text-red-400 font-semibold mb-3 text-sm drop-shadow-[0_0_5px_rgba(239,68,68,0.3)]">
                      Member Preferences
                    </h4>
                    <div className="space-y-3">
                      {blend.users.map((username, index) => {
                        // Find the corresponding user ID and tag
                        const userEntries = Object.entries(blend.user_tags);
                        const userTag =
                          userEntries[index]?.[1] || "No preferences yet";

                        return (
                          <div
                            key={`${username}-${index}`}
                            className="flex items-center gap-3 p-3 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                          >
                            <Avatar className="w-8 h-8 bg-gradient-to-br from-red-600 to-blue-600 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30">
                              <AvatarFallback className="text-white font-bold bg-gradient-to-br from-red-600 to-blue-600 text-xs">
                                {getInitials(username)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium text-sm">
                                {username}
                              </div>
                              <div className="text-gray-400 text-xs truncate">
                                {userTag}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-cyan-400/30">
                  <h4 className="text-blue-400 font-semibold mb-2 text-sm drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]">
                    Invite Friends
                  </h4>
                  <p className="text-gray-400 text-xs mb-2">Share this code:</p>
                  <div className="bg-black border-2 border-blue-500/50 p-3 rounded text-center shadow-lg shadow-blue-500/20">
                    <code className="text-blue-400 font-mono text-lg drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                      {code}
                    </code>
                  </div>
                </div>

                {/* Manual refresh hint */}
                <div className="pt-4 border-t border-cyan-400/30">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <RefreshCw className="w-3 h-3" />
                    <span>
                      Click `&quot;`Refresh Blend`&quot;` to update
                      recommendations
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Panel */}
          <div className="lg:col-span-3">
            <Card className="bg-black border-2 border-red-500/60 shadow-2xl shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-300">
              <CardHeader className="border-b border-red-500/30">
                <CardTitle className="text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)] flex items-center justify-between">
                  <span>
                    Blended Recommendations
                    {blend.users.length < 2 && (
                      <span className="text-gray-500 text-sm font-normal ml-2">
                        (Need 2+ members)
                      </span>
                    )}
                  </span>
                  {blend.recommendations.length > 0 && (
                    <span className="text-sm font-normal text-gray-400">
                      {blend.recommendations.length} movies •{" "}
                      {blend.overall_match_score} match
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {blend.users.length < 2 ? (
                  <div className="text-center py-16 text-gray-500">
                    <Users className="w-20 h-20 mx-auto mb-6 opacity-30" />
                    <h3 className="text-xl mb-2 text-white">
                      Waiting for more members...
                    </h3>
                    <p className="text-sm mb-4">
                      Share your blend code to get personalized recommendations
                    </p>
                    <div className="bg-black border-2 border-blue-500/50 p-3 rounded-lg inline-block shadow-lg shadow-blue-500/20">
                      <code className="text-blue-400 font-mono text-lg drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                        {code}
                      </code>
                    </div>
                  </div>
                ) : blend.recommendations.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-900 border-2 border-gray-700 rounded-full flex items-center justify-center shadow-lg">
                      <RefreshCw className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-xl mb-2 text-white">
                      No recommendations yet
                    </h3>
                    <p className="text-sm mb-4">
                      Make sure all members have added their movie history
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={handleAddHistory}
                        variant="outline"
                        className="text-blue-400 border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-400"
                      >
                        Add Your History
                      </Button>
                      <Button
                        onClick={handleManualRefresh}
                        variant="outline"
                        className="text-red-400 border-red-500/50 hover:bg-red-500/10 hover:border-red-400"
                      >
                        Refresh Blend
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {blend.recommendations.map((rec, index) => (
                      <div
                        key={`${rec.title}-${index}`}
                        className="flex justify-center"
                      >
                        <MovieCard
                          movie={{
                            id: `blend_${index}`,
                            title: rec.title,
                            poster: rec.poster_path?.startsWith("http")
                              ? rec.poster_path
                              : `https://image.tmdb.org/t/p/w500${rec.poster_path}`,
                            genre: rec.genres,
                            score: (rec.match_score * 10).toFixed(1),
                            year: "2024",
                            match: Math.round(rec.match_score * 100),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
