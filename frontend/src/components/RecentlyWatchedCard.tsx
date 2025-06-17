"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Star,
  Clock,
  FlameIcon as Fire,
} from "lucide-react"
import Image from "next/image"

export default function RecentlyWatchedCard({ movie }: { movie: any }){
    return(
    <Card className="group relative w-56 flex-shrink-0 bg-black border border-gray-800 hover:border-blue-400 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <Image
            src={movie.poster || "/placeholder.svg"}
            alt={movie.title}
            width={280}
            height={400}
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <Button
              size="icon"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-16 h-16 shadow-lg shadow-blue-500/50"
            >
              <Play className="w-8 h-8 fill-white ml-1" />
            </Button>
          </div>
          <div className="absolute top-3 right-3 bg-black/90 px-3 py-1 rounded-full border border-blue-400">
            <span className="text-blue-400 text-sm font-bold">{movie.progress}%</span>
          </div>
          <div className="absolute top-3 left-3 bg-black/90 px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400 text-xs">{movie.watchedAt}</span>
          </div>
          {movie.progress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${movie.progress}%` }} />
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{movie.title}</h3>
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genre.slice(0, 2).map((g: string) => (
              <Badge key={g} variant="outline" className="text-xs border-gray-600 text-gray-300 bg-black/50">
                {g}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-sm font-semibold">{movie.rating}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}