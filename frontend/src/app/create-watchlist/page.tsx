"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Star, Calendar, History, FolderSyncIcon as Sync } from "lucide-react"
import { useRouter } from "next/navigation"

interface Movie {
  title: string
  score: number
  genres: string[]
  poster_path: string
  release_date: string
}

interface SelectedMovie {
  movie_id: string
  movie_name: string
}

interface WatchHistoryItem {
  movie_id: string
  movie_name: string
  watched_at: string
}

const ICON_OPTIONS = ["🎬", "🍿", "🎭", "🎪", "🎨", "🎵", "⭐", "🔥", "💎", "🚀", "🌟", "🎯"]

export default function CreateWatchlistPage() {
  const [watchlistName, setWatchlistName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("🎬")
  const [movies, setMovies] = useState<Movie[]>([])
  const [selectedMovies, setSelectedMovies] = useState<SelectedMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [overallMatchScore, setOverallMatchScore] = useState("0%")
  const [localHistoryCount, setLocalHistoryCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    checkLocalHistory()
    fetchHistoryBasedRecommendations()
  }, [])

  const checkLocalHistory = () => {
    const localHistory = localStorage.getItem("user_history")
    if (localHistory) {
      try {
        const history = JSON.parse(localHistory)
        setLocalHistoryCount(Array.isArray(history) ? history.length : 0)
      } catch (error) {
        console.error("Error parsing local history:", error)
        setLocalHistoryCount(0)
      }
    }
  }

  const syncUserHistory = async () => {
    setSyncing(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const localHistory = localStorage.getItem("user_history")
      if (!localHistory) {
        alert("No local history found to sync")
        return
      }

      const history = JSON.parse(localHistory)

      // Send each movie in history to the backend
      for (const movie of history) {
        await fetch("http://localhost:8000/history/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            movie_id: movie.movie_id || movie.id || "unknown",
            movie_name: movie.movie_name || movie.title || movie.name,
          }),
        })
      }

      // Clear local storage after successful sync
      localStorage.removeItem("user_history")
      setLocalHistoryCount(0)

      // Refresh recommendations after sync
      await fetchHistoryBasedRecommendations()

      alert("History synced successfully!")
    } catch (error) {
      console.error("Error syncing history:", error)
      alert("Error syncing history. Please try again.")
    } finally {
      setSyncing(false)
    }
  }

  const fetchHistoryBasedRecommendations = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("http://localhost:8000/recommend/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          top_n: 20,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMovies(data.recommendations)
        setOverallMatchScore(data.overall_match_score)
      } else {
        // If no history available, show empty state
        setMovies([])
        setOverallMatchScore("0%")
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const handleMovieSelect = (movie: Movie, checked: boolean) => {
    if (checked) {
      setSelectedMovies([
        ...selectedMovies,
        {
          movie_id: movie.title, // Using title as ID since history recommendations might not have separate IDs
          movie_name: movie.title,
        },
      ])
    } else {
      setSelectedMovies(selectedMovies.filter((m) => m.movie_id !== movie.title))
    }
  }

  const createWatchlist = async () => {
    if (!watchlistName.trim() || selectedMovies.length === 0) {
      alert("Please enter a watchlist name and select at least one movie")
      return
    }

    setCreating(true)
    try {
      const token = localStorage.getItem("token")

      // Create watchlist group
      const watchlistResponse = await fetch("http://localhost:8000/watchlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `${selectedIcon} ${watchlistName}`,
        }),
      })

      if (watchlistResponse.ok) {
        const watchlistData = await watchlistResponse.json()
        const watchlistId = watchlistData.id

        // Add movies to watchlist
        for (const movie of selectedMovies) {
          await fetch(`http://localhost:8000/watchlists/${watchlistId}/movies`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(movie),
          })
        }

        router.push("/watchlist")
      }
    } catch (error) {
      console.error("Error creating watchlist:", error)
      alert("Error creating watchlist. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-8 px-6 lg:px-12">
        <div className="flex items-center mb-8">
          <Button onClick={() => router.back()} variant="ghost" className="text-white hover:bg-gray-800 mr-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-black text-white tracking-tight">CREATE WATCHLIST</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Watchlist Configuration */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-700 sticky top-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">Watchlist Details</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">
                      Watchlist Name
                    </Label>
                    <Input
                      id="name"
                      value={watchlistName}
                      onChange={(e) => setWatchlistName(e.target.value)}
                      placeholder="Enter watchlist name"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Choose Icon</Label>
                    <div className="grid grid-cols-6 gap-2 mt-2">
                      {ICON_OPTIONS.map((icon) => (
                        <Button
                          key={icon}
                          onClick={() => setSelectedIcon(icon)}
                          variant={selectedIcon === icon ? "default" : "outline"}
                          className={`text-2xl p-2 ${
                            selectedIcon === icon
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-gray-800 border-gray-600 hover:bg-gray-700"
                          }`}
                        >
                          {icon}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* History Sync Section */}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white flex items-center">
                        <History className="w-4 h-4 mr-2" />
                        Watch History
                      </Label>
                      {localHistoryCount > 0 && (
                        <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-400">
                          {localHistoryCount} local
                        </Badge>
                      )}
                    </div>

                    {localHistoryCount > 0 && (
                      <Button
                        onClick={syncUserHistory}
                        disabled={syncing}
                        variant="outline"
                        className="w-full mb-3 bg-blue-900 text-blue-400 border-blue-600 hover:bg-blue-800"
                      >
                        <Sync className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                        {syncing ? "Syncing..." : "Sync Local History"}
                      </Button>
                    )}

                    <p className="text-gray-400 text-xs">
                      Recommendations are based on your watch history. Match Score: {overallMatchScore}
                    </p>
                  </div>

                  <div className="pt-4">
                    <p className="text-gray-400 text-sm mb-2">Selected Movies: {selectedMovies.length}</p>
                    <Button
                      onClick={createWatchlist}
                      disabled={creating || !watchlistName.trim() || selectedMovies.length === 0}
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      {creating ? "Creating..." : "Create Watchlist"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Movie Selection */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
              <Button
                onClick={fetchHistoryBasedRecommendations}
                variant="outline"
                size="sm"
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="text-white text-center py-8">Loading recommendations...</div>
            ) : movies.length === 0 ? (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-8 text-center">
                  <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-xl mb-2">No Recommendations Available</h3>
                  <p className="text-gray-400 mb-4">
                    We need your watch history to provide personalized recommendations.
                  </p>
                  {localHistoryCount > 0 ? (
                    <p className="text-blue-400 text-sm">
                      You have {localHistoryCount} movies in local storage. Sync them to get recommendations!
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Start watching movies and they'll appear in your history for better recommendations.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {movies.map((movie, index) => (
                  <Card key={`${movie.title}-${index}`} className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={selectedMovies.some((m) => m.movie_id === movie.title)}
                          onCheckedChange={(checked) => handleMovieSelect(movie, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-2">{movie.title}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-300 text-sm">{movie.score.toFixed(2)}</span>
                            <Calendar className="w-4 h-4 text-gray-400 ml-2" />
                            <span className="text-gray-400 text-sm">{movie.release_date}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {movie.genres.slice(0, 3).map((genre, genreIndex) => (
                              <Badge
                                key={`${genre}-${genreIndex}`}
                                variant="outline"
                                className="text-xs border-gray-600 text-gray-300"
                              >
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
