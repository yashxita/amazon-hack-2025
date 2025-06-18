"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Star } from "lucide-react"
import { useState } from "react"

export default function MovieCard({ movie }: { movie: any }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  console.log("Movie Poster:", movie.poster)

  return (
    <Card className="group relative w-56 flex-shrink-0 bg-black border border-gray-800 hover:border-red-500 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden rounded-md">
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

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <Button
              size="icon"
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16 shadow-lg shadow-red-500/50"
            >
              <Play className="w-8 h-8 fill-white ml-1" />
            </Button>
          </div>

          {/* Match Score Badge */}
          {movie.match && (
            <div className="absolute top-3 right-3 bg-black/90 px-3 py-1 rounded-full border border-blue-400">
              <span className="text-blue-400 text-sm font-bold">{movie.match}%</span>
            </div>
          )}

          {/* Trending Badge */}
          {movie.trending && (
            <div className="absolute top-3 right-3 bg-black/90 px-3 py-1 rounded-full border border-green-400">
              <span className="text-green-400 text-sm font-bold">{movie.trending}</span>
            </div>
          )}

          {/* Year Badge */}
          <div className="absolute top-3 left-3 bg-black/90 px-2 py-1 rounded">
            <span className="text-white text-xs font-bold">{movie.year}</span>
          </div>
        </div>

        {/* Movie Info Overlay */}
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
