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

const moods = [
  { id: "adventurous", label: "ADVENTUROUS", icon: Zap, color: "border-red-500 text-red-400" },
  { id: "chill", label: "CHILL", icon: Coffee, color: "border-blue-400 text-blue-400" },
  { id: "heartbreak", label: "HEARTBREAK", icon: Heart, color: "border-red-400 text-red-400" },
  { id: "comedy", label: "COMEDY", icon: Smile, color: "border-blue-500 text-blue-400" },
  { id: "mystery", label: "MYSTERY", icon: Moon, color: "border-purple-400 text-purple-400" },
]

const featuredMovies = [
  {
    id: 1,
    title: "DUNE: PART TWO",
    subtitle: "Epic Sci-Fi Adventure • 2024",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.",
    rating: 8.9,
    year: 2024,
    genre: ["Sci-Fi", "Adventure", "Drama"],
    backdrop: "/placeholder.svg?height=800&width=1400",
    poster: "/placeholder.svg?height=600&width=400",
  },
  {
    id: 2,
    title: "OPPENHEIMER",
    subtitle: "Historical Drama • 2023",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II. A gripping tale of science, politics, and moral responsibility.",
    rating: 8.3,
    year: 2023,
    genre: ["Drama", "History", "Biography"],
    backdrop: "/placeholder.svg?height=800&width=1400",
    poster: "/placeholder.svg?height=600&width=400",
  },
  {
    id: 3,
    title: "SPIDER-MAN: ACROSS THE SPIDER-VERSE",
    subtitle: "Animated Adventure • 2023",
    description:
      "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. A visually stunning animated masterpiece.",
    rating: 8.7,
    year: 2023,
    genre: ["Animation", "Action", "Adventure"],
    backdrop: "/placeholder.svg?height=800&width=1400",
    poster: "/placeholder.svg?height=600&width=400",
  },
  {
    id: 4,
    title: "THE BATMAN",
    subtitle: "Dark Crime Thriller • 2022",
    description:
      "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
    rating: 7.8,
    year: 2022,
    genre: ["Action", "Crime", "Drama"],
    backdrop: "/placeholder.svg?height=800&width=1400",
    poster: "/placeholder.svg?height=600&width=400",
  },
]

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
]

const trendingNow = [
  {
    id: 201,
    title: "Wednesday",
    genre: ["Horror", "Comedy"],
    rating: 8.1,
    year: 2022,
    poster: "/placeholder.svg?height=300&width=200",
    trending: "+15%",
  },
  {
    id: 202,
    title: "House of the Dragon",
    genre: ["Fantasy", "Drama"],
    rating: 8.4,
    year: 2022,
    poster: "/placeholder.svg?height=300&width=200",
    trending: "+23%",
  },
  {
    id: 203,
    title: "Stranger Things 4",
    genre: ["Horror", "Sci-Fi"],
    rating: 8.7,
    year: 2022,
    poster: "/placeholder.svg?height=300&width=200",
    trending: "+8%",
  },
  {
    id: 204,
    title: "The Bear",
    genre: ["Comedy", "Drama"],
    rating: 8.6,
    year: 2022,
    poster: "/placeholder.svg?height=300&width=200",
    trending: "+12%",
  },
  {
    id: 205,
    title: "Euphoria",
    genre: ["Drama"],
    rating: 8.4,
    year: 2019,
    poster: "/placeholder.svg?height=300&width=200",
    trending: "+19%",
  },
  {
    id: 206,
    title: "The Last of Us",
    genre: ["Drama", "Horror"],
    rating: 8.8,
    year: 2023,
    poster: "/placeholder.svg?height=300&width=200",
    trending: "+31%",
  },
]

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
]

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
  ]

  const today = new Date().getDay()
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const currentDay = dayNames[today]

  return days.find((d) => d.day === currentDay) || days[0]
}

