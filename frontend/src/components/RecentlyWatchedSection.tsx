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
import RecentlyWatchedCard from "./RecentlyWatchedCard"
const recentlyWatched = [
  {
    id: 101,
    title: "Inception",
    genre: ["Sci-Fi", "Thriller"],
    rating: 8.8,
    year: 2010,
    poster: "/placeholder.svg?height=300&width=200",
    progress: 75,
    watchedAt: "2 hours ago",
  },
  {
    id: 102,
    title: "The Dark Knight",
    genre: ["Action", "Crime"],
    rating: 9.0,
    year: 2008,
    poster: "/placeholder.svg?height=300&width=200",
    progress: 100,
    watchedAt: "Yesterday",
  },
  {
    id: 103,
    title: "Interstellar",
    genre: ["Sci-Fi", "Drama"],
    rating: 8.6,
    year: 2014,
    poster: "/placeholder.svg?height=300&width=200",
    progress: 45,
    watchedAt: "3 days ago",
  },
  {
    id: 104,
    title: "Parasite",
    genre: ["Thriller", "Drama"],
    rating: 8.5,
    year: 2019,
    poster: "/placeholder.svg?height=300&width=200",
    progress: 100,
    watchedAt: "1 week ago",
  },
  {
    id: 105,
    title: "Mad Max: Fury Road",
    genre: ["Action", "Adventure"],
    rating: 8.1,
    year: 2015,
    poster: "/placeholder.svg?height=300&width=200",
    progress: 30,
    watchedAt: "1 week ago",
  },
  {
    id: 106,
    title: "Blade Runner 2049",
    genre: ["Sci-Fi", "Drama"],
    rating: 8.0,
    year: 2017,
    poster: "/placeholder.svg?height=300&width=200",
    progress: 100,
    watchedAt: "2 weeks ago",
  },
];
export default function RecentlyWatchedSection(){
    return(
        <div className="mb-16 px-6 lg:px-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-blue-400" />
              <h2 className="text-white text-3xl font-black tracking-wide">
                RECENTLY WATCHED
              </h2>
            </div>
            <Button
              variant="ghost"
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              VIEW ALL
            </Button>
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-6 pb-4">
              {recentlyWatched.map((movie: any) => (
                <RecentlyWatchedCard key={movie.id} movie={movie} />
              ))}
            </div>
          </ScrollArea>
        </div>
      );
}