"use client";

import { useEffect, useState } from "react";

import { Award } from "lucide-react";

import { MovieRecommendation } from "../../services/api";
import MovieSection from "./MovieSection";

const genreMap: { [key: number]: string } = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export default function TopRatedSection() {
  const [topRated, setTopRated] = useState<MovieRecommendation[]>([]);

  useEffect(() => {
    const fetchTopRated = async () => {
      const getDateNDaysAgo = (n: number) => {
        const date = new Date();
        date.setDate(date.getDate() - n);
        return date.toISOString().split("T")[0];
      };

      const today = getDateNDaysAgo(0);
      const ninetyDaysAgo = getDateNDaysAgo(90);
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

      const url = `https://api.themoviedb.org/3/discover/movie?sort_by=vote_average.desc&vote_count.gte=100&primary_release_date.gte=${ninetyDaysAgo}&primary_release_date.lte=${today}&api_key=${apiKey}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        const transformed = (data.results || [])
          .filter((movie: any) => movie.poster_path)
          .slice(0, 10)
          .map(
            (movie: any): MovieRecommendation => ({
              title: movie.title || "No Title",
              score: Number(movie.vote_average?.toFixed(2)) || 0,
              genres: (movie.genre_ids || []).map(
                (id: number) => genreMap[id] || "Unknown"
              ),
              poster_path: movie.poster_path,
              release_date: movie.release_date || "Unknown",
              id:movie.id
            })
          );

        setTopRated(transformed);
      } catch (error) {
        console.error("Failed to fetch top-rated movies:", error);
      }
    };

    fetchTopRated();
  }, []);
  console.log(topRated[0]);

  return (
<div className="px-6">
  <MovieSection
  key="1"
    section={{
      title: "Top Rated",
      movies: topRated.map((movie) => ({
        ...movie,
        genre: movie.genres,
        poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        year: movie.release_date
          ? parseInt(movie.release_date.slice(0, 4))
          : 2023,
        match: Math.round(movie.score * 10),
      })),
    }}
    icon={Award}
  />
  </div>
);

}