const movieSections = {
  adventurous: {
    title: "FEELING ADVENTUROUS?",
    movies: [
      {
        id: 1,
        title: "Dune: Part Two",
        genre: ["Sci-Fi", "Adventure"],
        rating: 8.9,
        match: 95,
        year: 2024,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 2,
        title: "Mad Max: Fury Road",
        genre: ["Action", "Adventure"],
        rating: 8.1,
        match: 92,
        year: 2015,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 3,
        title: "Inception",
        genre: ["Sci-Fi", "Thriller"],
        rating: 8.8,
        match: 88,
        year: 2010,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 4,
        title: "The Matrix",
        genre: ["Sci-Fi", "Action"],
        rating: 8.7,
        match: 90,
        year: 1999,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 5,
        title: "Interstellar",
        genre: ["Sci-Fi", "Drama"],
        rating: 8.6,
        match: 87,
        year: 2014,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 6,
        title: "Blade Runner 2049",
        genre: ["Sci-Fi", "Drama"],
        rating: 8.0,
        match: 89,
        year: 2017,
        poster: "/placeholder.svg?height=400&width=280",
      },
    ],
  },
  chill: {
    title: "FOR A CHILL EVENING",
    movies: [
      {
        id: 7,
        title: "Lost in Translation",
        genre: ["Drama", "Romance"],
        rating: 7.7,
        match: 89,
        year: 2003,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 8,
        title: "Her",
        genre: ["Romance", "Sci-Fi"],
        rating: 8.0,
        match: 91,
        year: 2013,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 9,
        title: "The Grand Budapest Hotel",
        genre: ["Comedy", "Drama"],
        rating: 8.1,
        match: 85,
        year: 2014,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 10,
        title: "Midnight in Paris",
        genre: ["Comedy", "Romance"],
        rating: 7.7,
        match: 83,
        year: 2011,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 11,
        title: "Before Sunset",
        genre: ["Romance", "Drama"],
        rating: 8.1,
        match: 88,
        year: 2004,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 12,
        title: "Call Me By Your Name",
        genre: ["Romance", "Drama"],
        rating: 7.9,
        match: 86,
        year: 2017,
        poster: "/placeholder.svg?height=400&width=280",
      },
    ],
  },
  heartbreak: {
    title: "MOOD: HEARTBREAK & HEALING",
    movies: [
      {
        id: 13,
        title: "Eternal Sunshine",
        genre: ["Romance", "Drama"],
        rating: 8.3,
        match: 94,
        year: 2004,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 14,
        title: "500 Days of Summer",
        genre: ["Romance", "Comedy"],
        rating: 7.7,
        match: 89,
        year: 2009,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 15,
        title: "Blue Valentine",
        genre: ["Romance", "Drama"],
        rating: 7.3,
        match: 86,
        year: 2010,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 16,
        title: "Marriage Story",
        genre: ["Drama", "Romance"],
        rating: 7.9,
        match: 91,
        year: 2019,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 17,
        title: "La La Land",
        genre: ["Romance", "Musical"],
        rating: 8.0,
        match: 87,
        year: 2016,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 18,
        title: "Her",
        genre: ["Romance", "Sci-Fi"],
        rating: 8.0,
        match: 88,
        year: 2013,
        poster: "/placeholder.svg?height=400&width=280",
      },
    ],
  },
  comedy: {
    title: "LAUGH TILL YOU DROP",
    movies: [
      {
        id: 19,
        title: "The Grand Budapest Hotel",
        genre: ["Comedy", "Adventure"],
        rating: 8.1,
        match: 93,
        year: 2014,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 20,
        title: "Superbad",
        genre: ["Comedy"],
        rating: 7.6,
        match: 89,
        year: 2007,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 21,
        title: "Knives Out",
        genre: ["Comedy", "Mystery"],
        rating: 7.9,
        match: 91,
        year: 2019,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 22,
        title: "The Nice Guys",
        genre: ["Comedy", "Action"],
        rating: 7.4,
        match: 85,
        year: 2016,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 23,
        title: "Game Night",
        genre: ["Comedy", "Thriller"],
        rating: 6.9,
        match: 82,
        year: 2018,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 24,
        title: "Parasite",
        genre: ["Comedy", "Thriller"],
        rating: 8.5,
        match: 90,
        year: 2019,
        poster: "/placeholder.svg?height=400&width=280",
      },
    ],
  },
  mystery: {
    title: "MYSTERIOUS DEPTHS",
    movies: [
      {
        id: 25,
        title: "Shutter Island",
        genre: ["Mystery", "Thriller"],
        rating: 8.2,
        match: 92,
        year: 2010,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 26,
        title: "Gone Girl",
        genre: ["Mystery", "Thriller"],
        rating: 8.1,
        match: 89,
        year: 2014,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 27,
        title: "Zodiac",
        genre: ["Mystery", "Crime"],
        rating: 7.7,
        match: 87,
        year: 2007,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 28,
        title: "The Prestige",
        genre: ["Mystery", "Drama"],
        rating: 8.5,
        match: 94,
        year: 2006,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 29,
        title: "Prisoners",
        genre: ["Mystery", "Thriller"],
        rating: 8.1,
        match: 88,
        year: 2013,
        poster: "/placeholder.svg?height=400&width=280",
      },
      {
        id: 30,
        title: "Memento",
        genre: ["Mystery", "Thriller"],
        rating: 8.4,
        match: 91,
        year: 2000,
        poster: "/placeholder.svg?height=400&width=280",
      },
    ],
  },
}

