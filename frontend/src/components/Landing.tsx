"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import Image from "next/image";
import Hero from "./Hero";
import MoodSelector from "./MoodSelector";
import MovieCard from "./MovieCard";
import RecentlyWatchedCard from "./RecentlyWatchedCard";
import RecentlyWatchedSection from "./RecentlyWatchedSection";
import TrendingSection from "./TrendingSection";


const topRated = [
  {
    id: 301,
    title: "The Godfather",
    genre: ["Crime", "Drama"],
    rating: 9.2,
    year: 1972,
    poster: "/placeholder.svg?height=300&width=200",
  },
  {
    id: 302,
    title: "The Shawshank Redemption",
    genre: ["Drama"],
    rating: 9.3,
    year: 1994,
    poster: "/placeholder.svg?height=300&width=200",
  },
  {
    id: 303,
    title: "Schindler's List",
    genre: ["Biography", "Drama"],
    rating: 9.0,
    year: 1993,
    poster: "/placeholder.svg?height=300&width=200",
  },
  {
    id: 304,
    title: "Pulp Fiction",
    genre: ["Crime", "Drama"],
    rating: 8.9,
    year: 1994,
    poster: "/placeholder.svg?height=300&width=200",
  },
  {
    id: 305,
    title: "The Lord of the Rings",
    genre: ["Adventure", "Fantasy"],
    rating: 8.8,
    year: 2001,
    poster: "/placeholder.svg?height=300&width=200",
  },
  {
    id: 306,
    title: "Fight Club",
    genre: ["Drama"],
    rating: 8.8,
    year: 1999,
    poster: "/placeholder.svg?height=300&width=200",
  },
];

