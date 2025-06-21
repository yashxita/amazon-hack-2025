"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Trash2, Play } from "lucide-react"
import { useRouter } from "next/navigation"

interface WatchlistMovie {
  id: string
  movie_id: string
  movie_name: string
  poster_path?: string
}

interface WatchlistDetail {
  id: string
  name: string
  cover_image?: string // base64
  movies: WatchlistMovie[]
}
export default function WatchlistDetailPage({ params }: { params: { id: string } }) {
  const [watchlist, setWatchlist] = useState<WatchlistDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchWatchlistDetail()
  }, [params.id])

  const fetchWatchlistDetail = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`http://localhost:8000/watchlists/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setWatchlist(data)
      }
    } catch (error) {
      console.error("Error fetching watchlist detail:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeMovie = async (movieId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8000/watchlists/${params.id}/movies/${movieId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setWatchlist((prev) =>
          prev
            ? {
                ...prev,
                movies: prev.movies.filter((m) => m.movie_id !== movieId),
              }
            : null,
        )
      }
    } catch (error) {
      console.error("Error removing movie:", error)
    }
  }

  const addToWatchHistory = async (movie: WatchlistMovie) => {
    try {
      const token = localStorage.getItem("token")
      await fetch("http://localhost:8000/history/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          movie_id: movie.movie_id,
          movie_name: movie.movie_name,
        }),
      })
      alert(`Added "${movie.movie_name}" to watch history!`)
    } catch (error) {
      console.error("Error adding to watch history:", error)
    }
  }

  const getMoviePosterUrl = (posterPath?: string) => {
    if (!posterPath) return null
    // Handle different poster path formats
    if (posterPath.startsWith("http")) {
      return posterPath
    }
    // TMDB poster URL format
    return `https://image.tmdb.org/t/p/w500${posterPath.startsWith("/") ? posterPath : `/${posterPath}`}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading watchlist...</div>
      </div>
    )
  }

  if (!watchlist) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Watchlist not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-8 px-6 lg:px-12">
        <div className="flex items-center mb-8">
          <Button
            onClick={() => router.push("/watchlist")}
            
            className="text-white hover:bg-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-black text-white tracking-tight">{watchlist.name}</h1>
        </div>

        <div className="mb-6">
          <p className="text-gray-400">
            {watchlist.movies.length} movie{watchlist.movies.length !== 1 ? "s" : ""} in this watchlist
          </p>
        </div>

        {watchlist.movies.length === 0 ? (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400 text-lg">No movies in this watchlist yet.</p>
              <Button onClick={() => router.push("/create-watchlist")} className="mt-4 bg-red-500 hover:bg-red-600">
                Add Movies
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {watchlist.movies.map((movie) => (
              <Card
                key={movie.id}
                className="bg-gray-900 border-gray-700 hover:border-red-500 transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                    {getMoviePosterUrl(movie.poster_path) ? (
                      <img
                        src={getMoviePosterUrl(movie.poster_path)! || "/placeholder.svg"}
                        alt={`${movie.movie_name} poster`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          target.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                    ) : null}
                    <div
                      className={`${getMoviePosterUrl(movie.poster_path) ? "hidden" : "flex"} items-center justify-center w-full h-full`}
                    >
                      <Play className="w-12 h-12 text-gray-600" />
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-4 line-clamp-2">{movie.movie_name}</h3>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => addToWatchHistory(movie)}
                       
                      size="sm"
                      className="bg-green-900 text-green-400 border-green-600 hover:bg-green-800 text-xs"
                    >
                      Mark Watched
                    </Button>
                    <Button
                      onClick={() => removeMovie(movie.movie_id)}
                       
                      size="sm"
                      className="bg-red-900 text-red-400 border-red-600 hover:bg-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
