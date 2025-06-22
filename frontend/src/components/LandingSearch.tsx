"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Mic, MicOff, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../services/api";

interface MovieSearchResult {
  id: string;
  title: string;
  genres?: string[];
  release_date?: string;
  poster_path?: string;
  score?: number;
  [key: string]: any;
}

interface LandingSearchProps {
  onMovieSelect: (movie: MovieSearchResult) => void;
  onVoiceResults: (results: MovieSearchResult[]) => void;
  className?: string;
}

export default function LandingSearch({
  onMovieSelect,
  onVoiceResults,
  className = "",
}: LandingSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showVoiceResults, setShowVoiceResults] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowVoiceResults(false);
      }
    }, 300); // 300ms delay for debouncing

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Recording timer effect
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const { data } = await axios.get<MovieSearchResult[]>("/search", {
        baseURL: API_BASE_URL,
        params: { title: searchQuery },
        headers: {
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true",
        },
      });
      setSearchResults(data);
      setShowVoiceResults(false);
    } catch (err: any) {
      console.error("Search failed:", err);
      toast.error("Search failed");
      setSearchResults([]);
    }
  };

  const startVoiceSearch = () => {
    setIsVoiceModalOpen(true);
    setShowVoiceResults(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      toast.success("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      processVoiceSearch();
    }
  };

  const processVoiceSearch = async () => {
    if (audioChunksRef.current.length === 0) {
      toast.error("No audio recorded");
      return;
    }

    setIsProcessing(true);

    try {
      // Create audio blob from chunks
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm;codecs=opus",
      });

      // Convert to WAV format (you might need to implement this conversion)
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("top_n", "10");

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to use voice search");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/recommend/voice`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            "bypass-tunnel-reminder": "true",
          },
        }
      );

      const recommendations = response.data.recommendations || [];

      // Clear text search and results
      setSearchQuery("");
      setSearchResults([]);
      setShowVoiceResults(false);

      // Send voice results to parent component
      onVoiceResults(recommendations);
      console.log(recommendations);
      toast.success(`Found ${recommendations.length} voice recommendations!`);
    } catch (error: any) {
      console.error("Voice search failed:", error);
      toast.error(error.response?.data?.detail || "Voice search failed");
    } finally {
      setIsProcessing(false);
      setIsVoiceModalOpen(false);
    }
  };

  const closeVoiceModal = () => {
    if (isRecording) {
      stopRecording();
    }
    setIsVoiceModalOpen(false);
    setRecordingTime(0);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowVoiceResults(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentResults = searchResults; // Remove voice results from dropdown
  const hasResults = currentResults.length > 0;

  return (
    <>
      <div className={`relative ${className}`}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowVoiceResults(false);
              }}
              className="bg-black border-2 border-gray-700 focus:border-red-500 text-white placeholder-gray-500 pr-20"
            />
            {(searchQuery || showVoiceResults) && (
              <Button
                onClick={clearSearch}
                size="sm"
                variant="ghost"
                className="absolute right-12 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-700"
              >
                <X className="w-4 h-4 text-gray-400" />
              </Button>
            )}
          </div>

          <Button
            size="icon"
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            className="text-gray-400 hover:text-red-400 bg-black border border-gray-700 hover:border-red-500"
          >
            <Search className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            onClick={startVoiceSearch}
            className="text-gray-400 hover:text-blue-400 bg-black border border-gray-700 hover:border-blue-500"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {hasResults && (
          <ul className="absolute top-full left-0 w-full mt-1 max-h-60 overflow-y-auto bg-black border border-blue-500 rounded-lg shadow-[0_0_10px_rgba(0,0,255,0.7),0_0_20px_rgba(255,0,0,0.7)] z-50">
            {showVoiceResults && (
              <li className="px-4 py-2 border-b border-gray-700">
                <span className="text-blue-400 text-sm font-semibold">
                  🎤 Voice Search Results
                </span>
              </li>
            )}
            {currentResults.map((movie, index) => (
              <li
                key={`${movie.id || movie.title}-${index}`}
                className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-white transition-shadow duration-200 hover:shadow-[0_0_8px_rgba(255,0,0,0.8),0_0_12px_rgba(0,0,255,0.8)]"
                onClick={() => onMovieSelect(movie)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-red-400 drop-shadow-[0_0_4px_rgba(255,0,0,0.8)]">
                      {movie.title}
                    </span>
                    {movie.release_date && (
                      <span className="text-blue-400 text-sm ml-2 drop-shadow-[0_0_4px_rgba(0,0,255,0.8)]">
                        ({movie.release_date.slice(0, 4)})
                      </span>
                    )}
                  </div>
                  {showVoiceResults && movie.score && (
                    <span className="text-green-400 text-xs">
                      {(movie.score * 100).toFixed(1)}% match
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Voice Recording Modal */}
      <Dialog open={isVoiceModalOpen} onOpenChange={closeVoiceModal}>
        <DialogContent className="bg-black/10 backdrop-blur-xl border border-blue-500 border-cyan-500 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              🎤 Voice Search
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-6 py-6">
            {!isRecording && !isProcessing && (
              <div className="text-center space-y-4">
                <p className="text-gray-300">
                  Describe the type of movie you want to watch
                </p>
                <p className="text-sm text-gray-400">
                  Example: &quot;I want something scary&quot; or
                  &quot;Show me happy movies&quot;
                </p>
                <Button
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              </div>
            )}

            {isRecording && (
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="absolute -inset-2 border-2 border-red-500 rounded-full animate-ping shadow-[0_0_6px_#f00]">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -inset-2 border-2 border-red-500 rounded-full animate-ping"></div>
                </div>
                <p className="text-red-400 font-semibold">Recording...</p>
                <p className="text-2xl font-mono text-white">
                  {formatTime(recordingTime)}
                </p>
                <Button
                  onClick={stopRecording}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-full"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              </div>
            )}

            {isProcessing && (
              <div className="text-center space-y-4 ">
                <p className="text-blue-400 font-semibold">
                  Processing your voice...
                </p>
                <p className="text-sm text-gray-400">
                  Finding perfect movie recommendations
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
