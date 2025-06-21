"use client";

import HeroTV from "./HeroTV";
import { useEffect, useState, KeyboardEvent } from "react";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import MoodSelector from "./MoodSelector";
import RecentlyWatchedSection from "./RecentlyWatchedSection";
// import TrendingSection from "./TrendingSection";
import DayRecommendationSection from "./DayRecommendationSection";
import Blend from "../components/Blend";
import TopRatedSection from "./TopRatedSection";
import { logout } from "../../services/api"; // Adjust the path if needed
import toast, { Toaster } from "react-hot-toast";

interface MovieSearchResult {
  id: string;
  title: string;
  genres?: string[];
  release_date?: string;
  poster_path?: string;
  [key: string]: any;
}

export default function Landing() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get("/me", {
          baseURL: "http://127.0.0.1:8000",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch {
        console.warn("Not logged in or session expired");
        localStorage.removeItem("token");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    toast.success("Log Out Successful");
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return toast.error("Please enter a movie title to search");
    }
    try {
      const { data } = await axios.get<MovieSearchResult[]>("/search", {
        baseURL: "http://127.0.0.1:8000",
        params: { title: searchQuery },
      });
      setSearchResults(data);
      if (data.length === 0) {
        toast("No movies found", { icon: '🎬' });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Search failed");
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <Toaster />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <h1 className="text-3xl font-black text-white tracking-tight">
                CINE<span className="text-red-500">AI</span>
              </h1>
              <div className="hidden md:flex gap-8">
                <Button
                  onClick={() => setActiveTab("home")}
                  className={`text-white hover:text-red-400 font-semibold tracking-wide ${
                    activeTab === "home" ? "text-red-400" : ""
                  }`}
                >
                  MOVIES
                </Button>
                <Button
                  onClick={() => router.push("/watchlist")}
                  className="text-white hover:text-red-400 font-semibold tracking-wide"
                >
                  WATCHLISTS
                </Button>
                <Button
                  onClick={() => router.push("/blend")}
                  className={`text-white hover:text-red-400 font-semibold tracking-wide ${
                    pathname.startsWith("/blend") ? "text-red-400" : ""
                  }`}
                >
                  BLEND
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search + Neon Dropdown */}
              <div className="relative w-64">
                <Input
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchResults([]);
                  }}
                  onKeyDown={onKeyDown}
                  className="bg-black border-2 border-gray-700 focus:border-red-500 text-white placeholder-gray-500 pr-12"
                />
                <Button
                  size="icon"
                  onClick={handleSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400"
                >
                  <Search className="w-4 h-4" />
                </Button>

                {searchResults.length > 0 && (
                  <ul className="absolute top-full left-0 w-full mt-1 max-h-60 overflow-y-auto bg-black border border-blue-500 rounded-lg shadow-[0_0_10px_rgba(0,0,255,0.7),0_0_20px_rgba(255,0,0,0.7)] z-50">
                    {searchResults.map((movie) => (
                      <li
                        key={movie.id}
                        className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-white transition-shadow duration-200 hover:shadow-[0_0_8px_rgba(255,0,0,0.8),0_0_12px_rgba(0,0,255,0.8)]"
                        onClick={() => {
                          setSearchQuery(movie.title);
                          setSearchResults([]);
                        }}
                      >
                        <span className="text-red-400 drop-shadow-[0_0_4px_rgba(255,0,0,0.8)]">
                          {movie.title}
                        </span>
                        {movie.release_date && (
                          <span className="text-blue-400 text-sm ml-2 drop-shadow-[0_0_4px_rgba(0,0,255,0.8)]">
                            ({movie.release_date.slice(0, 4)})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">
                    {user.username}
                  </span>
                  <Button
                    className="border-red-500 text-red-400 bg-black hover:bg-red-100 font-semibold"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  className="border-blue-400 text-blue-400 hover:bg-blue-100 font-semibold"
                  onClick={() => router.push("/login")}
                >
                  LOGIN
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 space-y-8">
        {activeTab === "home" && (
          <div>
            <HeroTV />
            {/* <Hero /> */}
            <div className="py-16">
              <RecentlyWatchedSection />
              <DayRecommendationSection />
              {/* <TrendingSection /> */}
              <MoodSelector />
              <TopRatedSection />
            </div>
          </div>
        )}

        {activeTab === "blend" && <Blend />}
      </main>
    </div>
  );
}
