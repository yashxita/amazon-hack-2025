"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { getUserHistory } from "../../services/api"
import MovieSection from "./MovieSection"

export default function RecentlyWatchedSection() {
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    const stored = getUserHistory()
    setHistory(formatHistory(stored))
  }, [])

  const formatHistory = (arr: any[]) =>
    arr.map((movie) => ({
      id: movie.id,
      title: movie.title,
      genre: movie.genres,
      score: Number(movie.score.toFixed(2)),
      match: Math.round(movie.score * 10),
      year: movie.release_date?.slice(0, 4) || "N/A",
      poster: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
    }))

  // const handleMovieClick = (movie: any) => {
  //   setHistory((prev) => {
  //     const filtered = prev.filter((m) => m.title !== movie.title)
  //     return [formatHistory([movie])[0], ...filtered]
  //   })
  // }

  if (!history.length) return null

  return (
    <div className="mb-16 px-6 lg:px-12">
      <MovieSection
        section={{
          title: "Recently Watched",
          movies: history,
        }}
        icon={Clock}
      />
    </div>
  )
}
