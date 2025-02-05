import styles from "./Carosel.module.css"
import Icon from "./Icon"
import React, { useEffect, useRef, useState } from "react"

type CaroselProps = {
  images: string[]
}

const Carosel: React.FC<CaroselProps> = ({ images }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [intervalId, setIntervalId] = useState<number | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0) // State to track scroll position

  const scrollAmount = 330 // Image width + margin
  const totalWidth = scrollAmount * images.length // Total width of one full set of images

  const scroll = () => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current
      scrollElement.scrollLeft += scrollAmount
      updateScrollPosition(scrollElement.scrollLeft)
      if (scrollElement.scrollLeft >= totalWidth) {
        scrollElement.scrollLeft -= totalWidth
        updateScrollPosition(scrollElement.scrollLeft)
      }
    }
  }

  useEffect(() => {
    const id = setInterval(scroll, 15000) as unknown as number
    setIntervalId(id)
    return () => {
      clearInterval(id)
      if (scrollRef.current) {
        updateScrollPosition(scrollRef.current.scrollLeft)
      }
    }
  }, [])

  const handleArrowClick = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current
      if (direction === "right") {
        scrollElement.scrollLeft += scrollAmount
      } else {
        scrollElement.scrollLeft -= scrollAmount
      }
      updateScrollPosition(scrollElement.scrollLeft)
      if (scrollElement.scrollLeft >= totalWidth) {
        scrollElement.scrollLeft -= totalWidth
      } else if (scrollElement.scrollLeft < 0) {
        scrollElement.scrollLeft += totalWidth
      }
      updateScrollPosition(scrollElement.scrollLeft)
    }
  }

  const updateScrollPosition = (position: number) => {
    setScrollPosition(position)
  }

  const handleMouseEnter = () => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  }
  const handleMouseLeave = () => {
    const id = setInterval(scroll, 15000) as unknown as number
    setIntervalId(id)
  }

  return (
    <div className={styles.CaroselContainer}>
      {scrollPosition > 0 && (
        <div
          className={`${styles.arrow} ${styles.left}`}
          onClick={() => handleArrowClick("left")}
        >
          <Icon glyph="arrow-left" />
        </div>
      )}
      <div
        ref={scrollRef}
        className={styles.imageContainer}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {images.concat(images).map(
          (
            image,
            index // Duplicate images for looping
          ) => (
            <img
              key={index}
              src={image}
              alt={`Slide ${index}`}
              className={styles.CaroselImage}
            />
          )
        )}
      </div>
      <div
        className={`${styles.arrow} ${styles.right}`}
        onClick={() => handleArrowClick("right")}
      >
        <Icon glyph="arrow-right" />
      </div>
    </div>
  )
}

export default Carosel
