import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

/**
 * Preloads image URLs into browser memory and pre-decodes bitmap assets
 * before they are rendered in transitions.
 */
const preloadImages = (urls = []) => {
  if (!Array.isArray(urls)) return;
  urls.forEach((url) => {
    if (!url || typeof url !== 'string') return;
    const img = new Image();
    img.src = url;
    if (img.decode) {
      img.decode().catch(() => {});
    }
  });
};

const HeroSlideshow = memo(({
  images = [],
  intervalMs = 2800,
  initialIntervalMs = 1000,
  transitionDuration = 1.0,
  className = "absolute inset-0 w-full h-full object-cover",
  onIndexChange,
  showGradient = true,
  gradientClassName = "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 z-10 pointer-events-none"
}) => {
  const activeImages = Array.isArray(images) && images.length > 0 ? images : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canRenderSubsequent, setCanRenderSubsequent] = useState(false);
  const timerRef = useRef(null);

  const imagesKey = activeImages.join('|');

  // Preload and pre-decode all hero slides immediately so transitions are instantaneous
  useEffect(() => {
    if (activeImages.length > 0) {
      preloadImages(activeImages.map(url => getOptimizedImageUrl(url)));
    }
  }, [imagesKey]);

  // Notify parent on index change
  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange]);

  const containerRef = useRef(null);
  const [isInViewport, setIsInViewport] = useState(true);

  // Pause slideshow animation when hero is offscreen to save 100% GPU/CPU during page scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { rootMargin: "100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Main slideshow timer: runs only when in viewport, pauses when offscreen
  useEffect(() => {
    if (activeImages.length <= 1 || !isInViewport) return;

    let initTimeout;
    const startRegularTimer = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeImages.length);
      }, intervalMs);
    };

    const firstDelay = Math.min(initialIntervalMs ?? 1500, intervalMs);

    // Prompt transition for first slide so visitor doesn't wait through a long static pause
    initTimeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeImages.length);
      startRegularTimer();
    }, firstDelay);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(initTimeout);
        clearInterval(timerRef.current);
      } else {
        startRegularTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeImages.length, intervalMs, isInViewport]);

  // Safety check for empty image array
  if (activeImages.length === 0) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      {activeImages.map((src, idx) => {
        const isActive = idx === (currentIndex % activeImages.length);
        const optimizedSrc = getOptimizedImageUrl(src);

        return (
          <motion.img
            key={src}
            src={optimizedSrc}
            alt="ESPACIO Hero Showcase"
            decoding="async"
            loading="eager"
            fetchPriority={idx === 0 ? "high" : "auto"}
            initial={idx === 0 ? { opacity: 1, scale: 1.0 } : { opacity: 0, scale: 1.02 }}
            animate={isActive ? {
              opacity: 1,
              scale: 1.0,
            } : {
              opacity: 0,
              scale: 1.02,
            }}
            transition={{
              duration: transitionDuration,
              ease: [0.22, 1, 0.36, 1],
              opacity: { duration: transitionDuration * 0.85, ease: [0.4, 0, 0.2, 1] }
            }}
            style={{
              zIndex: isActive ? 2 : 1,
              transformOrigin: idx % 2 === 0 ? 'center center' : 'top center',
              imageRendering: 'high-quality',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
            }}
            className={`${className} object-cover transform-gpu`}
          />
        );
      })}

      {showGradient && <div className={gradientClassName} />}
    </div>
  );
});

HeroSlideshow.displayName = 'HeroSlideshow';

export default HeroSlideshow;
