"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Home,
  Bookmark,
  Users,
  Search,
  User,
  Play,
  Plus,
  Star,
  Heart,
  Smile,
  Zap,
  Coffee,
  Moon,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Info,
  ThumbsUp,
  Share2,
  Clock,
  Calendar,
  TrendingUp,
  FlameIcon as Fire,
  Award,
} from "lucide-react"
import Image from "next/image"
import MovieSection from "./MovieSection"

const movieSections = {
  adventurous: {
    title: "FEELING ADVENTUROUS?",
    movies: [
      {
        id: 1,
        title: "Dune: Part Two",
        genre: ["Sci-Fi", "Adventure"],
        rating: 8.9,
        match: 95,
        year: 2024,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 2,
        title: "Mad Max: Fury Road",
        genre: ["Action", "Adventure"],
        rating: 8.1,
        match: 92,
        year: 2015,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 3,
        title: "Inception",
        genre: ["Sci-Fi", "Thriller"],
        rating: 8.8,
        match: 88,
        year: 2010,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 4,
        title: "The Matrix",
        genre: ["Sci-Fi", "Action"],
        rating: 8.7,
        match: 90,
        year: 1999,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 5,
        title: "Interstellar",
        genre: ["Sci-Fi", "Drama"],
        rating: 8.6,
        match: 87,
        year: 2014,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 6,
        title: "Blade Runner 2049",
        genre: ["Sci-Fi", "Drama"],
        rating: 8.0,
        match: 89,
        year: 2017,
        poster: "/placeholder.svg?height=400&width=280",
      },
    ],
  },
  chill: {
    title: "FOR A CHILL EVENING",
    movies: [
      {
        id: 7,
        title: "Lost in Translation",
        genre: ["Drama", "Romance"],
        rating: 7.7,
        match: 89,
        year: 2003,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 8,
        title: "Her",
        genre: ["Romance", "Sci-Fi"],
        rating: 8.0,
        match: 91,
        year: 2013,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 9,
        title: "The Grand Budapest Hotel",
        genre: ["Comedy", "Drama"],
        rating: 8.1,
        match: 85,
        year: 2014,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 10,
        title: "Midnight in Paris",
        genre: ["Comedy", "Romance"],
        rating: 7.7,
        match: 83,
        year: 2011,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 11,
        title: "Before Sunset",
        genre: ["Romance", "Drama"],
        rating: 8.1,
        match: 88,
        year: 2004,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 12,
        title: "Call Me By Your Name",
        genre: ["Romance", "Drama"],
        rating: 7.9,
        match: 86,
        year: 2017,
        poster: "/placeholder.svg?height=400&width=280",
      },
    ],
  },
  heartbreak: {
    title: "MOOD: HEARTBREAK & HEALING",
    movies: [
      {
        id: 13,
        title: "Eternal Sunshine",
        genre: ["Romance", "Drama"],
        rating: 8.3,
        match: 94,
        year: 2004,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 14,
        title: "500 Days of Summer",
        genre: ["Romance", "Comedy"],
        rating: 7.7,
        match: 89,
        year: 2009,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 15,
        title: "Blue Valentine",
        genre: ["Romance", "Drama"],
        rating: 7.3,
        match: 86,
        year: 2010,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 16,
        title: "Marriage Story",
        genre: ["Drama", "Romance"],
        rating: 7.9,
        match: 91,
        year: 2019,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 17,
        title: "La La Land",
        genre: ["Romance", "Musical"],
        rating: 8.0,
        match: 87,
        year: 2016,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 18,
        title: "Her",
        genre: ["Romance", "Sci-Fi"],
        rating: 8.0,
        match: 88,
        year: 2013,
        poster: "/placeholder.svg?height=400&width=280",
      },
    ],
  },
  comedy: {
    title: "LAUGH TILL YOU DROP",
    movies: [
      {
        id: 19,
        title: "The Grand Budapest Hotel",
        genre: ["Comedy", "Adventure"],
        rating: 8.1,
        match: 93,
        year: 2014,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 20,
        title: "Superbad",
        genre: ["Comedy"],
        rating: 7.6,
        match: 89,
        year: 2007,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 21,
        title: "Knives Out",
        genre: ["Comedy", "Mystery"],
        rating: 7.9,
        match: 91,
        year: 2019,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 22,
        title: "The Nice Guys",
        genre: ["Comedy", "Action"],
        rating: 7.4,
        match: 85,
        year: 2016,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 23,
        title: "Game Night",
        genre: ["Comedy", "Thriller"],
        rating: 6.9,
        match: 82,
        year: 2018,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 24,
        title: "Parasite",
        genre: ["Comedy", "Thriller"],
        rating: 8.5,
        match: 90,
        year: 2019,
        poster: "/placeholder.svg?height=400&width=280",
      },
    ],
  },
  mystery: {
    title: "MYSTERIOUS DEPTHS",
    movies: [
      {
        id: 25,
        title: "Shutter Island",
        genre: ["Mystery", "Thriller"],
        rating: 8.2,
        match: 92,
        year: 2010,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 26,
        title: "Gone Girl",
        genre: ["Mystery", "Thriller"],
        rating: 8.1,
        match: 89,
        year: 2014,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 27,
        title: "Zodiac",
        genre: ["Mystery", "Crime"],
        rating: 7.7,
        match: 87,
        year: 2007,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 28,
        title: "The Prestige",
        genre: ["Mystery", "Drama"],
        rating: 8.5,
        match: 94,
        year: 2006,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 29,
        title: "Prisoners",
        genre: ["Mystery", "Thriller"],
        rating: 8.1,
        match: 88,
        year: 2013,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 30,
        title: "Memento",
        genre: ["Mystery", "Thriller"],
        rating: 8.4,
        match: 91,
        year: 2000,
        poster: "/placeholder.svg?height=400&width=280",
      },
    ],
  },
}
const moods = [
  { id: "adventurous", label: "ADVENTUROUS", icon: Zap, color: "border-red-500 text-red-400" },
  { id: "chill", label: "CHILL", icon: Coffee, color: "border-blue-400 text-blue-400" },
  { id: "heartbreak", label: "HEARTBREAK", icon: Heart, color: "border-red-400 text-red-400" },
  { id: "comedy", label: "COMEDY", icon: Smile, color: "border-blue-500 text-blue-400" },
  { id: "mystery", label: "MYSTERY", icon: Moon, color: "border-purple-400 text-purple-400" },
]