export default function Landing() {
  const [selectedMoods, setSelectedMoods] = useState(["adventurous"])
  const [activeTab, setActiveTab] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const sectionsRef = useRef<HTMLDivElement>(null)

  // Auto-swipe hero section
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % featuredMovies.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const toggleMood = (moodId: string) => {
    setSelectedMoods((prev) => {
      const newMoods = prev.includes(moodId) ? prev.filter((id) => id !== moodId) : [...prev, moodId]

      // Auto-scroll to mood recommendations after state update
      setTimeout(() => {
        if (sectionsRef.current) {
          sectionsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      }, 100)

      return newMoods
    })
  }

  const currentFeatured = featuredMovies[currentHeroIndex]
  const dayRecommendation = getDayRecommendations()

  const MovieCard = ({ movie }: { movie: any }) => (
    <Card className="group relative w-56 flex-shrink-0 bg-black border border-gray-800 hover:border-red-500 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <Image
            src={movie.poster || "/placeholder.svg"}
            alt={movie.title}
            width={280}
            height={400}
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <Button
              size="icon"
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16 shadow-lg shadow-red-500/50"
            >
              <Play className="w-8 h-8 fill-white ml-1" />
            </Button>
          </div>
          {movie.match && (
            <div className="absolute top-3 right-3 bg-black/90 px-3 py-1 rounded-full border border-blue-400">
              <span className="text-blue-400 text-sm font-bold">{movie.match}%</span>
            </div>
          )}
          {movie.trending && (
            <div className="absolute top-3 right-3 bg-black/90 px-3 py-1 rounded-full border border-green-400">
              <span className="text-green-400 text-sm font-bold">{movie.trending}</span>
            </div>
          )}
          <div className="absolute top-3 left-3 bg-black/90 px-2 py-1 rounded">
            <span className="text-white text-xs font-bold">{movie.year}</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{movie.title}</h3>
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genre.slice(0, 2).map((g: string) => (
              <Badge key={g} variant="outline" className="text-xs border-gray-600 text-gray-300 bg-black/50">
                {g}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-sm font-semibold">{movie.rating}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const RecentlyWatchedCard = ({ movie }: { movie: any }) => (
    <Card className="group relative w-56 flex-shrink-0 bg-black border border-gray-800 hover:border-blue-400 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <Image
            src={movie.poster || "/placeholder.svg"}
            alt={movie.title}
            width={280}
            height={400}
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <Button
              size="icon"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-16 h-16 shadow-lg shadow-blue-500/50"
            >
              <Play className="w-8 h-8 fill-white ml-1" />
            </Button>
          </div>
          <div className="absolute top-3 right-3 bg-black/90 px-3 py-1 rounded-full border border-blue-400">
            <span className="text-blue-400 text-sm font-bold">{movie.progress}%</span>
          </div>
          <div className="absolute top-3 left-3 bg-black/90 px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400 text-xs">{movie.watchedAt}</span>
          </div>
          {movie.progress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${movie.progress}%` }} />
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{movie.title}</h3>
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genre.slice(0, 2).map((g: string) => (
              <Badge key={g} variant="outline" className="text-xs border-gray-600 text-gray-300 bg-black/50">
                {g}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-sm font-semibold">{movie.rating}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const HeroSection = () => (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={currentFeatured.backdrop || "/placeholder.svg"}
          alt={currentFeatured.title}
          fill
          className="object-cover transition-all duration-1000"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Hero Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentHeroIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentHeroIndex ? "bg-red-500" : "bg-gray-600 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500 px-4 py-2 rounded-full mb-4">
                <Play className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-semibold text-sm">NOW STREAMING</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-white mb-4 tracking-tight">
                {currentFeatured.title}
              </h1>
              <p className="text-blue-400 text-xl font-semibold mb-4">{currentFeatured.subtitle}</p>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">{currentFeatured.description}</p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-bold text-lg">{currentFeatured.rating}</span>
              </div>
              <div className="flex gap-2">
                {currentFeatured.genre.map((g) => (
                  <Badge key={g} variant="outline" className="border-gray-600 text-gray-300 bg-black/50">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg font-semibold shadow-lg shadow-red-500/30">
                <Play className="w-5 h-5 mr-2 fill-white" />
                WATCH NOW
              </Button>
              <Button
                variant="outline"
                className="border-blue-400 text-blue-400 hover:bg-blue-400/10 px-8 py-3 text-lg font-semibold"
              >
                <Info className="w-5 h-5 mr-2" />
                MORE INFO
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-400">
                <ThumbsUp className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-400">
                <Plus className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-400">
                <Share2 className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Volume2 className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const MoodSelector = () => (
    <div className="mb-12 px-6 lg:px-12">
      <h2 className="text-white text-3xl font-black mb-8 tracking-wide">SELECT YOUR MOOD</h2>
      <div className="flex flex-wrap gap-4">
        {moods.map((mood) => {
          const Icon = mood.icon
          const isSelected = selectedMoods.includes(mood.id)
          return (
            <Button
              key={mood.id}
              variant="outline"
              onClick={() => toggleMood(mood.id)}
              className={`border-2 transition-all duration-300 px-6 py-3 text-sm font-bold tracking-wide ${
                isSelected
                  ? `${mood.color} bg-red-500/20 hover:bg-red-500/30 shadow-lg shadow-red-500/20`
                  : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {mood.label}
            </Button>
          )
        })}
      </div>
    </div>
  )

  const MovieSection = ({ section, icon: Icon }: { section: any; icon?: any }) => (
    <div className="mb-16 px-6 lg:px-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {Icon && <Icon className="w-8 h-8 text-red-400" />}
          <h2 className="text-white text-3xl font-black tracking-wide">{section.title}</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-6 pb-4">
          {section.movies.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  const RecentlyWatchedSection = () => (
    <div className="mb-16 px-6 lg:px-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Clock className="w-8 h-8 text-blue-400" />
          <h2 className="text-white text-3xl font-black tracking-wide">RECENTLY WATCHED</h2>
        </div>
        <Button variant="ghost" className="text-blue-400 hover:text-blue-300 font-semibold">
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
  )

  const DayRecommendationSection = () => (
    <div className="mb-16 px-6 lg:px-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Calendar className="w-8 h-8 text-red-400" />
          <div>
            <h2 className="text-white text-3xl font-black tracking-wide">{dayRecommendation.title}</h2>
            <p className="text-gray-400 text-lg">{dayRecommendation.description}</p>
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
  )

  const TrendingSection = () => (
    <div className="mb-16 px-6 lg:px-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <TrendingUp className="w-8 h-8 text-green-400" />
          <h2 className="text-white text-3xl font-black tracking-wide">TRENDING NOW</h2>
        </div>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-6 pb-4">
          {trendingNow.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  const TopRatedSection = () => (
    <div className="mb-16 px-6 lg:px-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Award className="w-8 h-8 text-yellow-400" />
          <h2 className="text-white text-3xl font-black tracking-wide">TOP RATED</h2>
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
  )

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

            <div className="flex items-center gap-4">
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
              <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10 font-semibold">
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
            <HeroSection />
            <div className="py-16">
              <RecentlyWatchedSection />
              <DayRecommendationSection />
              <TrendingSection />
              <MoodSelector />
              <div ref={sectionsRef} className="space-y-8">
                {selectedMoods.map((moodId) => {
                  const section = movieSections[moodId as keyof typeof movieSections]
                  return section ? <MovieSection key={moodId} section={section} icon={Fire} /> : null
                })}
              </div>
              <TopRatedSection />
            </div>
          </div>
        )}

        {activeTab === "watchlists" && (
          <div className="pt-16 px-6 lg:px-12">
            <div className="flex items-center justify-between mb-12">
              <h1 className="text-5xl font-black text-white tracking-tight">MY WATCHLISTS</h1>
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
                  <h3 className="text-white font-bold text-xl mb-3">Weekend Binge</h3>
                  <p className="text-gray-400 mb-4">Perfect for lazy weekends</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-semibold">12 movies</span>
                    <Badge variant="outline" className="border-blue-400 text-blue-400 bg-blue-400/10">
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
                  <h3 className="text-white font-bold text-xl mb-3">Action Pack</h3>
                  <p className="text-gray-400 mb-4">High-octane thrills</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-semibold">8 movies</span>
                    <Badge variant="outline" className="border-red-400 text-red-400 bg-red-400/10">
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
                  <p className="text-gray-500">No watchlists yet! Create your first one 🎬</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "blend" && (
          <div className="pt-16 px-6 lg:px-12">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-black text-white mb-6 tracking-tight">🎭 BLEND MODE</h1>
              <p className="text-gray-400 text-xl">Create shared movie recommendations with friends</p>
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
                <h3 className="text-white font-bold text-2xl mb-6">Active Blend: Movie Night Crew</h3>
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex -space-x-3">
                    <Avatar className="border-3 border-red-400 w-12 h-12">
                      <AvatarFallback className="bg-red-500 text-white font-bold">You</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-3 border-blue-400 w-12 h-12">
                      <AvatarFallback className="bg-blue-500 text-white font-bold">JS</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-3 border-green-400 w-12 h-12">
                      <AvatarFallback className="bg-green-500 text-white font-bold">MK</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-gray-400 font-semibold">3 members</span>
                </div>
                <div className="space-y-6">
                  <h4 className="text-white font-bold text-xl">Blended Picks for You:</h4>
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
                        <p className="text-white font-bold text-lg">Inception</p>
                        <p className="text-gray-400 text-sm mb-2">Sci-Fi • 2010</p>
                        <div className="flex -space-x-2">
                          <Avatar className="w-6 h-6 border-2 border-red-400">
                            <AvatarFallback className="bg-red-500 text-white text-xs">Y</AvatarFallback>
                          </Avatar>
                          <Avatar className="w-6 h-6 border-2 border-blue-400">
                            <AvatarFallback className="bg-blue-500 text-white text-xs">J</AvatarFallback>
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
                        <p className="text-gray-400 text-sm mb-2">Sci-Fi • 2021</p>
                        <div className="flex -space-x-2">
                          <Avatar className="w-6 h-6 border-2 border-red-400">
                            <AvatarFallback className="bg-red-500 text-white text-xs">Y</AvatarFallback>
                          </Avatar>
                          <Avatar className="w-6 h-6 border-2 border-green-400">
                            <AvatarFallback className="bg-green-500 text-white text-xs">M</AvatarFallback>
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
            className={`text-white hover:text-red-400 ${activeTab === "home" ? "text-red-400" : ""}`}
          >
            <Home className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTab("watchlists")}
            className={`text-white hover:text-red-400 ${activeTab === "watchlists" ? "text-red-400" : ""}`}
          >
            <Bookmark className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTab("blend")}
            className={`text-white hover:text-red-400 ${activeTab === "blend" ? "text-red-400" : ""}`}
          >
            <Users className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-blue-400">
            <Search className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-blue-400">
            <User className="w-6 h-6" />
          </Button>
        </div>
      </nav>
    </div>
  )
}
