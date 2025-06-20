"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Copy, RefreshCw, ArrowLeft, Plus } from "lucide-react"
import Image from "next/image"

import {
  getBlend,
  getCurrentUser,
  addHardcodedHistory,
  type BlendResponse,
  type User,
} from "../../../../services/api"



const getInitials = (name: string) =>
  name
    .split(/[ @._-]/)
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2)

/** Minimal replacement for toast notifications */
const notify = (title: string, description?: string) =>
  alert(description ? `${title}\n\n${description}` : title)

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
        notify("Authentication Error", "Please login to access this blend.")
      }
    }
    init()
  }, [code])

  // Auto-refresh every 5 s
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
      notify("Load Failed", errorMsg)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const copyBlendCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      notify("Copied!", "Blend code copied to clipboard")
    } catch {
      notify("Copy Failed", "Could not copy to clipboard")
    }
  }

  const handleAddHistory = async () => {
    try {
      await addHardcodedHistory()
      notify("History Added!", "Your movie history has been added. Refreshing blend...")
      setTimeout(() => loadBlend(true), 1000)
    } catch {
      notify("Error", "Failed to add movie history")
    }
  }

  /* ───────── render ───────── */

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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => router.push("/blend")} className="flex items-center gap-2">
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
            <Button variant="outline" size="sm" onClick={copyBlendCode}>
              <Copy className="w-4 h-4 mr-1" />
              Copy Code
            </Button>
            <Button variant="outline" size="sm" onClick={() => loadBlend(true)} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Add History Button */}
        <div className="mb-8">
          <Card className="bg-blue-900/20 border-blue-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Need better recommendations?</h3>
                  <p className="text-gray-300 text-sm">Add your movie history to improve blend results</p>
                </div>
                <Button onClick={handleAddHistory} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Members Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-black/50 border-gray-800">
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

          {/* Recommendations Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-black/50 border-gray-800">
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
                    <Button onClick={handleAddHistory} variant="outline">
                      Add Your History
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {blend.recommendations.map((rec, index) => (
                      <Card
                        key={`${rec.title}-${index}`}
                        className="bg-gray-900 border-gray-700 hover:border-red-500 transition-all duration-300 hover:shadow-lg"
                      >
                        <CardContent className="p-0">
                          <div className="flex">
                            {/* Movie Poster */}
                            <div className="w-24 h-36 bg-gray-800 rounded-l-lg flex-shrink-0 overflow-hidden">
                              {rec.poster_path ? (
                                <Image
                                  src={
                                    rec.poster_path.startsWith("http")
                                      ? rec.poster_path
                                      : `https://image.tmdb.org/t/p/w200${rec.poster_path}`
                                  }
                                  alt={rec.title}
                                  width={96}
                                  height={144}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = "none"
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                  <span className="text-gray-500 text-xs">No Image</span>
                                </div>
                              )}
                            </div>

                            {/* Movie Details */}
                            <div className="flex-1 p-4">
                              <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{rec.title}</h3>

                              <div className="flex flex-wrap gap-1 mb-3">
                                {rec.genres.slice(0, 3).map((genre, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs border-gray-600 text-gray-300">
                                    {genre}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">
                                  Match: {Math.round(rec.match_score * 100)}%
                                </span>
                                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                                    style={{ width: `${rec.match_score * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
