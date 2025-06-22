"use client"

import HeroTV from "./HeroTV"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import MoodSelector from "./MoodSelector"
import RecentlyWatchedSection from "./RecentlyWatchedSection"
import DayRecommendationSection from "./DayRecommendationSection"
import TopRatedSection from "./TopRatedSection"
import { logout, markMovieAsWatched, getCurrentUser } from "../../services/api"
import toast, { Toaster } from "react-hot-toast"
import LandingSearch from "../components/LandingSearch"
import VoiceRecommendations, { VoiceRecommendation } from "../components/VoiceRecommendations"

interface MovieSearchResult {
  id: string
  title: string
  genres?: string[]
  release_date?: string
  poster_path?: string
  score?: number
  [key: string]: any
}

export default function Landing() {
  const [activeTab, setActiveTab] = useState("home")
  const [user, setUser] = useState<{ id: string; username: string } | null>(null)
  const [isAddingToHistory, setIsAddingToHistory] = useState(false)
  const [addedToHistory, setAddedToHistory] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const [voiceRecommendations, setVoiceRecommendations] = useState<VoiceRecommendation[]>([])
  const [showVoiceRecommendations, setShowVoiceRecommendations] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser()
        setUser(user)
      } catch (err) {
        console.warn("Not logged in or session expired", err)
        localStorage.removeItem("token")
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    toast.success("Log Out Successful")
  }

  const handleMovieSelect = async (movie: MovieSearchResult) => {
    if (isAddingToHistory || addedToHistory) return

    console.log("Adding movie to history:", movie)
    setIsAddingToHistory(true)

    try {
      await markMovieAsWatched({
        movie_id: movie.id?.toString() || movie.title,
        movie_name: movie.title,
      })

      setAddedToHistory(true)
      toast.success(`"${movie.title}" added to watch history`)

      setTimeout(() => {
        setAddedToHistory(false)
      }, 2000)
    } catch (error) {
      console.error("Error adding movie to history:", error)
      toast.error("Failed to mark movie as watched")
    } finally {
      setIsAddingToHistory(false)
    }
  }

  const handleVoiceResults = (results: MovieSearchResult[]) => {
    const sanitized: VoiceRecommendation[] = results.map((movie) => ({
      ...movie,
      score: movie.score ?? 0,
      genres: movie.genres ?? [],
      poster_path: movie.poster_path ?? "/placeholder.svg",
      release_date: movie.release_date ?? "N/A",
    }))
    setVoiceRecommendations(sanitized)
    setShowVoiceRecommendations(true)
  }

  const handleCloseVoiceResults = () => {
    setShowVoiceRecommendations(false)
    setVoiceRecommendations([])
  }

  const handleNewVoiceSearch = () => {
    setShowVoiceRecommendations(false)
    // The voice search modal will be triggered by the search component
  }

  return (
    <div className="min-h-screen bg-black">
      <Toaster />
<nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
  <div className="container mx-auto px-3 sm:px-6 lg:px-12 py-1.5 sm:py-3">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">

      {/* Logo + Nav Buttons */}
      <div className="flex flex-wrap items-center justify-between w-full sm:w-auto gap-2 sm:gap-6">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
          CINE<span className="text-red-500">AI</span>
        </h1>

        <div className="flex flex-wrap gap-1.5 text-xs sm:text-sm">
          <Button
            onClick={() => setActiveTab("home")}
            className={`px-2 py-1 text-white hover:text-red-400 font-medium tracking-tight ${
              activeTab === "home" ? "text-red-400" : ""
            }`}
          >
            MOVIES
          </Button>
          <Button
            onClick={() => router.push("/watchlist")}
            className="px-2 py-1 text-white hover:text-red-400 font-medium tracking-tight"
          >
            WATCHLISTS
          </Button>
          <Button
            onClick={() => router.push("/blend")}
            className={`px-2 py-1 text-white hover:text-red-400 font-medium tracking-tight ${
              pathname.startsWith("/blend") ? "text-red-400" : ""
            }`}
          >
            BLEND
          </Button>
        </div>
      </div>

      {/* Search + Login/Logout */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto ">
        <LandingSearch
          onMovieSelect={handleMovieSelect}
          onVoiceResults={handleVoiceResults}
          className="w-full sm:w-64 md:w-72 mr-10"
        />

        {user ? (
          <div className="flex items-center gap-1.5">
            <span className="text-white text-sm font-medium">{user.username}</span>
            <Button
              className="text-xs border-red-500 text-red-400 bg-black hover:bg-red-100 font-medium px-2 py-1"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button
            className="text-xs border-blue-400 text-blue-400 hover:bg-blue-100 font-medium px-2 py-1"
            onClick={() => router.push("/login")}
          >
            LOGIN
          </Button>
        )}
      </div>

    </div>
  </div>
</nav>

      {/* Main Content */}
      <main className="pt-20 space-y-8">
        <VoiceRecommendations
          recommendations={voiceRecommendations}
          onClose={handleCloseVoiceResults}
          onNewVoiceSearch={handleNewVoiceSearch}
          isVisible={showVoiceRecommendations}
        />

        {activeTab === "home" && !showVoiceRecommendations && (
          <div>
            <HeroTV />
            <div className="py-16">
              <RecentlyWatchedSection />
              <DayRecommendationSection />
              <MoodSelector />
              <TopRatedSection />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
