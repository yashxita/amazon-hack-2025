"use client"

import { useEffect, useState } from "react"
import { Clock, RefreshCw, Calendar } from "lucide-react"
import { getWatchHistory } from "../../services/api"
import MovieSection from "./MovieSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface WatchHistoryItem {
  movie_id: string
  movie_name: string
  watched_at: string
}

interface EnhancedHistoryItem {
  id: string
  title: string
  genre: string[]
  score: number
  match: number
  year: string
  poster: string
  watched_at: string
  isHistoryItem: boolean
  watchedDate: string
}

// Simple movie data cache to avoid repeated API calls
const movieDataCache = new Map<string, any>()

export default function EnhancedRecentlyWatchedSection() {
  const [history, setHistory] = useState<EnhancedHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards")

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchMovieDataFromTMDB = async (movieName: string) => {
    // Check cache first
    if (movieDataCache.has(movieName)) {
      return movieDataCache.get(movieName)
    }

    try {
      // You'll need to add your TMDB API key here
      const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "your_api_key_here"
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}&language=en-US&page=1`,
      )

      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          const movie = data.results[0] // Take the first result
          const movieData = {
            poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            genres: movie.genre_ids ? movie.genre_ids.slice(0, 3).map((id: number) => getGenreName(id)) : [],
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            overview: movie.overview,
          }

          // Cache the result
          movieDataCache.set(movieName, movieData)
          return movieData
        }
      }
    } catch (error) {
      console.error(`Error fetching TMDB data for ${movieName}:`, error)
    }

    // Return default data if API call fails
    const defaultData = {
      poster_path: null,
      genres: [],
      release_date: null,
      vote_average: 0,
      overview: "",
    }
    movieDataCache.set(movieName, defaultData)
    return defaultData
  }

  // Simple genre ID to name mapping (you can expand this)
  const getGenreName = (genreId: number): string => {
    const genreMap: { [key: number]: string } = {
      28: "Action",
      12: "Adventure",
      16: "Animation",
      35: "Comedy",
      80: "Crime",
      99: "Documentary",
      18: "Drama",
      10751: "Family",
      14: "Fantasy",
      36: "History",
      27: "Horror",
      10402: "Music",
      9648: "Mystery",
      10749: "Romance",
      878: "Science Fiction",
      10770: "TV Movie",
      53: "Thriller",
      10752: "War",
      37: "Western",
    }
    return genreMap[genreId] || "Unknown"
  }

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)

    try {
      const historyData = await getWatchHistory()
      const formattedHistory = await formatHistoryWithMovieData(historyData)
      setHistory(formattedHistory)
    } catch (err) {
      console.error("Error fetching watch history:", err)
      setError("Failed to load watch history")
    } finally {
      setLoading(false)
    }
  }

  const formatHistoryWithMovieData = async (arr: WatchHistoryItem[]): Promise<EnhancedHistoryItem[]> => {
    const formattedMovies = await Promise.all(
      arr.map(async (item, index) => {
        const watchedDate = new Date(item.watched_at)

        // Fetch additional movie data from TMDB
        const movieData = await fetchMovieDataFromTMDB(item.movie_name)

        return {
          id: item.movie_id || `history-${index}`,
          title: item.movie_name,
          genre: movieData.genres || ["Drama"], // Default genre if none found
          score: movieData.vote_average || Math.random() * 3 + 7, // Random score between 7-10 if none found
          match: Math.floor(Math.random() * 30 + 70), // Random match percentage 70-100%
          year: movieData.release_date ? movieData.release_date.slice(0, 4) : watchedDate.getFullYear().toString(),
          poster:
            movieData.poster_path ||
            `/placeholder.svg?height=400&width=300&text=${encodeURIComponent(item.movie_name)}`,
          watched_at: item.watched_at,
          isHistoryItem: true,
          watchedDate: watchedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        }
      }),
    )

    return formattedMovies
  }

  // Alternative: Format history with better placeholder data (if you don't want to use TMDB)
  const formatHistoryWithPlaceholders = (arr: WatchHistoryItem[]): EnhancedHistoryItem[] =>
    arr.map((item, index) => {
      const watchedDate = new Date(item.watched_at)

      // Generate some realistic placeholder data
      const genres = ["Drama", "Action", "Comedy", "Thriller", "Romance", "Horror", "Sci-Fi"]
      const randomGenres = [genres[Math.floor(Math.random() * genres.length)]]

      return {
        id: item.movie_id || `history-${index}`,
        title: item.movie_name,
        genre: randomGenres,
        score: Math.round((Math.random() * 3 + 7) * 10) / 10, // Random score between 7.0-10.0
        match: Math.floor(Math.random() * 30 + 70), // Random match percentage 70-100%
        year: "2023", // Default year or extract from movie name if possible
        poster: `/placeholder.svg?height=400&width=300&text=${encodeURIComponent(item.movie_name)}`,
        watched_at: item.watched_at,
        isHistoryItem: true,
        watchedDate: watchedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }
    })

  const handleRefresh = () => {
    fetchHistory()
  }

  const groupHistoryByDate = (history: EnhancedHistoryItem[]) => {
    const groups: { [key: string]: EnhancedHistoryItem[] } = {}

    history.forEach((item) => {
      const date = new Date(item.watched_at)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let groupKey: string
      if (date.toDateString() === today.toDateString()) {
        groupKey = "Today"
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday"
      } else {
        groupKey = item.watchedDate
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
    })

    return groups
  }

  // Show loading state
  if (loading) {
    return (
      <div className="mb-16 px-6 lg:px-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl font-black text-white tracking-tight">Recently Watched</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-white text-lg">Loading your watch history...</div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-16 px-6 lg:px-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl font-black text-white tracking-tight">Recently Watched</h2>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-red-400 text-lg">{error}</div>
        </div>
      </div>
    )
  }

  // Don't render if no history
  if (!history.length) {
    return (
      <div className="mb-16 px-6 lg:px-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl font-black text-white tracking-tight">Recently Watched</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">No watch history yet</div>
            <div className="text-gray-500 text-sm">
              Start watching movies to see them here and get better recommendations!
            </div>
          </div>
        </div>
      </div>
    )
  }

  const groupedHistory = groupHistoryByDate(history)

  return (
    <div className="mb-16 px-6 lg:px-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Clock className="w-8 h-8 text-red-500" />
          <h2 className="text-3xl font-black text-white tracking-tight">Recently Watched</h2>
          <Badge variant="outline" className="border-gray-600 text-gray-300">
            {history.length} movies
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setViewMode(viewMode === "cards" ? "list" : "cards")}
            variant="outline"
            size="sm"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            {viewMode === "cards" ? "List View" : "Card View"}
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {viewMode === "cards" ? (
        <MovieSection
          section={{
            title: "Recently Watched",
            movies: history,
          }}
          icon={Clock}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([dateGroup, movies]) => (
            <div key={dateGroup}>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                {dateGroup}
              </h3>
              <div className="space-y-2">
                {movies.map((movie) => (
                  <Card key={movie.id} className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-24 bg-gray-800 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {movie.poster && movie.poster !== "/placeholder.svg" ? (
                            <img
                              src={movie.poster || "/placeholder.svg"}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                                target.nextElementSibling!.classList.remove("hidden")
                              }}
                            />
                          ) : null}
                          <div className="text-gray-400 text-xs">🎬</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-lg">{movie.title}</h4>
                          <p className="text-gray-400 text-sm">
                            Watched on {new Date(movie.watched_at).toLocaleString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs border-blue-600 text-blue-400">
                              In History
                            </Badge>
                            {movie.genre.length > 0 && (
                              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                                {movie.genre[0]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
