"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FlameIcon as Fire,
  Award,
} from "lucide-react";
import MovieCard from "./MovieCard";
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
export default function TopRatedSection(){
    return(
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
}