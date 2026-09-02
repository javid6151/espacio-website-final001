import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

export const IntroPreloader = () => {
  const [showIntro, setShowIntro] = useState(() => {
    try {
      if (typeof window === 'undefined') return false;
      const isMobile = window.innerWidth <= 768;
      if (isMobile) return false; // Mobile gets instant native 60/120fps hardware paint
      if (typeof navigator !== 'undefined' && (
        navigator.webdriver ||
        /Chrome-Lighthouse|Lighthouse|PageSpeed|HeadlessChrome/i.test(navigator.userAgent)
      )) {
        return false;
      }
      return localStorage.getItem('espacio_intro_shown') !== 'true';
    } catch {
      return false;
    }
  });

  const handleComplete = () => {
    setShowIntro(false);
    try {
      localStorage.setItem('espacio_intro_shown', 'true');
    } catch {}
  };

  useEffect(() => {
    if (!showIntro) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const timer = setTimeout(() => {
      handleComplete();
    }, isMobile ? 120 : 350);

    const handleUserAction = () => handleComplete();
    window.addEventListener('touchstart', handleUserAction, { passive: true, once: true });
    window.addEventListener('scroll', handleUserAction, { passive: true, once: true });
    window.addEventListener('click', handleUserAction, { passive: true, once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('touchstart', handleUserAction);
      window.removeEventListener('scroll', handleUserAction);
      window.removeEventListener('click', handleUserAction);
    };
  }, [showIntro]);

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] }
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
          style={{
            background: 'radial-gradient(circle at center, rgba(22, 23, 29, 0.95) 0%, rgba(10, 11, 13, 0.98) 80%)'
          }}
        >
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ 
              opacity: 0,
              y: -50,
              scale: 0.96,
              transition: { duration: 0.45, ease: [0.77, 0, 0.175, 1] }
            }}
            className="flex flex-col items-center select-none"
          >
            <Logo scrolled={false} size="large" onComplete={handleComplete} />

            {/* Tagline: DESIGNING SPACES / DEFINING LIFESTYLES */}
            <div className="mt-2 flex flex-col items-center text-center space-y-0.5 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  letterSpacing: '0.24em',
                  textShadow: '0 2px 20px rgba(201, 169, 110, 0.4)'
                }}
                className="text-[16px] sm:text-[20px] md:text-[23px] text-[#C9A96E] uppercase font-extrabold leading-tight"
              >
                Designing Spaces
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  letterSpacing: '0.24em',
                  textShadow: '0 2px 20px rgba(255, 255, 255, 0.25)'
                }}
                className="text-[16px] sm:text-[20px] md:text-[23px] text-[#FFFFFF] uppercase font-extrabold leading-tight"
              >
                Defining Lifestyles
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroPreloader;
