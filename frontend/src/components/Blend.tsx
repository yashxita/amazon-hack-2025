"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Copy, RefreshCw, Plus, LogIn } from "lucide-react"

import {
  createBlend,
  joinBlend,
  listBlends,
  getBlend,
  getCurrentUser,
  type BlendResponse,
  type BlendSummary,
  type User,
} from "../../services/api"

/* ───────────────── helpers ───────────────── */

const getInitials = (name: string) =>
  name
    .split(/[ @._-]/)
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2)

/** Minimal wrapper to replicate toast messages with alerts */
const notify = (title: string, description?: string) =>
  alert(description ? `${title}\n\n${description}` : title)

/* ───────────────── component ─────────────── */

export default function BlendPage() {
  // state
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [blends, setBlends] = useState<BlendSummary[]>([])
  const [activeBlend, setActiveBlend] = useState<BlendResponse | null>(null)

  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [loadingBlend, setLoadingBlend] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [blendName, setBlendName] = useState("")
  const [joinCode, setJoinCode] = useState("")

  const [error, setError] = useState<string | null>(null)

  /* ───────── init ───────── */
  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        await fetchBlends()
      } catch (err: any) {
        setError("Failed to load user info. Please login.")
        notify("Authentication Error", "Please login to access blend functionality.")
      }
    }
    init()
  }, [])

  /* ───────── auto-refresh ───────── */
  useEffect(() => {
    if (!currentUser) return
    const interval = setInterval(() => {
      fetchBlends()
      if (activeBlend) refreshActiveBlend()
    }, 10_000)
    return () => clearInterval(interval)
  }, [currentUser, activeBlend])

  /* ───────── data helpers ───────── */
  const fetchBlends = async () => {
    try {
      const blendsData = await listBlends()
      setBlends(blendsData)
    } catch (err) {
      console.error("Failed to fetch blends:", err)
    }
  }

  const refreshActiveBlend = async () => {
    if (!activeBlend) return
    setRefreshing(true)
    try {
      const updatedBlend = await getBlend(activeBlend.blend_code)
      setActiveBlend(updatedBlend)
    } catch (err) {
      console.error("Failed to refresh blend:", err)
    } finally {
      setRefreshing(false)
    }
  }

  /* ───────── create blend ───────── */
  const handleCreateBlend = async (e: FormEvent) => {
    e.preventDefault()
    if (!blendName.trim()) {
      notify("Error", "Please enter a blend name.")
      return
    }

    setCreating(true)
    setError(null)

    try {
      const newBlend = await createBlend({ name: blendName.trim() })
      setActiveBlend(newBlend)
      setBlendName("")
      await fetchBlends()

      notify(
        "Blend Created!",
        `Your blend "${blendName}" has been created. Share the code: ${newBlend.blend_code}`
      )
    } catch (err: any) {
      const errorMsg = err.message || "Failed to create blend"
      setError(errorMsg)
      notify("Creation Failed", errorMsg)
    } finally {
      setCreating(false)
    }
  }

  /* ───────── join blend ───────── */
  const handleJoinBlend = async (e: FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) {
      notify("Error", "Please enter a blend code.")
      return
    }

    setJoining(true)
    setError(null)

    try {
      const joinedBlend = await joinBlend({ code: joinCode.trim() })
      setActiveBlend(joinedBlend)
      setJoinCode("")
      await fetchBlends()

      notify("Joined Blend!", `Successfully joined blend: ${joinedBlend.blend_code}`)
    } catch (err: any) {
      const errorMsg =
        err.response?.status === 404 ? "Blend code not found" : err.message || "Failed to join blend"
      setError(errorMsg)
      notify("Join Failed", errorMsg)
    } finally {
      setJoining(false)
    }
  }

  /* ───────── activate blend ───────── */
  const activateBlend = async (code: string) => {
    setLoadingBlend(true)
    setError(null)

    try {
      const blend = await getBlend(code)
      setActiveBlend(blend)
    } catch (err: any) {
      const errorMsg = err.message || "Failed to load blend"
      setError(errorMsg)
      notify("Load Failed", errorMsg)
    } finally {
      setLoadingBlend(false)
    }
  }

  /* ───────── copy code ───────── */
  const copyBlendCode = async () => {
    if (!activeBlend) return
    try {
      await navigator.clipboard.writeText(activeBlend.blend_code)
      notify("Copied!", "Blend code copied to clipboard")
    } catch {
      notify("Copy Failed", "Could not copy to clipboard")
    }
  }

  /* ───────── render ───────── */
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please login to access blend functionality.</p>
            <Button onClick={() => (window.location.href = "/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ───── Header ───── */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">🎭 BLEND MODE</h1>
          <p className="text-gray-400 text-xl">Create shared movie recommendations with friends</p>
          <p className="text-gray-500 text-sm mt-2">Welcome back, {currentUser.username}!</p>
        </div>

        {/* ───── Create & Join ───── */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* create */}
          <Card className="bg-black/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5" /> Create New Blend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBlend} className="space-y-4">
                <Input
                  placeholder="Enter blend name (e.g., Movie Night Crew)"
                  value={blendName}
                  onChange={(e) => setBlendName(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                  disabled={creating}
                />
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={creating}>
                  {creating ? "Creating..." : "Create Blend"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* join */}
          <Card className="bg-black/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LogIn className="w-5 h-5" /> Join Existing Blend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinBlend} className="space-y-4">
                <Input
                  placeholder="Enter blend code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                  disabled={joining}
                />
                <Button
                  type="submit"
                   
                  className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                  disabled={joining}
                >
                  {joining ? "Joining..." : "Join Blend"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ───── Errors ───── */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* ───── Your blends ───── */}
        {blends.length > 0 && (
          <Card className="bg-black/50 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Your Blends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {blends.map((blend) => (
                  <Button
                    key={blend.code}
                    variant={activeBlend?.blend_code === blend.code ? "default" : "outline"}
                    onClick={() => activateBlend(blend.code)}
                    disabled={loadingBlend}
                    className="text-sm"
                  >
                    {blend.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ───── Active blend ───── */}
        {activeBlend && (
          <Card className="bg-black/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" /> Active Blend: {activeBlend.blend_code}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button   size="sm" onClick={copyBlendCode} className="text-xs">
                    <Copy className="w-4 h-4 mr-1" /> Copy Code
                  </Button>
                  <Button
                     
                    size="sm"
                    onClick={refreshActiveBlend}
                    disabled={refreshing}
                    className="text-xs"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
              {activeBlend.overall_match_score && (
                <p className="text-gray-400 text-sm">Overall match: {activeBlend.overall_match_score}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* members */}
              <div>
                <h4 className="text-white font-semibold mb-3">Members ({activeBlend.users.length})</h4>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {activeBlend.users.map((username, index) => (
                      <Avatar key={`${username}-${index}`} className="border-2 border-gray-600 w-10 h-10 bg-gray-800">
                        <AvatarFallback className="bg-gray-700 text-white font-bold text-sm">
                          {getInitials(username)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeBlend.users.map((username, index) => (
                      <Badge key={`badge-${username}-${index}`} variant="secondary" className="text-xs">
                        {username}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* user tags */}
              {Object.keys(activeBlend.user_tags).length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">User Preferences</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(activeBlend.user_tags).map(([userId, tag]) => (
                      <div key={userId} className="flex items-center gap-2 p-2 bg-gray-900 rounded">
                        <Avatar className="w-6 h-6 bg-gray-700">
                          <AvatarFallback className="text-xs">{getInitials(userId)}</AvatarFallback>
                        </Avatar>
                        <span className="text-gray-300 text-sm">{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* recommendations */}
              <div>
                <h4 className="text-white font-semibold mb-4">
                  Blended Recommendations
                  {activeBlend.users.length < 2 && (
                    <span className="text-gray-500 text-sm font-normal ml-2">
                      (Waiting for more members to generate recommendations)
                    </span>
                  )}
                </h4>

                {activeBlend.users.length < 2 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Waiting for friends to join...</p>
                    <p className="text-sm">
                      Share your blend code: <strong>{activeBlend.blend_code}</strong>
                    </p>
                  </div>
                ) : activeBlend.recommendations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No recommendations available. Make sure all members have watch history.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeBlend.recommendations.map((rec, index) => (
                      <Card
                        key={`${rec.title}-${index}`}
                        className="bg-gray-900 border-gray-700 hover:border-red-500 transition-colors"
                      >
                        <CardContent className="p-4">
                          <h5 className="text-white font-bold text-lg mb-2 line-clamp-2">{rec.title}</h5>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {rec.genres.slice(0, 3).map((genre, gIndex) => (
                              <Badge key={gIndex}   className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">
                              Match: {Math.round(rec.match_score * 100)}%
                            </span>
                            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
                                style={{ width: `${rec.match_score * 100}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