export default function MoodSelector() {
const [selectedMoods, setSelectedMoods] = useState(["adventurous"]);
const sectionsRef = useRef<HTMLDivElement>(null)

const toggleMood = (moodId: string) => {
    setSelectedMoods((prev) => {
      const newMoods = prev.includes(moodId) ? prev.filter((id) => id !== moodId) : [...prev, moodId]

      // Auto-scroll to mood recommendations after state update
      setTimeout(() => {
        if (sectionsRef.current) {
          sectionsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      }, 100)

      return newMoods
    })
  }

  return (
    <div className="mb-12 px-6 lg:px-12">
      <h2 className="text-white text-3xl font-black mb-8 tracking-wide">
        SELECT YOUR MOOD
      </h2>
      <div className="flex flex-wrap gap-4">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMoods.includes(mood.id);
          return (
            <Button
              key={mood.id}
              variant="outline"
              onClick={() => toggleMood(mood.id)}
              className={`border-2 transition-all duration-300 px-6 py-3 text-sm font-bold tracking-wide ${
                isSelected
                  ? `${mood.color} bg-red-500/20 hover:bg-red-500/30 shadow-lg shadow-red-500/20`
                  : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {mood.label}
            </Button>
          );
        })}
      </div>
      <div ref={sectionsRef} className="space-y-8">
                {selectedMoods.map((moodId) => {
                  const section = movieSections[moodId as keyof typeof movieSections]
                  return section ? <MovieSection key={moodId} section={section} icon={Fire} /> : null
                })}
              </div>
    </div>
  );
}
