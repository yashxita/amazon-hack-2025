"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import Image from "next/image"
export default function Blend(){
    return(
        <div className="pt-16 px-6 lg:px-12">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
                🎭 BLEND MODE
              </h1>
              <p className="text-gray-400 text-xl">
                Create shared movie recommendations with friends
              </p>
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
                <h3 className="text-white font-bold text-2xl mb-6">
                  Active Blend: Movie Night Crew
                </h3>
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex -space-x-3">
                    <Avatar className="border-3 border-red-400 w-12 h-12">
                      <AvatarFallback className="bg-red-500 text-white font-bold">
                        You
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="border-3 border-blue-400 w-12 h-12">
                      <AvatarFallback className="bg-blue-500 text-white font-bold">
                        JS
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="border-3 border-green-400 w-12 h-12">
                      <AvatarFallback className="bg-green-500 text-white font-bold">
                        MK
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-gray-400 font-semibold">3 members</span>
                </div>
                <div className="space-y-6">
                  <h4 className="text-white font-bold text-xl">
                    Blended Picks for You:
                  </h4>
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
                        <p className="text-white font-bold text-lg">
                          Inception
                        </p>
                        <p className="text-gray-400 text-sm mb-2">
                          Sci-Fi • 2010
                        </p>
                        <div className="flex -space-x-2">
                          <Avatar className="w-6 h-6 border-2 border-red-400">
                            <AvatarFallback className="bg-red-500 text-white text-xs">
                              Y
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="w-6 h-6 border-2 border-blue-400">
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              J
                            </AvatarFallback>
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
                        <p className="text-gray-400 text-sm mb-2">
                          Sci-Fi • 2021
                        </p>
                        <div className="flex -space-x-2">
                          <Avatar className="w-6 h-6 border-2 border-red-400">
                            <AvatarFallback className="bg-red-500 text-white text-xs">
                              Y
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="w-6 h-6 border-2 border-green-400">
                            <AvatarFallback className="bg-green-500 text-white text-xs">
                              M
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
    )
}