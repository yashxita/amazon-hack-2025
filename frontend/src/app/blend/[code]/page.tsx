"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Copy, RefreshCw, ArrowLeft, Plus } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

import { getBlend, getCurrentUser, addToWatchHistory, type BlendResponse, type User } from "../../../../services/api"
import MovieCard from "../../../components/MovieCard"

const getInitials = (name: string) =>
  name
    .split(/[ @._-]/)
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2)

/* ───────── component ───────── */

export default function BlendDetailPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [blend, setBlend] = useState<BlendResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        await loadBlend()
      } catch {
        setError("Failed to load user info. Please login.")
        toast.error("Please login to access this blend.")
      }
    }
    init()
  }, [code])

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!blend) return
    const interval = setInterval(() => loadBlend(true), 5000)
    return () => clearInterval(interval)
  }, [blend])

  const loadBlend = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    setError(null)

    try {
      const blendData = await getBlend(code)
      setBlend(blendData)
    } catch (err: any) {
      const errorMsg = err.response?.status === 404 ? "Blend not found" : err.message || "Failed to load blend"
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  console.log

  const copyBlendCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success("Blend code copied to clipboard")
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading blend...</p>
        </div>
      </div>
    )
  }

  if (error || !blend) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Error</h2>
            <p className="text-gray-300 mb-6">{error || "Blend not found"}</p>
            <Button onClick={() => router.push("/blend")} className="w-full">
              Back to Blends
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button size="sm" onClick={() => router.push("/blend")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Blend: {code}</h1>
            <p className="text-gray-400">
              {blend.users.length} member{blend.users.length !== 1 ? "s" : ""} • Match: {blend.overall_match_score}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={copyBlendCode}>
              <Copy className="w-4 h-4 mr-1" />
              Copy Code
            </Button>
            <Button size="sm" onClick={() => loadBlend(true)} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Members ({blend.users.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {blend.users.map((username, index) => (
                    <div key={`${username}-${index}`} className="flex flex-col items-center gap-2">
                      <Avatar className="w-12 h-12 bg-gray-700 border-2 border-gray-600">
                        <AvatarFallback className="text-white font-bold">{getInitials(username)}</AvatarFallback>
                      </Avatar>
                      <span className="text-gray-300 text-xs text-center max-w-[60px] truncate">{username}</span>
                    </div>
                  ))}
                </div>

                {Object.keys(blend.user_tags).length > 0 && (
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-white font-semibold mb-3 text-sm">Preferences</h4>
                    <div className="space-y-2">
                      {Object.entries(blend.user_tags).map(([userId, tag]) => (
                        <div key={userId} className="flex items-center gap-2 p-2 bg-gray-900 rounded text-sm">
                          <Avatar className="w-5 h-5 bg-gray-700">
                            <AvatarFallback className="text-xs">{getInitials(userId)}</AvatarFallback>
                          </Avatar>
                          <span className="text-gray-300 truncate">{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-white font-semibold mb-2 text-sm">Invite Friends</h4>
                  <p className="text-gray-400 text-xs mb-2">Share this code:</p>
                  <div className="bg-gray-900 p-2 rounded text-center">
                    <code className="text-blue-400 font-mono">{code}</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 ">
            <Card className="flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">
                  Blended Recommendations
                  {blend.users.length < 2 && (
                    <span className="text-gray-500 text-sm font-normal ml-2">(Need 2+ members)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {blend.users.length < 2 ? (
                  <div className="text-center py-16 text-gray-500">
                    <Users className="w-20 h-20 mx-auto mb-6 opacity-30" />
                    <h3 className="text-xl mb-2">Waiting for more members...</h3>
                    <p className="text-sm mb-4">Share your blend code to get personalized recommendations</p>
                    <div className="bg-gray-900 p-3 rounded-lg inline-block">
                      <code className="text-blue-400 font-mono text-lg">{code}</code>
                    </div>
                  </div>
                ) : blend.recommendations.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                      <RefreshCw className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl mb-2">No recommendations yet</h3>
                    <p className="text-sm mb-4">Make sure all members have added their movie history</p>
                    
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-6 justify-center">
                    {blend.recommendations.map((rec, index) => (
                      <MovieCard
                        key={`${rec.title}-${index}`}
                        movie={{
                          id: `blend_${index}`,
                          title: rec.title,
                          poster: rec.poster_path?.startsWith("http")
                            ? rec.poster_path
                            : `https://image.tmdb.org/t/p/w500${rec.poster_path}`,
                          genre: rec.genres,
                          score: (rec.match_score * 10).toFixed(1),
                          year: "2024", // You might want to add release year to your blend recommendation data
                          match: Math.round(rec.match_score * 100),
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
