"use client"
import {
  getWatchlistDetail,
  addToWatchHistory,
  removeMovieFromWatchlist
} from "../../../../services/api"


import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import MovieCard from "@/components/MovieCard" // Adjust path if needed

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

export default function WatchlistDetailPage() {
  const { id } = useParams() as { id: string }
  const [watchlist, setWatchlist] = useState<WatchlistDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (id) {
      fetchWatchlistDetail()
    }
  }, [id])

const fetchWatchlistDetail = async () => {
  const token = localStorage.getItem("token")
  if (!token) {
    router.push("/login")
    return
  }

  const data = await getWatchlistDetail(id)
  setWatchlist(data)
  setLoading(false)
}


  // const removeMovie = async (movieId: string) => {
  //   try {
  //     const token = localStorage.getItem("token")
  //     const response = await fetch(`http://localhost:8000/watchlists/${id}/movies/${movieId}`, {
  //       method: "DELETE",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })

  //     if (response.ok) {
  //       setWatchlist((prev) =>
  //         prev
  //           ? {
  
  //               ...prev,
  //               movies: prev.movies.filter((m) => m.movie_id !== movieId),
  //             }
  //           : null
  //       )
  //     }
  //   } catch (error) {
  //     console.error("Error removing movie:", error)
  //   }
  // }

  const getMoviePosterUrl = (posterPath?: string) => {
    if (!posterPath) return null
    if (posterPath.startsWith("http")) {
      return posterPath
    }
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
          <Button onClick={() => router.push("/watchlist")} className="text-white hover:bg-gray-800 mr-4">
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
              <MovieCard
                key={movie.id}
                movie={{
                  id: movie.movie_id,
                  title: movie.movie_name,
                  poster: getMoviePosterUrl(movie.poster_path),
                  year: "", // Optional: populate if available
                  genre: [], // Optional: populate if available
                  score: "", // Optional: populate if available
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
