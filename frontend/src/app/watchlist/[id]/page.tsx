"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { WatchlistMovie, getWatchlistDetail } from "../../../../services/api"
import MovieCard from "@/components/MovieCard"

interface WatchlistDetail {
  id: string
  name: string
  movies: WatchlistMovie[]
}

export default function WatchlistDetailPage() {
  const { id } = useParams() as { id: string }
  const [watchlist, setWatchlist] = useState<WatchlistDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        const data = await getWatchlistDetail(id)
        setWatchlist(data)
        console.log("Fetched watchlist detail:", data)
      } catch (error) {
        console.error("Error fetching watchlist:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

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
            {watchlist.movies.map((movie) => {
              return (
                <MovieCard
                  key={movie.id}
                  movie={{
                    id: movie.movie_id,
                    title: movie.movie_name,
                    poster:`https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                    year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "",
                    genre: [],
                    score: "",
                  }}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
