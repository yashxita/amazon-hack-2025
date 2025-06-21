"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Watchlist {
  id: string
  name: string
  cover_image?: string
  movie_count?: number
}

export default function Watchlist() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchWatchlists()
  }, [])

  const fetchWatchlists = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("http://localhost:8000/watchlists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setWatchlists(data)
      }
    } catch (error) {
      console.error("Error fetching watchlists:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteWatchlist = async (watchlistId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8000/watchlists/${watchlistId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setWatchlists(watchlists.filter((w) => w.id !== watchlistId))
      }
    } catch (error) {
      console.error("Error deleting watchlist:", error)
    }
  }

  const handleCreateWatchlist = () => {
    router.push("/create-watchlist")
  }

  const handleViewWatchlist = (watchlistId: string) => {
    router.push(`/watchlist/${watchlistId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading watchlists...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-16 px-6 lg:px-12">
        <div className="flex items-center mb-8">
          <Button onClick={() => router.push("/")}   className="text-white hover:bg-gray-800 mr-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="flex items-center justify-between mb-12">
          <h1 className="text-5xl font-black text-white tracking-tight">MY WATCHLISTS</h1>
          <Button
            onClick={handleCreateWatchlist}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            CREATE WATCHLIST
          </Button>
        </div>
      </div>

      <div className="pt-16 px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {watchlists.map((watchlist) => (
            <Card
              key={watchlist.id}
              className="bg-black border-2 border-gray-800 hover:border-red-500 transition-all duration-300 cursor-pointer group"
            >
              <CardContent className="p-8">
                <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center group-hover:bg-gray-800 transition-colors overflow-hidden relative">
                  {watchlist.cover_image && (
  <div className="mb-6 rounded-lg overflow-hidden">
    <img
      src={`data:image/jpeg;base64,${watchlist.cover_image}`}
      alt="Watchlist Cover"
      className="w-full max-h-72 object-cover border border-gray-700"
    />
  </div>
)}
                  
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{watchlist.name}</h3>
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => handleViewWatchlist(watchlist.id)}
                    
                    className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
                  >
                    View Movies
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteWatchlist(watchlist.id)
                    }}
                    
                    size="sm"
                    className="bg-red-900 text-red-400 border-red-600 hover:bg-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-black border-2 border-gray-800 border-dashed hover:border-red-500 transition-all duration-300 cursor-pointer group">
            <CardContent
              onClick={handleCreateWatchlist}
              className="p-8 flex flex-col items-center justify-center text-center min-h-[280px]"
            >
              <Plus className="w-16 h-16 text-gray-600 group-hover:text-red-400 transition-colors mb-6" />
              <h3 className="text-gray-400 font-bold text-xl mb-3 group-hover:text-white transition-colors">
                Create New Watchlist
              </h3>
              <p className="text-gray-500">No watchlists yet! Create your first one 🎬</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
