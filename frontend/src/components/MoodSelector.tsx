"use client"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Smile, Zap, Moon, FlameIcon as Fire, ChevronLeft, ChevronRight } from "lucide-react"
import MovieSection from "./MovieSection"
import { getRecommendations, type MovieRecommendation } from "../../services/api"

const moods = [
  {
    id: "happy",
    label: "HAPPY",
    icon: Smile,
    color: "border-yellow-400 text-yellow-300",
  },
  {
    id: "sad",
    label: "SAD",
    icon: Heart,
    color: "border-blue-300 text-blue-300",
  },
  {
    id: "thrilled",
    label: "THRILLED",
    icon: Zap,
    color: "border-red-500 text-red-400",
  },
  {
    id: "scared",
    label: "SCARED",
    icon: Fire,
    color: "border-purple-400 text-purple-400",
  },
  {
    id: "curious",
    label: "CURIOUS",
    icon: Moon,
    color: "border-green-400 text-green-400",
  },
]

export default function MoodSelector() {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [movieSections, setMovieSections] = useState<Record<string, MovieRecommendation[]>>({})
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const sectionsRef = useRef<HTMLDivElement>(null)
  const moodScrollRef = useRef<HTMLDivElement>(null)

  const checkMoodScrollButtons = () => {
    if (moodScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = moodScrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkMoodScrollButtons()
    const scrollElement = moodScrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkMoodScrollButtons)
      return () => scrollElement.removeEventListener("scroll", checkMoodScrollButtons)
    }
  }, [])

  const scrollMoodsLeft = () => {
    if (moodScrollRef.current) {
      moodScrollRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      })
    }
  }

  const scrollMoodsRight = () => {
    if (moodScrollRef.current) {
      moodScrollRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      })
    }
  }

  const toggleMood = async (moodId: string) => {
    const alreadySelected = selectedMoods.includes(moodId)
    const newSelected = alreadySelected ? [] : [moodId]
    setSelectedMoods(newSelected)

    if (!alreadySelected) {
      setTimeout(() => {
        sectionsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 90)

      if (!movieSections[moodId]) {
        try {
          const recommendations = await getRecommendations(moodId)
          setMovieSections((prev) => ({ ...prev, [moodId]: recommendations }))
          console.log(recommendations)
        } catch (err) {
          console.error(`Failed to fetch recommendations for mood: ${moodId}`, err)
        }
      }
    }
  }

  const getMoodIcon = (moodId: string) => {
    return moods.find((mood) => mood.id === moodId)?.icon || Fire
  }

  return (
    <div className="mb-12 px-6 lg:px-12">
      <h2 className="text-white text-3xl font-black mb-8 tracking-wide">SELECT YOUR MOOD</h2>

      {/* Mood Selection with Horizontal Scroll */}
      <div className="relative">
        <div
          ref={moodScrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {moods.map((mood) => {
            const Icon = mood.icon
            const isSelected = selectedMoods.includes(mood.id)
            return (
              <Button
                key={mood.id}
                variant="outline"
                onClick={() => toggleMood(mood.id)}
                className={`border-2 transition-all duration-300 px-6 py-3 text-sm font-bold tracking-wide flex-shrink-0 ${
                  isSelected
                    ? `${mood.color} bg-red-500/20 hover:bg-red-500/30 shadow-lg shadow-red-500/20`
                    : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {mood.label}
              </Button>
            )
          })}
        </div>

        {/* Scroll Buttons for Moods */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollMoodsLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white hover:text-red-400 border border-gray-700 hover:border-red-500 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}

        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollMoodsRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white hover:text-red-400 border border-gray-700 hover:border-red-500 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Empty State Section */}
      {selectedMoods.length === 0 && (
        <div className="mt-16 text-center py-20 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-gray-800">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">🎭</div>
            <h3 className="text-white text-2xl font-bold mb-4">Choose Your Movie Mood</h3>
            <p className="text-gray-400 text-lg mb-6">
              Select a mood above to discover personalized movie recommendations tailored just for you.
            </p>
            <div className="flex justify-center gap-2 text-sm text-gray-500">
              <span>🎬 Curated picks</span>
              <span>•</span>
              <span>✨ Perfect matches</span>
              <span>•</span>
              <span>🍿 Ready to watch</span>
            </div>
          </div>
        </div>
      )}

      {/* Movie Sections */}
      <div ref={sectionsRef} className="space-y-8 mt-10">
        {selectedMoods.map((moodId) => {
          const movies = movieSections[moodId]
          if (!movies) return null

          const MoodIcon = getMoodIcon(moodId)

          return (
            <MovieSection
              section={{
                title: moods.find((m) => m.id === moodId)?.label || "Recommendations",
                movies: movies
                  .filter((movie) => movie.poster_path) // skip if poster_path is null or undefined
                  .map((movie, idx) => ({
                    id: idx,
                    title: movie.title,
                    genre: movie.genres,
                    score: Number(movie.score.toFixed(2)),
                    match: Math.round(movie.score * 10),
                    year: movie.release_date ? Number.parseInt(movie.release_date.slice(0, 4)) : 2023,
                    poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                  })),
              }}
              icon={MoodIcon}
            />
          )
        })}
      </div>
    </div>
  )
}