const getDayRecommendations = () => {
  const days = [
    {
      day: "Monday",
      title: "MONDAY MOTIVATION",
      description: "Start your week with inspiring stories",
      movies: [
        {
          id: 401,
          title: "The Pursuit of Happyness",
          genre: ["Biography", "Drama"],
          rating: 8.0,
          year: 2006,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 402,
          title: "Rocky",
          genre: ["Drama", "Sport"],
          rating: 8.1,
          year: 1976,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 403,
          title: "The Social Network",
          genre: ["Biography", "Drama"],
          rating: 7.7,
          year: 2010,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 404,
          title: "Steve Jobs",
          genre: ["Biography", "Drama"],
          rating: 7.2,
          year: 2015,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 405,
          title: "The Wolf of Wall Street",
          genre: ["Biography", "Comedy"],
          rating: 8.2,
          year: 2013,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 406,
          title: "Whiplash",
          genre: ["Drama", "Music"],
          rating: 8.5,
          year: 2014,
          poster: "/placeholder.svg?height=300&width=200",
        },
      ],
    },
    {
      day: "Tuesday",
      title: "THRILLER TUESDAY",
      description: "Edge-of-your-seat suspense",
      movies: [
        {
          id: 407,
          title: "Gone Girl",
          genre: ["Mystery", "Thriller"],
          rating: 8.1,
          year: 2014,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 408,
          title: "Se7en",
          genre: ["Crime", "Mystery"],
          rating: 8.6,
          year: 1995,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 409,
          title: "Zodiac",
          genre: ["Crime", "Drama"],
          rating: 7.7,
          year: 2007,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 410,
          title: "Shutter Island",
          genre: ["Mystery", "Thriller"],
          rating: 8.2,
          year: 2010,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 411,
          title: "The Silence of the Lambs",
          genre: ["Crime", "Drama"],
          rating: 8.6,
          year: 1991,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 412,
          title: "Prisoners",
          genre: ["Crime", "Drama"],
          rating: 8.1,
          year: 2013,
          poster: "/placeholder.svg?height=300&width=200",
        },
      ],
    },
    {
      day: "Wednesday",
      title: "WILD WEDNESDAY",
      description: "Action-packed adventures",
      movies: [
        {
          id: 413,
          title: "John Wick",
          genre: ["Action", "Crime"],
          rating: 7.4,
          year: 2014,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 414,
          title: "Mad Max: Fury Road",
          genre: ["Action", "Adventure"],
          rating: 8.1,
          year: 2015,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 415,
          title: "The Raid",
          genre: ["Action", "Crime"],
          rating: 7.6,
          year: 2011,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 416,
          title: "Mission: Impossible",
          genre: ["Action", "Adventure"],
          rating: 7.1,
          year: 2018,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 417,
          title: "The Dark Knight",
          genre: ["Action", "Crime"],
          rating: 9.0,
          year: 2008,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 418,
          title: "Atomic Blonde",
          genre: ["Action", "Mystery"],
          rating: 6.7,
          year: 2017,
          poster: "/placeholder.svg?height=300&width=200",
        },
      ],
    },
    {
      day: "Thursday",
      title: "THROWBACK THURSDAY",
      description: "Classic cinema gems",
      movies: [
        {
          id: 419,
          title: "Casablanca",
          genre: ["Drama", "Romance"],
          rating: 8.5,
          year: 1942,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 420,
          title: "The Godfather",
          genre: ["Crime", "Drama"],
          rating: 9.2,
          year: 1972,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 421,
          title: "Citizen Kane",
          genre: ["Drama", "Mystery"],
          rating: 8.3,
          year: 1941,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 422,
          title: "Vertigo",
          genre: ["Mystery", "Romance"],
          rating: 8.3,
          year: 1958,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 423,
          title: "Singin' in the Rain",
          genre: ["Comedy", "Musical"],
          rating: 8.3,
          year: 1952,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 424,
          title: "Some Like It Hot",
          genre: ["Comedy", "Romance"],
          rating: 8.2,
          year: 1959,
          poster: "/placeholder.svg?height=300&width=200",
        },
      ],
    },
    {
      day: "Friday",
      title: "FRIDAY NIGHT LIGHTS",
      description: "Perfect for date night",
      movies: [
        {
          id: 425,
          title: "La La Land",
          genre: ["Comedy", "Drama"],
          rating: 8.0,
          year: 2016,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 426,
          title: "The Notebook",
          genre: ["Drama", "Romance"],
          rating: 7.8,
          year: 2004,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 427,
          title: "Titanic",
          genre: ["Drama", "Romance"],
          rating: 7.8,
          year: 1997,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 428,
          title: "Before Sunset",
          genre: ["Drama", "Romance"],
          rating: 8.1,
          year: 2004,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 429,
          title: "Her",
          genre: ["Drama", "Romance"],
          rating: 8.0,
          year: 2013,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 430,
          title: "Eternal Sunshine",
          genre: ["Drama", "Romance"],
          rating: 8.3,
          year: 2004,
          poster: "/placeholder.svg?height=300&width=200",
        },
      ],
    },
    {
      day: "Saturday",
      title: "SATURDAY BLOCKBUSTERS",
      description: "Big budget entertainment",
      movies: [
        {
          id: 431,
          title: "Avengers: Endgame",
          genre: ["Action", "Adventure"],
          rating: 8.4,
          year: 2019,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 432,
          title: "Top Gun: Maverick",
          genre: ["Action", "Drama"],
          rating: 8.3,
          year: 2022,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 433,
          title: "Dune",
          genre: ["Adventure", "Drama"],
          rating: 8.0,
          year: 2021,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 434,
          title: "No Time to Die",
          genre: ["Action", "Adventure"],
          rating: 7.3,
          year: 2021,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 435,
          title: "Spider-Man: No Way Home",
          genre: ["Action", "Adventure"],
          rating: 8.4,
          year: 2021,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 436,
          title: "The Batman",
          genre: ["Action", "Crime"],
          rating: 7.8,
          year: 2022,
          poster: "/placeholder.svg?height=300&width=200",
        },
      ],
    },
    {
      day: "Sunday",
      title: "SUNDAY STORIES",
      description: "Thoughtful dramas to end the week",
      movies: [
        {
          id: 437,
          title: "Nomadland",
          genre: ["Drama"],
          rating: 7.3,
          year: 2020,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 438,
          title: "Moonlight",
          genre: ["Drama"],
          rating: 7.4,
          year: 2016,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 439,
          title: "Manchester by the Sea",
          genre: ["Drama"],
          rating: 7.8,
          year: 2016,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 440,
          title: "The Tree of Life",
          genre: ["Drama", "Fantasy"],
          rating: 6.8,
          year: 2011,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 441,
          title: "Call Me by Your Name",
          genre: ["Drama", "Romance"],
          rating: 7.9,
          year: 2017,
          poster: "/placeholder.svg?height=300&width=200",
        },
        {
          id: 442,
          title: "Lady Bird",
          genre: ["Comedy", "Drama"],
          rating: 7.4,
          year: 2017,
          poster: "/placeholder.svg?height=300&width=200",
        },
      ],
    },
  ];

  const today = new Date().getDay();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDay = dayNames[today];

  return days.find((d) => d.day === currentDay) || days[0];
};

