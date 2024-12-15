// Mark component as client-side rendered
'use client'

// Import necessary dependencies
import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

// Array of image URLs for the gallery
const images = [
  'https://i.ibb.co/vBqpxC2/Subject-2.png',
  'https://i.ibb.co/zN1BKjs/Subject.png',
]

// Metadata for each image
const imageData = [
  { city: "Warsaw, Poland", transport: "Train" },
  { city: "Amsterdam, Netherlands", transport: "Train" },
]

export default function ImageGallery() {
  // State to track current image index and slide direction
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right

  // Handler for previous image button
  const goToPrevious = () => {
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  // Handler for next image button
  const goToNext = () => {
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  // Animation variants for image sliding
  const variants = {
    // Initial position based on slide direction
    enter: (direction: number) => ({
      x: direction > 0 ? 350 : -350, // Slide in from right or left
      opacity: 0,
    }),
    // Centered position
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    // Exit position based on slide direction
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 350 : -350, // Slide out to right or left
      opacity: 0,
    }),
  }

  // Animation variants for text fade effect
  const textVariants = {
    enter: {
      opacity: 0, // Start fully transparent
    },
    center: {
      opacity: 1, // Fade in to fully visible
    },
    exit: {
      opacity: 0, // Fade out to transparent
    },
  }

  return (
    // Main container with full height and gray background
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-12">
      <div className="w-full max-w-[350px] flex flex-col items-center">
        {/* Text container with fixed height to prevent layout shifts */}
        <div className="h-[72px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex + "-text"}
              initial="enter"
              animate="center"
              exit="exit"
              variants={textVariants}
              transition={{
                opacity: { duration: 0.2 },
              }}
              className="flex flex-col items-center px-4 text-center"
            >
              {/* City name */}
              <h1 className="font-inter text-[#181D27] text-xl sm:text-2xl font-bold tracking-[-0.04em] mb-1">
                {imageData[currentIndex].city}
              </h1>
              {/* Transport type */}
              <h2 className="font-inter text-[#535862] text-lg sm:text-xl tracking-[-0.03em]">
                {imageData[currentIndex].transport}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Image gallery container with increased top margin */}
        <div className="relative w-full mt-12">
          {/* Image container */}
          <div className="w-full sm:w-[350px] relative mb-4">
            {/* Container with minimum height to prevent collapse during image load */}
            <div className="relative" style={{ minHeight: 200 }}>
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 500, damping: 40 },
                    opacity: { duration: 0.15 },
                  }}
                  className="w-full absolute top-0 left-0"
                >
                  <Image
                    src={images[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    width={350}
                    height={0}
                    style={{ width: '100%', height: 'auto' }}
                    className="rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation buttons - Desktop: sides, Mobile: bottom */}
          <div className="flex justify-center gap-8 mt-6 sm:hidden">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full hover:bg-white transition-all duration-200 border-gray-200"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full hover:bg-white transition-all duration-200 border-gray-200"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop navigation buttons */}
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:flex absolute left-[-4rem] top-1/2 transform -translate-y-1/2 z-10 rounded-full hover:bg-white transition-all duration-200 border-gray-200"
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:flex absolute right-[-4rem] top-1/2 transform -translate-y-1/2 z-10 rounded-full hover:bg-white transition-all duration-200 border-gray-200"
            onClick={goToNext}
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}