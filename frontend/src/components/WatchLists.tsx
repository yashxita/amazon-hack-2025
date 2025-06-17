"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Plus,
  Zap,
} from "lucide-react";

export default function Watchlist(){
    return(
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
    )
}