export default function Landing() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  const sectionsRef = useRef<HTMLDivElement>(null);

  const dayRecommendation = getDayRecommendations();


  const DayRecommendationSection = () => (
    <div className="mb-16 px-6 lg:px-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Calendar className="w-8 h-8 text-red-400" />
          <div>
            <h2 className="text-white text-3xl font-black tracking-wide">
              {dayRecommendation.title}
            </h2>
            <p className="text-gray-400 text-lg">
              {dayRecommendation.description}
            </p>
          </div>
        </div>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-6 pb-4">
          {dayRecommendation.movies.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );



  const TopRatedSection = () => (
    <div className="mb-16 px-6 lg:px-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Award className="w-8 h-8 text-yellow-400" />
          <h2 className="text-white text-3xl font-black tracking-wide">
            TOP RATED
          </h2>
        </div>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-6 pb-4">
          {topRated.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <h1 className="text-3xl font-black text-white tracking-tight">
                CINE<span className="text-red-500">AI</span>
              </h1>
              <div className="hidden md:flex gap-8">
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("home")}
                  className={`text-white hover:text-red-400 font-semibold tracking-wide ${
                    activeTab === "home" ? "text-red-400" : ""
                  }`}
                >
                  MOVIES
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("watchlists")}
                  className={`text-white hover:text-red-400 font-semibold tracking-wide ${
                    activeTab === "watchlists" ? "text-red-400" : ""
                  }`}
                >
                  WATCHLISTS
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("blend")}
                  className={`text-white hover:text-red-400 font-semibold tracking-wide ${
                    activeTab === "blend" ? "text-red-400" : ""
                  }`}
                >
                  BLEND
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 ">
              <div className="relative">
                <Input
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black border-2 border-gray-700 focus:border-red-500 text-white placeholder-gray-500 w-64 pr-12"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                className="border-blue-400 text-blue-400 hover:bg-blue-400/10 font-semibold"
              >
                LOGIN
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {activeTab === "home" && (
          <div>
            <Hero />
            <div className="py-16">
              <RecentlyWatchedSection />
              <DayRecommendationSection />
              <TrendingSection />
              <MoodSelector />
              <TopRatedSection />
            </div>
          </div>
        )}

        {activeTab === "watchlists" && (
          <div className="pt-16 px-6 lg:px-12">
            <div className="flex items-center justify-between mb-12">
              <h1 className="text-5xl font-black text-white tracking-tight">
                MY WATCHLISTS
              </h1>
              <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                CREATE WATCHLIST
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-black border-2 border-gray-800 hover:border-red-500 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-8">
                  <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                    <Play className="w-16 h-16 text-gray-600 group-hover:text-red-400 transition-colors" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3">
                    Weekend Binge
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Perfect for lazy weekends
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-semibold">
                      12 movies
                    </span>
                    <Badge
                      variant="outline"
                      className="border-blue-400 text-blue-400 bg-blue-400/10"
                    >
                      Chill
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border-2 border-gray-800 hover:border-red-500 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-8">
                  <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                    <Zap className="w-16 h-16 text-gray-600 group-hover:text-red-400 transition-colors" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3">
                    Action Pack
                  </h3>
                  <p className="text-gray-400 mb-4">High-octane thrills</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-semibold">
                      8 movies
                    </span>
                    <Badge
                      variant="outline"
                      className="border-red-400 text-red-400 bg-red-400/10"
                    >
                      Adventure
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border-2 border-gray-800 border-dashed hover:border-red-500 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[280px]">
                  <Plus className="w-16 h-16 text-gray-600 group-hover:text-red-400 transition-colors mb-6" />
                  <h3 className="text-gray-400 font-bold text-xl mb-3 group-hover:text-white transition-colors">
                    Create New Watchlist
                  </h3>
                  <p className="text-gray-500">
                    No watchlists yet! Create your first one 🎬
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "blend" && (
          <div className="pt-16 px-6 lg:px-12">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
                🎭 BLEND MODE
              </h1>
              <p className="text-gray-400 text-xl">
                Create shared movie recommendations with friends
              </p>
            </div>

            <div className="max-w-lg mx-auto space-y-6 mb-16">
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white py-4 text-lg font-semibold">
                CREATE BLEND SESSION
              </Button>
              <div className="text-center text-gray-500 font-semibold">OR</div>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter blend code"
                  className="flex-1 bg-black border-2 border-gray-700 focus:border-blue-400 text-white placeholder-gray-500 py-3"
                />
                <Button
                  variant="outline"
                  className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400/10 px-6 font-semibold"
                >
                  JOIN
                </Button>
              </div>
            </div>

            <Card className="bg-black border-2 border-gray-800 max-w-4xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-white font-bold text-2xl mb-6">
                  Active Blend: Movie Night Crew
                </h3>
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex -space-x-3">
                    <Avatar className="border-3 border-red-400 w-12 h-12">
                      <AvatarFallback className="bg-red-500 text-white font-bold">
                        You
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="border-3 border-blue-400 w-12 h-12">
                      <AvatarFallback className="bg-blue-500 text-white font-bold">
                        JS
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="border-3 border-green-400 w-12 h-12">
                      <AvatarFallback className="bg-green-500 text-white font-bold">
                        MK
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-gray-400 font-semibold">3 members</span>
                </div>
                <div className="space-y-6">
                  <h4 className="text-white font-bold text-xl">
                    Blended Picks for You:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-red-500 transition-colors">
                      <Image
                        src="/placeholder.svg?height=80&width=60"
                        alt="Movie"
                        width={60}
                        height={80}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <p className="text-white font-bold text-lg">
                          Inception
                        </p>
                        <p className="text-gray-400 text-sm mb-2">
                          Sci-Fi • 2010
                        </p>
                        <div className="flex -space-x-2">
                          <Avatar className="w-6 h-6 border-2 border-red-400">
                            <AvatarFallback className="bg-red-500 text-white text-xs">
                              Y
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="w-6 h-6 border-2 border-blue-400">
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              J
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-red-500 transition-colors">
                      <Image
                        src="/placeholder.svg?height=80&width=60"
                        alt="Movie"
                        width={60}
                        height={80}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <p className="text-white font-bold text-lg">Dune</p>
                        <p className="text-gray-400 text-sm mb-2">
                          Sci-Fi • 2021
                        </p>
                        <div className="flex -space-x-2">
                          <Avatar className="w-6 h-6 border-2 border-red-400">
                            <AvatarFallback className="bg-red-500 text-white text-xs">
                              Y
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="w-6 h-6 border-2 border-green-400">
                            <AvatarFallback className="bg-green-500 text-white text-xs">
                              M
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 p-4">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTab("home")}
            className={`text-white hover:text-red-400 ${
              activeTab === "home" ? "text-red-400" : ""
            }`}
          >
            <Home className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTab("watchlists")}
            className={`text-white hover:text-red-400 ${
              activeTab === "watchlists" ? "text-red-400" : ""
            }`}
          >
            <Bookmark className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTab("blend")}
            className={`text-white hover:text-red-400 ${
              activeTab === "blend" ? "text-red-400" : ""
            }`}
          >
            <Users className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-blue-400"
          >
            <Search className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-blue-400"
          >
            <User className="w-6 h-6" />
          </Button>
        </div>
      </nav>
    </div>
  );
}
