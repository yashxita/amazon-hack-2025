"use client"
import { API_BASE_URL } from "../../../services/api"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Star, Calendar, History, FolderSyncIcon as Sync, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {WatchlistSearch} from "../../components/WatchListSearch";

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

const ICON_OPTIONS = ["🎬", "🍿", "🎭", "🎪", "🎨", "🎵", "⭐", "🔥", "💎", "🚀", "🌟", "🎯"]

export default function CreateWatchlistPage() {
  const [watchlistName, setWatchlistName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("🎬")
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([])
  const [selectedMovies, setSelectedMovies] = useState<SelectedMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [overallMatchScore, setOverallMatchScore] = useState("0%")
  const [localHistoryCount, setLocalHistoryCount] = useState(0)
  const [isSearchMode, setIsSearchMode] = useState(false)
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
      if (!token) return router.push("/login")

      const localHistory = localStorage.getItem("user_history")
      if (!localHistory) return toast.error("No local history found to sync")

      const history = JSON.parse(localHistory)
      for (const movie of history) {
        await fetch(`${API_BASE_URL}/history/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "bypass-tunnel-reminder": "true",
          },
          body: JSON.stringify({
            movie_id: movie.movie_id || movie.id || "unknown",
            movie_name: movie.movie_name || movie.title || movie.name,
          }),
        })
      }

      localStorage.removeItem("user_history")
      setLocalHistoryCount(0)
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
      if (!token) return router.push("/login")

      const response = await fetch(`${API_BASE_URL}/recommend/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "bypass-tunnel-reminder": "true",
        },
        body: JSON.stringify({ top_n: 20 }),
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendedMovies(data.recommendations)
        setMovies(data.recommendations) // Set initial movies to recommendations
        setOverallMatchScore(data.overall_match_score)
      } else {
        setRecommendedMovies([])
        setMovies([])
        setOverallMatchScore("0%")
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      setRecommendedMovies([])
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchResults = (searchResults: Movie[]) => {
    setMovies(searchResults)
    setIsSearchMode(true)
  }

  const handleClearSearch = () => {
    setMovies(recommendedMovies)
    setIsSearchMode(false)
  }

  const handleMovieSelect = (movie: Movie, checked: boolean) => {
    if (checked) {
      setSelectedMovies([
        ...selectedMovies,
        {
          movie_id: movie.title,
          movie_name: movie.title,
        },
      ])
    } else {
      setSelectedMovies(selectedMovies.filter((m) => m.movie_id !== movie.title))
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const createWatchlist = async () => {
    if (!watchlistName.trim() || selectedMovies.length === 0) {
      return toast.error("Please enter a watchlist name and select at least one movie")
    }

    setCreating(true)
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("name", `${selectedIcon} ${watchlistName}`)
      if (coverImage) formData.append("cover_image", coverImage)

      const watchlistResponse = await fetch("http://localhost:8000/watchlists", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!watchlistResponse.ok) {
        const errorText = await watchlistResponse.text()
        throw new Error(`Server error: ${watchlistResponse.status} - ${errorText}`)
      }

      const watchlistData = await watchlistResponse.json()
      const watchlistId = watchlistData.id

      for (const movie of selectedMovies) {
        const res = await fetch(`http://localhost:8000/watchlists/${watchlistId}/movies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(movie),
        })

        if (!res.ok) console.error(`Failed to add movie ${movie.movie_name}`)
      }

      toast.success("Watchlist created successfully!")
      router.push("/watchlist")
    } catch (error: any) {
      console.error("Error creating watchlist:", error)
      toast.error("Failed to create watchlist. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const getMoviePosterUrl = (posterPath: string) => {
    if (!posterPath) return null
    return posterPath.startsWith("http")
      ? posterPath
      : `https://image.tmdb.org/t/p/w500/${posterPath.replace(/^\//, "")}`
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-8 px-6 lg:px-12">
        <div className="flex items-center mb-8">
          <Button onClick={() => router.back()} className="text-white hover:bg-gray-800 mr-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-black text-white tracking-tight">CREATE WATCHLIST</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-700 sticky top-8">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-white mb-2">Watchlist details</h2>

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

                <div>
                  <Label className="text-white">Cover Image (Optional)</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                      id="cover-image-input"
                    />
                    <Label
                      htmlFor="cover-image-input"
                      className="cursor-pointer block w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-red-500 transition-colors"
                    >
                      {coverImagePreview ? (
                        <div className="flex items-center space-x-3">
                          <img
                            src={coverImagePreview || "/placeholder.svg"}
                            alt="Cover preview"
                            className="w-16 h-10 object-cover rounded"
                          />
                          <div>
                            <p className="text-white text-sm">Cover image selected</p>
                            <p className="text-gray-400 text-xs">Click to change</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 text-sm">
                          Click to upload cover image
                          <div className="text-gray-500 text-xs">JPG, PNG up to 5MB</div>
                        </div>
                      )}
                    </Label>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white flex items-center">
                      <History className="w-4 h-4 mr-2" />
                      Watch History
                    </Label>
                    {localHistoryCount > 0 && (
                      <Badge className="text-xs border-yellow-600 text-yellow-400">{localHistoryCount} local</Badge>
                    )}
                  </div>

                  {localHistoryCount > 0 && (
                    <Button
                      onClick={syncUserHistory}
                      disabled={syncing}
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
                    disabled={!watchlistName.trim() || selectedMovies.length === 0 || creating}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    {creating ? "Creating..." : "Create Watchlist"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Movie Selection */}
          <div className="lg:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-white">
                {isSearchMode ? "Search Results" : "Recommended for You"}
              </h2>
              <WatchlistSearch onSearchResults={handleSearchResults} onClearSearch={handleClearSearch} />
            </div>

            {loading ? (
              <div className="text-white text-center py-8">Loading recommendations...</div>
            ) : movies.length === 0 ? (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-8 text-center">
                  <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-xl mb-2">
                    {isSearchMode ? "No Movies Found" : "No Recommendations Available"}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {isSearchMode
                      ? "Try searching with different keywords or check your spelling."
                      : "We need your watch history to provide personalized recommendations."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {movies.map((movie, index) => (
                  <Card key={`${movie.title}-${index}`} className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 flex items-start space-x-4">
                      <Checkbox
                        checked={selectedMovies.some((m) => m.movie_id === movie.title)}
                        onCheckedChange={(checked) => handleMovieSelect(movie, checked as boolean)}
                        className="mt-1 flex-shrink-0 border border-gray-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-green-500"
                      />
                      <div className="w-16 h-24 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                        {getMoviePosterUrl(movie.poster_path) ? (
                          <img
                            src={getMoviePosterUrl(movie.poster_path)! || "/placeholder.svg"}
                            alt={`${movie.title} poster`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full">
                            <Play className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{movie.title}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300 text-sm">
                            {typeof movie.score === "number" ? movie.score.toFixed(2) : "N/A"}
                          </span>
                          <Calendar className="w-4 h-4 text-gray-400 ml-2" />
                          <span className="text-gray-400 text-sm">{movie.release_date}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(movie.genres)
                            ? movie.genres.slice(0, 3).map((genre, i) => (
                                <Badge key={i} className="text-xs border-gray-600 text-gray-300">
                                  {genre}
                                </Badge>
                              ))
                            : typeof movie.genres === "string"
                              ? (() => {
                                  try {
                                    const parsed = JSON.parse((movie.genres as string).replace(/'/g, '"'))
                                    return parsed.slice(0, 3).map((g: any, i: number) => (
                                      <Badge key={i} className="text-xs border-gray-600 text-gray-300">
                                        {g.name || g}
                                      </Badge>
                                    ))
                                  } catch {
                                    return null
                                  }
                                })()
                              : null}
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
