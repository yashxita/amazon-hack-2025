"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "lucide-react"
import MovieCard from "./MovieCard"
import { getRecommendations, type MovieRecommendation } from "../../services/api"

const dayMoodMap: Record<string, string> = {
  monday: "sad",
  tuesday: "curious",
  wednesday: "happy",
  thursday: "thrilled",
  friday: "curious",
  saturday: "scared",
  sunday: "happy",
}

export default function DayRecommendationSection() {
  const [dayRecommendation, setDayRecommendation] = useState<{
    title: string
    description: string
    movies: MovieRecommendation[]
  } | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
      const mood = dayMoodMap[today]

      if (!mood) return

      try {
        const recommendations = await getRecommendations(mood)
        const filteredMovies = recommendations.filter((movie) => movie.poster_path)

        setDayRecommendation({
          title: `${today.charAt(0).toUpperCase() + today.slice(1)} — ${mood.toUpperCase()} Vibes`,
          description: `Based on your day, here are some ${mood} mood picks.`,
          movies: filteredMovies.map((movie, idx) => ({
            ...movie,
            id: idx,
            score: Number(movie.score.toFixed(2)),
            match: Math.round(movie.score * 10),
            year: movie.release_date?.slice(0, 4),
            poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          })),
        })
      } catch (err) {
        console.error("Failed to fetch day mood recommendations", err)
      }
    }

    fetchRecommendations()
  }, [])

  if (!dayRecommendation) return null

  return (
    <div className="mb-16 px-6 lg:px-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Calendar className="w-8 h-8 text-red-400" />
          <div>
            <h2 className="text-white text-3xl font-black tracking-wide">
              {dayRecommendation.title}
            </h2>
            <p className="text-gray-400 text-lg">
              {dayRecommendation.description}
            </p>
          </div>
        </div>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-6 pb-4">
          {dayRecommendation.movies.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
