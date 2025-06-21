"use client";

import HeroTV from "./HeroTV";
import { useEffect, useState } from "react";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FlameIcon as Fire } from 'lucide-react';
import Hero from "./Hero";
import MoodSelector from "./MoodSelector";
import RecentlyWatchedSection from "./RecentlyWatchedSection";
// import TrendingSection from "./TrendingSection";
import DayRecommendationSection from "./DayRecommendationSection";
import Blend from "../components/Blend";
import TopRatedSection from "./TopRatedSection";
import { logout } from "../../services/api"; // Adjust the path if needed
import toast,{ Toaster } from "react-hot-toast";


export default function Landing() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname() 
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
      } catch (err) {
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

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <Toaster/>
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
                         
                        onClick={() => router.push("/blend")}   // <— go to /blend
                        className={`text-white hover:text-red-400 font-semibold tracking-wide ${
                          pathname.startsWith() === "/blend" ? "text-red-400" : ""
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
                   
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400"
                >
                  <Search className="w-4 h-4" />
                </Button>
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
      <main className="pt-20">
        {activeTab === "home" && (
          <div>
            <HeroTV></HeroTV>
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
      {/* Mobile Navigation
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 p-4">
        <div className="flex justify-around">
          <Button
             
            size="icon"
            onClick={() => setActiveTab("home")}
            className={`text-white hover:text-red-400 ${
              activeTab === "home" ? "text-red-400" : ""
            }`}
          >
            <Home className="w-6 h-6" />
          </Button>
          <Button
             
            size="icon"
            onClick={() => setActiveTab("watchlists")}
            className={`text-white hover:text-red-400 ${
              activeTab === "watchlists" ? "text-red-400" : ""
            }`}
          >
            <Bookmark className="w-6 h-6" />
          </Button>
          <Button
             
            size="icon"
            onClick={() => setActiveTab("blend")}
            className={`text-white hover:text-red-400 ${
              activeTab === "blend" ? "text-red-400" : ""
            }`}
          >
            <Users className="w-6 h-6" />
          </Button>
          <Button
             
            size="icon"
            className="text-white hover:text-blue-400"
          >
            <Search className="w-6 h-6" />
          </Button>
          <Button
             
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