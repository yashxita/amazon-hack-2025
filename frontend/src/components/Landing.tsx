"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  FlameIcon as Fire,
} from "lucide-react";
import Hero from "./Hero";
import MoodSelector from "./MoodSelector";
import RecentlyWatchedSection from "./RecentlyWatchedSection";
import TrendingSection from "./TrendingSection";
import DayRecommendationSection from "./DayRecommendationSection";
import Blend from "../components/Blend";
import TopRatedSection from "./TopRatedSection";
import Watchlist from "../components/WatchLists";

export default function Landing() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
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

        {activeTab === "watchlists" && <Watchlist />}
        {activeTab === "blend" && <Blend />}
      </main>
      {/* Mobile Navigation
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
      </nav> */}
    </div>
  );
}
