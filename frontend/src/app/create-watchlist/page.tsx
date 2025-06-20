"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Star, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface Movie {
  title: string
  score: number
  genres: string[]
  poster_path: string
  release_date: string
  id: string
}

interface SelectedMovie {
  movie_id: string
  movie_name: string
}

const MOOD_OPTIONS = ["happy", "sad", "thrilled", "scared", "curious", "nostalgic", "anxious", "bored"]

const ICON_OPTIONS = ["🎬", "🍿", "🎭", "🎪", "🎨", "🎵", "⭐", "🔥", "💎", "🚀", "🌟", "🎯"]

export default function CreateWatchlistPage() {
  const [watchlistName, setWatchlistName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("🎬")
  const [selectedMood, setSelectedMood] = useState("happy")
  const [movies, setMovies] = useState<Movie[]>([])
  const [selectedMovies, setSelectedMovies] = useState<SelectedMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchRecommendations()
  }, [selectedMood])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("http://localhost:8000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: selectedMood,
          top_n: 20,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMovies(data.recommendations)
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMovieSelect = (movie: Movie, checked: boolean) => {
    if (checked) {
      setSelectedMovies([
        ...selectedMovies,
        {
          movie_id: movie.id,
          movie_name: movie.title,
        },
      ])
    } else {
      setSelectedMovies(selectedMovies.filter((m) => m.movie_id !== movie.id))
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

        router.push("/")
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

                  <div>
                    <Label className="text-white">Mood for Recommendations</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {MOOD_OPTIONS.map((mood) => (
                        <Button
                          key={mood}
                          onClick={() => setSelectedMood(mood)}
                          variant={selectedMood === mood ? "default" : "outline"}
                          className={`capitalize ${
                            selectedMood === mood
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
                          }`}
                        >
                          {mood}
                        </Button>
                      ))}
                    </div>
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
            <h2 className="text-2xl font-bold text-white mb-6">Recommended Movies ({selectedMood})</h2>

            {loading ? (
              <div className="text-white text-center py-8">Loading recommendations...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {movies.map((movie) => (
                  <Card key={movie.id} className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={selectedMovies.some((m) => m.movie_id === movie.id)}
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
                            {movie.genres.slice(0, 3).map((genre) => (
                              <Badge key={genre} variant="outline" className="text-xs border-gray-600 text-gray-300">
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
