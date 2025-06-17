"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, FlameIcon as Fire } from "lucide-react";
import MovieCard from "./MovieCard";

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
export default function DayRecommendationSection() {
  const dayRecommendation = getDayRecommendations();
  return (
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
}
