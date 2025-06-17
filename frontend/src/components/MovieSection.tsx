"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import {
  ChevronLeft,
  ChevronRight,
  FlameIcon as Fire,
} from "lucide-react"
import MovieCard from "./MovieCard"

export default function MovieSection({ section, icon: Icon }: { section: any; icon?: any }){
    return (
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
  );
}