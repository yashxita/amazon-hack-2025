"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Copy, RefreshCw, Plus, LogIn, ExternalLink, Trash2 } from "lucide-react"

import {
  createBlend,
  joinBlend,
  listBlends,
  getBlend,
  getCurrentUser,
  deleteBlend,
  addHardcodedHistory,
  type BlendResponse,
  type BlendSummary,
  type User,
} from "../../../services/api"
import axios from "axios"

/* ───────── helpers ───────── */

const getInitials = (name: string) =>
  name
    .split(/[ @._-]/)
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2)

/** Simple replacement for all former toast calls */
const notify = (title: string, description?: string) =>
  alert(description ? `${title}\n\n${description}` : title)

/* ───────── local-storage helpers ───────── */

const LOCAL_BLENDS_KEY = "user_blends"

/** read cached blends or `[]` */
const getLocalBlends = (): BlendSummary[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_BLENDS_KEY) ?? "[]")
  } catch {
    return []
  }
}

/** write/overwrite one blend in the cache */
const cacheBlend = (blend: BlendSummary) => {
  try {
    const existing = getLocalBlends().filter((b) => b.code !== blend.code)
    localStorage.setItem(LOCAL_BLENDS_KEY, JSON.stringify([blend, ...existing]))
  } catch {
    /* ignore — localStorage may be unavailable (e.g. private mode) */
  }
}

/* ───────── component ───────── */

