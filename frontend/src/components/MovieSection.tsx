"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import MovieCard from "./MovieCard"

export default function MovieSection({ section, icon: Icon }: { section: any; icon?: any }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)

      // Calculate current page based on scroll position
      const cardWidth = 280 // card width + gap
      const cardsPerPage = Math.floor(clientWidth / cardWidth) || 4
      const currentPageNum = Math.floor(scrollLeft / (cardWidth * cardsPerPage))
      setCurrentPage(currentPageNum)

      // Calculate total pages
      const totalCards = section.movies.length
      const pages = Math.ceil(totalCards / cardsPerPage)
      setTotalPages(pages)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollButtons()
    }, 100)

    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollButtons)
      return () => {
        scrollElement.removeEventListener("scroll", checkScrollButtons)
        clearTimeout(timer)
      }
    }
    return () => clearTimeout(timer)
  }, [section.movies])

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -320, // Width of one card plus gap (280 + 40)
        behavior: "smooth",
      })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 320, // Width of one card plus gap (280 + 40)
        behavior: "smooth",
      })
    }
  }

  const scrollToPage = (pageIndex: number) => {
    if (scrollRef.current) {
      const cardWidth = 280
      const cardsPerPage = Math.floor(scrollRef.current.clientWidth / cardWidth) || 4
      const scrollPosition = pageIndex * cardWidth * cardsPerPage
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
    }
  }
  
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
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500 transition-all duration-200 ${
              !canScrollLeft ? "opacity-30 cursor-not-allowed" : "hover:bg-red-500/10"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500 transition-all duration-200 ${
              !canScrollRight ? "opacity-30 cursor-not-allowed" : "hover:bg-red-500/10"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-6 pb-4 overflow-x-auto scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {section.movies.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {/* Additional overlay buttons for better UX */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white hover:text-red-400 border border-gray-700 hover:border-red-500 backdrop-blur-sm w-12 h-12 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white hover:text-red-400 border border-gray-700 hover:border-red-500 backdrop-blur-sm w-12 h-12 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Scroll Progress Indicator with Active State */}
      {section.movies.length > 4 && totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => scrollToPage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentPage ? "bg-red-500 w-6 shadow-lg shadow-red-500/50" : "bg-gray-600 hover:bg-gray-400"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
