"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Plus,
  Star,
  Volume2,
  Info,
  ThumbsUp,
  Share2,
  FlameIcon as Fire,
} from "lucide-react"
import Image from "next/image"

const featuredMovies = [
  {
    id: 1,
    title: "DUNE: PART TWO",
    subtitle: "Epic Sci-Fi Adventure • 2024",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.",
    rating: 8.9,
    year: 2024,
    genre: ["Sci-Fi", "Adventure", "Drama"],
    backdrop: "/placeholder.svg?height=800&width=1400",
    poster: "/placeholder.svg?height=600&width=400",
  },
  {
    id: 2,
    title: "OPPENHEIMER",
    subtitle: "Historical Drama • 2023",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II. A gripping tale of science, politics, and moral responsibility.",
    rating: 8.3,
    year: 2023,
    genre: ["Drama", "History", "Biography"],
    backdrop: "/placeholder.svg?height=800&width=1400",
    poster: "/placeholder.svg?height=600&width=400",
  },
  {
    id: 3,
    title: "SPIDER-MAN: ACROSS THE SPIDER-VERSE",
    subtitle: "Animated Adventure • 2023",
    description:
      "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. A visually stunning animated masterpiece.",
    rating: 8.7,
    year: 2023,
    genre: ["Animation", "Action", "Adventure"],
    backdrop: "/placeholder.svg?height=800&width=1400",
    poster: "/placeholder.svg?height=600&width=400",
  },
  {
    id: 4,
    title: "THE BATMAN",
    subtitle: "Dark Crime Thriller • 2022",
    description:
      "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
    rating: 7.8,
    year: 2022,
    genre: ["Action", "Crime", "Drama"],
    backdrop: "/placeholder.svg?height=800&width=1400",
    poster: "/placeholder.svg?height=600&width=400",
  },
]
export default function Hero() {
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const currentFeatured = featuredMovies[currentHeroIndex]
     // Auto-swipe hero section
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % featuredMovies.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [])
    return(
       <div className="relative h-screen w-full overflow-hidden bg-red-500">
      <div className="absolute inset-0">
        <Image
          src={currentFeatured.backdrop || "/placeholder.svg"}
          alt={currentFeatured.title}
          fill
          className="object-cover transition-all duration-1000"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Hero Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentHeroIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentHeroIndex ? "bg-red-500" : "bg-gray-600 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500 px-4 py-2 rounded-full mb-4">
                <Play className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-semibold text-sm">NOW STREAMING</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-white mb-4 tracking-tight">
                {currentFeatured.title}
              </h1>
              <p className="text-blue-400 text-xl font-semibold mb-4">{currentFeatured.subtitle}</p>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">{currentFeatured.description}</p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-bold text-lg">{currentFeatured.rating}</span>
              </div>
              <div className="flex gap-2">
                {currentFeatured.genre.map((g) => (
                  <Badge key={g} variant="outline" className="border-gray-600 text-gray-300 bg-black/50">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg font-semibold shadow-lg shadow-red-500/30">
                <Play className="w-5 h-5 mr-2 fill-white" />
                WATCH NOW
              </Button>
              <Button
                variant="outline"
                className="border-blue-400 text-blue-400 hover:bg-blue-400/10 px-8 py-3 text-lg font-semibold"
              >
                <Info className="w-5 h-5 mr-2" />
                MORE INFO
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-400">
                <ThumbsUp className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-400">
                <Plus className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-400">
                <Share2 className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Volume2 className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
}