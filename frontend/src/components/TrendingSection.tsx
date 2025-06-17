"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp } from "lucide-react";
import MovieCard from "./MovieCard";

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
];

export default function TrendingSection() {
  return (
    <div className="mb-16 px-6 lg:px-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <TrendingUp className="w-8 h-8 text-green-400" />
          <h2 className="text-white text-3xl font-black tracking-wide">
            TRENDING NOW
          </h2>
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
  );
}
