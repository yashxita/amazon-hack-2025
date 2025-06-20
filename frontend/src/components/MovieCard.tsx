"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Star, Check } from "lucide-react"
import { useState } from "react"
import { addToWatchHistory } from "../../services/api"

export default function MovieCard({ movie }: { movie: any }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [isAddingToHistory, setIsAddingToHistory] = useState(false)
  const [addedToHistory, setAddedToHistory] = useState(false)

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleClick = async () => {
    if (isAddingToHistory || addedToHistory) return

    console.log("Adding movie to history:", movie)
    setIsAddingToHistory(true)

    try {
      // Add to watch history in database
      await addToWatchHistory({
        movie_id: movie.id?.toString() || movie.title, // Use ID if available, fallback to title
        movie_name: movie.title,
      })

      setAddedToHistory(true)

      // Show success feedback briefly
      setTimeout(() => {
        setAddedToHistory(false)
      }, 2000)

      console.log(`"${movie.title}" added to watch history!`)
    } catch (error) {
      console.error("Error adding movie to history:", error)
      // You could show an error toast here
    } finally {
      setIsAddingToHistory(false)
    }
  }

  return (
    <Card
      onClick={handleClick}
      className={`group relative w-56 flex-shrink-0 bg-black border transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden rounded-md ${
        addedToHistory
          ? "border-green-500 shadow-lg shadow-green-500/20"
          : isAddingToHistory
            ? "border-blue-500 shadow-lg shadow-blue-500/20"
            : "border-gray-800 hover:border-red-500"
      }`}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-md">
          <div className="w-full h-80 bg-gray-800 flex items-center justify-center">
            {imageLoading && !imageError && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                <div className="text-gray-400 text-sm">Loading...</div>
              </div>
            )}
            {imageError ? (
              <div className="w-full h-80 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">🎬</div>
                  <div className="text-sm">No Image</div>
                </div>
              </div>
            ) : (
              <img
                src={movie.poster || "/placeholder.svg"}
                alt={movie.title}
                className="w-full h-80 object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{ display: imageLoading ? "none" : "block" }}
              />
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
              addedToHistory || isAddingToHistory
                ? "opacity-100 bg-black/60"
                : "opacity-0 group-hover:opacity-100 bg-black/60"
            }`}
          >
            {addedToHistory ? (
              <Button
                size="icon"
                className="bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 shadow-lg shadow-green-500/50"
                disabled
              >
                <Check className="w-8 h-8" />
              </Button>
            ) : isAddingToHistory ? (
              <Button
                size="icon"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-16 h-16 shadow-lg shadow-blue-500/50"
                disabled
              >
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </Button>
            ) : (
              <Button
                size="icon"
                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16 shadow-lg shadow-red-500/50"
              >
                <Play className="w-8 h-8 fill-white ml-1" />
              </Button>
            )}
          </div>

          {movie.match && (
            <div className="absolute top-3 right-3 bg-black/90 px-3 py-1 rounded-full border border-blue-400">
              <span className="text-blue-400 text-sm font-bold">{movie.match}%</span>
            </div>
          )}

          {movie.trending && (
            <div className="absolute top-3 right-3 bg-black/90 px-3 py-1 rounded-full border border-green-400">
              <span className="text-green-400 text-sm font-bold">{movie.trending}</span>
            </div>
          )}

          <div className="absolute top-3 left-3 bg-black/90 px-2 py-1 rounded">
            <span className="text-white text-xs font-bold">{movie.year}</span>
          </div>

          {/* Status indicator */}
          {(addedToHistory || isAddingToHistory) && (
            <div
              className={`absolute bottom-20 left-3 px-3 py-1 rounded-full text-xs font-bold ${
                addedToHistory
                  ? "bg-green-500/90 text-white border border-green-400"
                  : "bg-blue-500/90 text-white border border-blue-400"
              }`}
            >
              {addedToHistory ? "Added to History!" : "Adding..."}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{movie.title}</h3>
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genre?.slice(0, 2).map((g: string) => (
              <Badge key={g} variant="outline" className="text-xs border-gray-600 text-gray-300 bg-black/50">
                {g}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-sm font-semibold">{movie.score}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
