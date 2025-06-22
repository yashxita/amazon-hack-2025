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
        <div className="container mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <h1 className="text-3xl font-black text-white tracking-tight">
                CINE<span className="text-red-500">AI</span>
              </h1>
              <div className="hidden md:flex gap-8">
                <Button
                  onClick={() => setActiveTab("home")}
                  className={`text-white hover:text-red-400 font-semibold tracking-wide ${
                    activeTab === "home" ? "text-red-400" : ""
                  }`}
                >
                  MOVIES
                </Button>
                <Button
                  onClick={() => router.push("/watchlist")}
                  className="text-white hover:text-red-400 font-semibold tracking-wide"
                >
                  WATCHLISTS
                </Button>
                <Button
                  onClick={() => router.push("/blend")}
                  className={`text-white hover:text-red-400 font-semibold tracking-wide ${
                    pathname.startsWith("/blend") ? "text-red-400" : ""
                  }`}
                >
                  BLEND
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <LandingSearch
                onMovieSelect={handleMovieSelect}
                onVoiceResults={handleVoiceResults}
                className="w-64"
              />

              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{user.username}</span>
                  <Button
                    className="border-red-500 text-red-400 bg-black hover:bg-red-100 font-semibold"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  className="border-blue-400 text-blue-400 hover:bg-blue-100 font-semibold"
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
