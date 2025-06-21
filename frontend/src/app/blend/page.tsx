"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Copy,
  RefreshCw,
  Plus,
  LogIn,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import FuseMode from "@/components/FuseMode";
import {
  createBlend,
  joinBlend,
  listBlends,
  getBlend,
  getCurrentUser,
  addToWatchHistory,
  type BlendResponse,
  type BlendSummary,
  type User,
} from "../../../services/api";

/* ───────── helpers ───────── */

const getInitials = (name: string) =>
  name
    .split(/[ @._-]/)
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

/* ───────── component ───────── */

export default function BlendPage() {
  const router = useRouter();

  // State management
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [blends, setBlends] = useState<BlendSummary[]>([]);
  const [blendDetails, setBlendDetails] = useState<
    Record<string, BlendResponse>
  >({});

  // Loading states
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [loadingBlends, setLoadingBlends] = useState<Record<string, boolean>>(
    {}
  );

  // Form inputs
  const [blendName, setBlendName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Initialize component
  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        await fetchBlends();
      } catch (err: any) {
        setError("Failed to load user info. Please login.");
        toast.error("Please login to access blend functionality.");
      }
    };

    init();
  }, []);

  // Auto-refresh blends every 15 seconds
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => fetchBlends(), 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const fetchBlends = async () => {
    try {
      const remote = await listBlends();
      setBlends(remote);

      // Fetch details for each blend
      for (const blend of remote) {
        fetchBlendDetails(blend.code);
      }
    } catch (err: any) {
      console.error("Failed to fetch blends:", err);
      toast.error("Failed to fetch blends");
    }
  };

  const fetchBlendDetails = async (code: string) => {
    if (loadingBlends[code]) return;
    setLoadingBlends((prev) => ({ ...prev, [code]: true }));
    try {
      const details = await getBlend(code);
      setBlendDetails((prev) => ({ ...prev, [code]: details }));
    } catch (err: any) {
      console.error(`Failed to fetch details for blend ${code}:`, err);
    } finally {
      setLoadingBlends((prev) => ({ ...prev, [code]: false }));
    }
  };

  const handleCreateBlend = async (e: FormEvent) => {
    e.preventDefault();
    if (!blendName.trim()) {
      toast.error("Please enter a blend name.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const newBlend = await createBlend({ name: blendName.trim() });
      setBlendName("");
      await fetchBlends();

      toast.success(`Blend "${blendName}" created successfully!`);
      router.push(`/blend/${newBlend.blend_code}`);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to create blend";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinBlend = async (e: FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error("Please enter a blend code.");
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const joinedBlend = await joinBlend({ code: joinCode.trim() });
      setJoinCode("");
      await fetchBlends();

      toast.success(`Successfully joined blend: ${joinedBlend.blend_code}`);
      router.push(`/blend/${joinedBlend.blend_code}`);
    } catch (err: any) {
      const errorMsg =
        err.response?.status === 404
          ? "Blend code not found"
          : err.message || "Failed to join blend";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setJoining(false);
    }
  };

  const copyBlendCode = async (code: string) => {
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
      for (const movie of movieList) {
        await addToWatchHistory({
          movie_id: `manual_${Date.now()}_${Math.random()}`,
          movie_name: movie,
        });
      }
      toast.success("Movie history added successfully!");
      setTimeout(() => fetchBlends(), 2000);
    } catch (error) {
      toast.error("Failed to add movie history");
    }
  };

  /* ───────── render ───────── */

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-black border-2 border-red-500/50 shadow-2xl shadow-red-500/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              Authentication Required
            </h2>
            <p className="text-gray-300 mb-6">
              Please login to access blend functionality.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-red-500 hover:bg-red-600 border border-red-400 shadow-lg shadow-red-500/30 text-white font-bold"
            >
              Go to Login
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
        <div className="flex items-center mb-8">
          <Button
            onClick={() => router.push("/")}
            className="text-blue-400 border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-400 mr-4 shadow-lg shadow-blue-500/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>

<div className="relative w-full h-[360px]  -mt-30">
  <div className="absolute inset-0">
    <FuseMode />
    <div className="absolute bottom-12 inset-x-0 text-center space-y-2">
      <p className="text-gray-300 text-xl">
        Create shared movie recommendations with friends
      </p>
      <p className="text-blue-400 text-sm font-mono bg-black/50 border border-blue-500/30 rounded px-3 py-1 inline-block">
        Welcome back, {currentUser.username}!
      </p>
    </div>
  </div>
