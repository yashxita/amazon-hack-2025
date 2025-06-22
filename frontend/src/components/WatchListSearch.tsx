"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

interface Movie {
  title: string
  score: number
  genres: string[]
  poster_path: string
  release_date: string
}

interface WatchlistSearchProps {
  onSearchResults: (movies: Movie[]) => void
  onClearSearch: () => void
  className?: string
}

export function WatchlistSearch({ onSearchResults, onClearSearch, className = "" }: WatchlistSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch()
      } else {
        // Clear search and show recommendations when search is empty
        onClearSearch()
      }
    }, 500) // 500ms delay for debouncing

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const { data } = await axios.get<Movie[]>("/search", {
        baseURL: "http://127.0.0.1:8000",
        params: { title: searchQuery },
      })

      onSearchResults(data)

      if (data.length === 0) {
        toast("No movies found", { icon: "🎬" })
      }
    } catch (error) {
      console.error("Search failed", error)
      toast.error("Search failed")
      onSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    onClearSearch()
  }

  return (
    <div className={`flex gap-2 w-full md:w-auto ${className}`}>
      <div className="relative flex-1 md:w-80">
        <Input
          placeholder="Search movies to add..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-black border border-gray-600 text-white pr-10"
        />
        {searchQuery && (
          <Button
            onClick={clearSearch}
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-700"
          >
            <X className="w-4 h-4 text-gray-400" />
          </Button>
        )}
      </div>
      <Button onClick={handleSearch} disabled={!searchQuery.trim() || isSearching} className="flex-shrink-0">
        <Search className={`w-4 h-4 mr-1 ${isSearching ? "animate-spin" : ""}`} />
        {isSearching ? "Searching..." : "Search"}
      </Button>
    </div>
  )
}