export default function BlendPage() {
  const router = useRouter()

  // State management
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  // seed with anything that was cached offline
  const [blends, setBlends] = useState<BlendSummary[]>(getLocalBlends())
  const [blendDetails, setBlendDetails] = useState<Record<string, BlendResponse>>({})

  // Loading states
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [loadingBlends, setLoadingBlends] = useState<Record<string, boolean>>({})

  // Form inputs
  const [blendName, setBlendName] = useState("")
  const [joinCode, setJoinCode] = useState("")

  // Error handling
  const [error, setError] = useState<string | null>(null)

  // Initialize component
   useEffect(() => {
    /* 1️⃣  Guarantee the header is there before we call anything */
    const token = localStorage.getItem("token")
    if (token && !axios.defaults.headers.common["Authorization"]) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }

    /* 2️⃣  Now we can safely hit protected endpoints        */
    const init = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        await fetchBlends()
      } catch (err: any) {
        setError("Failed to load user info. Please login.")
        notify(
          "Authentication Error",
          "Please login to access blend functionality.",
        )
      }
    }

    init()
  }, [])

  // Auto-refresh blends every 15 seconds
  useEffect(() => {
    if (!currentUser) return
    const interval = setInterval(() => fetchBlends(), 15000)
    return () => clearInterval(interval)
  }, [currentUser])

  const fetchBlends = async () => {
    // always start with whatever is cached
    const local = getLocalBlends()
    try {
      const remote = await listBlends()
      // merge cached + remote, de-duping by code
      const merged = [...remote]
      local.forEach((b) => {
        if (!merged.some((r) => r.code === b.code)) merged.push(b)
      })
      setBlends(merged)

      // Fetch details for each blend
      for (const blend of merged) {
        fetchBlendDetails(blend.code)
      }
    } catch (err: any) {
      console.error("Failed to fetch blends:", err)
      // if offline keep showing cached list
      setBlends(local)
    }
  }

  const fetchBlendDetails = async (code: string) => {
    if (loadingBlends[code]) return
    setLoadingBlends((prev) => ({ ...prev, [code]: true }))
    try {
      const details = await getBlend(code)
      setBlendDetails((prev) => ({ ...prev, [code]: details }))
    } catch (err: any) {
      console.error(`Failed to fetch details for blend ${code}:`, err)
    } finally {
      setLoadingBlends((prev) => ({ ...prev, [code]: false }))
    }
  }

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
      cacheBlend({ code: newBlend.blend_code, name: blendName.trim() })
      setBlendName("")
      await fetchBlends()

      notify("Blend Created!", `Your blend "${blendName}" has been created.`)

      router.push(`/blend/${newBlend.blend_code}`)
    } catch (err: any) {
      const errorMsg = err.message || "Failed to create blend"
      setError(errorMsg)
      notify("Creation Failed", errorMsg)
    } finally {
      setCreating(false)
    }
  }

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
      cacheBlend({ code: joinedBlend.blend_code, name: joinedBlend.name })
      setJoinCode("")
      await fetchBlends()

      notify("Joined Blend!", `Successfully joined blend: ${joinedBlend.blend_code}`)

      router.push(`/blend/${joinedBlend.blend_code}`)
    } catch (err: any) {
      const errorMsg =
        err.response?.status === 404 ? "Blend code not found" : err.message || "Failed to join blend"
      setError(errorMsg)
      notify("Join Failed", errorMsg)
    } finally {
      setJoining(false)
    }
  }

  const copyBlendCode = async (code: string) => {
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
      notify(
        "History Added!",
        "Your movie history has been added. Blend recommendations will update shortly."
      )
      setTimeout(() => fetchBlends(), 2000)
    } catch {
      notify("Error", "Failed to add movie history")
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
            <Button onClick={() => router.push("/login")} className="w-full">
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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">🎭 BLEND MODE</h1>
          <p className="text-gray-400 text-xl">Create shared movie recommendations with friends</p>
          <p className="text-gray-500 text-sm mt-2">Welcome back, {currentUser.username}!</p>
        </div>

        {/* Add History Banner */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">Improve Your Recommendations</h3>
                  <p className="text-gray-300">Add your movie history to get better blend results</p>
                </div>
                <Button onClick={handleAddHistory} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create and Join Forms */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Create Blend */}
          <Card className="bg-black/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Blend
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

          {/* Join Blend */}
          <Card className="bg-black/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Join Existing Blend
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
                  variant="outline"
                  className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                  disabled={joining}
                >
                  {joining ? "Joining..." : "Join Blend"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Your Blends */}
        {blends.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Your Blends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blends.map((blend) => {
                const details = blendDetails[blend.code]
                const isLoading = loadingBlends[blend.code]

                return (
                  <Card
                    key={blend.code}
                    className="bg-black/50 border-gray-800 hover:border-red-500 transition-all duration-300 cursor-pointer hover:shadow-lg"
                    onClick={() => router.push(`/blend/${blend.code}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg mb-1 truncate">{blend.name}</h3>
                          <p className="text-gray-400 text-sm font-mono">{blend.code}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyBlendCode(blend.code)
                            }}
                            className="text-gray-400 hover:text-white p-1"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/blend/${blend.code}`)
                            }}
                            className="text-gray-400 hover:text-white p-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      ) : details ? (
                        <div className="space-y-4">
                          {/* Members */}
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {details.users.slice(0, 4).map((username, index) => (
                                <Avatar
                                  key={`${username}-${index}`}
                                  className="border-2 border-gray-600 w-8 h-8 bg-gray-700"
                                >
                                  <AvatarFallback className="bg-gray-700 text-white font-bold text-xs">
                                    {getInitials(username)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {details.users.length > 4 && (
                                <div className="w-8 h-8 bg-gray-600 border-2 border-gray-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">+{details.users.length - 4}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-gray-400 text-sm">
                              {details.users.length} member{details.users.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Status */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {details.users.length >= 2 ? (
                                <>
                                  <Badge className="bg-green-600 text-white">
                                    {details.recommendations.length} recommendations
                                  </Badge>
                                  {details.overall_match_score && (
                                    <Badge variant="outline" className="text-gray-300">
                                      {details.overall_match_score} match
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                  Waiting for members
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">Click to view details</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {blends.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl text-white mb-2">No blends yet</h3>
            <p className="text-gray-400 mb-6">Create your first blend or join one with a code</p>
          </div>
        )}
      </div>
    </div>
  )
}