</div>

        {/* Create and Join Forms */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Create Blend */}
          <Card className="bg-black border-2 border-red-500/50 shadow-2xl shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-300">
            <CardHeader className="border-b border-red-500/30">
              <CardTitle className="text-red-400 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                <Plus className="w-5 h-5" />
                Create New Blend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreateBlend} className="space-y-4">
                <Input
                  placeholder="Enter blend name (e.g., Movie Night Crew)"
                  value={blendName}
                  onChange={(e) => setBlendName(e.target.value)}
                  className="bg-black border-2 border-red-500/30 text-white placeholder-gray-500 focus:border-red-400 focus:ring-red-400/20"
                  disabled={creating}
                />
                <Button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600 border border-red-400 shadow-lg shadow-red-500/30 text-white font-bold"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Blend"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Join Blend */}
          <Card className="bg-black border-2 border-blue-500/50 shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300">
            <CardHeader className="border-b border-blue-500/30">
              <CardTitle className="text-blue-400 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                <LogIn className="w-5 h-5" />
                Join Existing Blend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleJoinBlend} className="space-y-4">
                <Input
                  placeholder="Enter blend code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="bg-black border-2 border-blue-500/30 text-white placeholder-gray-500 focus:border-blue-400 focus:ring-blue-400/20"
                  disabled={joining}
                />
                <Button
                  type="submit"
                  className="w-full border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 shadow-lg shadow-blue-500/30 font-bold"
                  disabled={joining}
                >
                  {joining ? "Joining..." : "Join Blend"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-black border-2 border-red-500 rounded-lg shadow-lg shadow-red-500/30">
            <p className="text-red-400 font-semibold">{error}</p>
          </div>
        )}

        {/* Your Blends */}
        {blends.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              Your Blends
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blends.map((blend) => {
                const details = blendDetails[blend.code];
                const isLoading = loadingBlends[blend.code];

                return (
                  <Card
                    key={blend.code}
                    className="bg-black border-2 border-cyan-400/60 hover:border-cyan-300 hover:shadow-2xl hover:shadow-cyan-400/40 transition-all duration-300 cursor-pointer transform hover:scale-105 relative overflow-hidden p-0"
                  >
                    {/* Animated border glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <CardContent
                      className="p-6 relative z-10 backdrop-blur-sm border-gradient-to-br from-[#1F5190] via-transparent to-[#FA0000] hover:shadow-[0_0_15px_#8ecfff66] transition-shadow duration-300 rounded-lg"
                      onClick={() => {
                        console.log(`Navigating to /blend/${blend.code}`);
                        router.push(`/blend/${blend.code}`);
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg mb-1 truncate drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                            {blend.name}
                          </h3>
                          <p className="text-cyan-400 text-sm font-mono bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                            {blend.code}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyBlendCode(blend.code);
                            }}
                            className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 p-1 border border-transparent hover:border-cyan-500/30"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/blend/${blend.code}`);
                            }}
                            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-1 border border-transparent hover:border-red-500/30"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        </div>
                      ) : details ? (
                        <div className="space-y-4">
                          {/* Members */}
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {details.users
                                .slice(0, 4)
                                .map((username, index) => (
                                  <Avatar
                                    key={`${username}-${index}`}
                                    className="border-2 border-cyan-400 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30"
                                  >
                                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-xs">
                                      {getInitials(username)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              {details.users.length > 4 && (
                                <div className="w-8 h-8 bg-gray-700 border-2 border-gray-500 rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-white text-xs font-bold">
                                    +{details.users.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className="text-gray-300 text-sm">
                              {details.users.length} member
                              {details.users.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Status */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {details.users.length >= 2 ? (
                                <>
                                  <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 border border-red-400">
                                    {details.recommendations.length}{" "}
                                    recommendations
                                  </Badge>
                                  {details.overall_match_score && (
                                    <Badge
                                      className="text-cyan-400 border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                                    >
                                      {details.overall_match_score} match
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <Badge
                                  className="text-yellow-400 border-yellow-500/50 bg-yellow-500/10 shadow-lg shadow-yellow-500/20"
                                >
                                  Waiting for members
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">Click to view details</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {blends.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-900 border-2 border-cyan-500/50 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Users className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-xl text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              No blends yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first blend or join one with a code
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
