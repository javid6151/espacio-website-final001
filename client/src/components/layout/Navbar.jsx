import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Briefcase, FolderKanban, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../common/Logo';
import GooeyNav from '../ui/GooeyNav';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Pages that start with a dark cinematic hero
  const hasDarkHero = ['/', '/about', '/services', '/projects', '/spaces', '/what-we-do', '/materials', '/products'].some(path => 
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  ) && !location.search.includes('success=true');

  useEffect(() => {
    const handleScroll = () => {
      // On dark-hero pages: turn solid as soon as user leaves the hero header (~250px)
      // On other pages: become solid immediately after 20px.
      const threshold = hasDarkHero ? Math.min(window.innerHeight * 0.35, 250) : 20;
      setScrolled(window.scrollY > threshold);
    };
    // Run once on mount in case page loads mid-scroll
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasDarkHero]);

  useEffect(() => {
    setMobileMenuOpen(false);
    // Reset scrolled state when navigating to a new page
    setScrolled(false);
  }, [location]);

  const defaultNavLinks = [
    { name: 'Home',     path: '/' },
    { name: 'Services',  path: '/services' },
    { name: 'Projects',  path: '/projects' },
    { name: 'Spaces',    path: '/spaces' },
    { name: 'Materials', path: '/materials' },
    { name: 'About',     path: '/about' },
  ];

  const normalizeNavPath = (p) => {
    if (!p) return '/';
    if (p === '/what-we-do' || p.startsWith('/what-we-do/')) return p.replace('/what-we-do', '/spaces');
    if (p === '/products' || p.startsWith('/products/')) return p.replace('/products', '/materials');
    return p;
  };

  const normalizeNavLabel = (lbl) => {
    if (lbl === 'What We Do') return 'Spaces';
    if (lbl === 'Materials Library' || lbl === 'Products') return 'Materials';
    return lbl;
  };

  const [navLinks, setNavLinks] = useState(defaultNavLinks);

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const { getCMSData, STORAGE_KEYS } = await import('../../utils/cmsStore');
        const stored = getCMSData(STORAGE_KEYS.SETTINGS);
        if (stored && stored.nav_items) {
          const cmsLinks = stored.nav_items
            .filter((item) => item.visible)
            .map((item) => ({ 
              name: normalizeNavLabel(item.label), 
              path: normalizeNavPath(item.path) 
            }));
          if (cmsLinks.length > 0) {
            setNavLinks(cmsLinks);
            return;
          }
        }
      } catch {}

      try {
        const { default: axios } = await import('axios');
        const res = await axios.get('/settings');
        if (res.data.success && res.data.data && res.data.data.nav_items) {
          const cmsLinks = res.data.data.nav_items
            .filter((item) => item.visible)
            .map((item) => ({ 
              name: normalizeNavLabel(item.label), 
              path: normalizeNavPath(item.path) 
            }));
          if (cmsLinks.length > 0) setNavLinks(cmsLinks);
        }
      } catch {}
    };

    fetchNav();

    const handleSync = () => fetchNav();
    window.addEventListener('espacio_cms_update', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('espacio_cms_update', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);



  const isNavLight = scrolled || !hasDarkHero || location.search.includes('success=true');
  const isBgTransparent = !isNavLight || location.search.includes('success=true');
  const isContact = location.pathname.startsWith('/contact');
  const navPosition = isContact ? 'absolute' : 'fixed';

  const resetScroll = (smoothIfSame = false, targetPath = '') => {
    if (smoothIfSame && window.location.pathname === targetPath) {
      if (window.lenis) {
        window.lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    } else {
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  return (
    <>
      <header 
        role="banner"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled 
            ? 'py-2.5 sm:py-3.5 bg-bg/90 backdrop-blur-xl border-b border-ink-border/40 shadow-nav' 
            : 'py-4 sm:py-5 bg-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-3 z-10 transition-transform duration-300 active:scale-95 group"
            onClick={() => resetScroll(true, '/')}
          >
            <Logo scrolled={scrolled} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <GooeyNav items={navLinks} scrolled={scrolled} />
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link 
              to="/contact" 
              onClick={() => resetScroll(true, '/contact')}
              className={`font-sans text-[11px] uppercase tracking-widest font-bold px-6 py-2.5 rounded-pill transition-all duration-300 flex items-center gap-2 group shadow-sm active:scale-95 ${
                scrolled 
                  ? 'bg-ink text-bg hover:bg-gold hover:text-ink' 
                  : 'bg-ink text-bg hover:bg-gold hover:text-ink'
              }`}
            >
              <span>Contact us</span>
              <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer ${
              scrolled 
                ? 'text-ink hover:bg-ink-muted/10' 
                : 'text-ink hover:bg-black/5'
            }`}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Fullscreen overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-bg-dark text-bg flex flex-col justify-between p-8 pt-28 lg:hidden shadow-2xl"
          >
            <nav className="flex flex-col gap-2 flex-1">
              {navLinks.map((link, i) => (
                <motion.div 
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link 
                    to={link.path}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      resetScroll(true, link.path);
                    }}
                    className="block font-display text-3xl font-semibold text-white hover:text-gold py-3 border-b border-white/10 transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
            
            <Link 
              to="/contact" 
              onClick={() => {
                setMobileMenuOpen(false);
                resetScroll(true, '/contact');
              }}
              className="mt-8 inline-flex items-center justify-center gap-2 bg-white text-ink font-sans text-[12px] font-bold uppercase tracking-widest px-6 py-4.5 rounded-pill w-full hover:bg-white/90 transition-colors"
            >
              Contact us <ArrowUpRight size={13} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Tab Bar (D'LIFE inspired) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-45 bg-bg/95 backdrop-blur-md border-t border-ink-border/30 h-20 flex items-center justify-around px-4 shadow-[0_-6px_20px_rgba(0,0,0,0.06)] pb-safe">
        {/* Tab: Services */}
        <Link 
          to="/services" 
          onClick={() => resetScroll(true, '/services')}
          className="flex flex-col items-center gap-1 text-ink-soft hover:text-ink transition-colors flex-1 py-2"
        >
          <Briefcase size={22} className="text-ink-soft" />
          <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-ink-soft">Services</span>
        </Link>

        {/* Tab: Projects */}
        <Link 
          to="/projects" 
          onClick={() => resetScroll(true, '/projects')}
          className="flex flex-col items-center gap-1 text-ink-soft hover:text-ink transition-colors flex-1 py-2"
        >
          <FolderKanban size={22} className="text-ink-soft" />
          <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-ink-soft">Projects</span>
        </Link>

        {/* Tab: Home */}
        <Link 
          to="/" 
          onClick={() => resetScroll(true, '/')}
          className="flex flex-col items-center justify-end relative h-full flex-1 pb-2 text-ink-soft hover:text-ink transition-colors group"
        >
          {/* House Shape Wrapper Container */}
          <div className="w-[60px] h-[60px] absolute -top-4 left-1/2 -translate-x-1/2 transition-transform duration-300 group-hover:scale-105 group-active:scale-95 flex items-center justify-center">
            {/* House Silhouette SVG Background */}
            <svg 
              width="60" 
              height="60" 
              viewBox="0 0 64 64" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full drop-shadow-[0_-3px_10px_rgba(0,0,0,0.22)]"
            >
              <path
                d="M 30.1 7.2
                   C 31.2 6.1, 32.8 6.1, 33.9 7.2
                   L 57.2 28.5
                   C 58.4 29.6, 57.9 31, 56.3 31
                   H 51
                   V 56
                   C 51 58.2, 49.2 60, 47 60
                   H 17
                   C 14.8 60, 13 58.2, 13 56
                   V 31
                   H 7.7
                   C 6.1 31, 5.6 29.6, 6.8 28.5
                   Z"
                fill="#000000"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* Logo Emblem centered inside the house body */}
            <div className="relative z-10 scale-[0.8] translate-y-[5px]">
              <Logo showText={false} scrolled={false} />
            </div>
          </div>
          <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-ink-soft group-hover:text-ink transition-colors">Home</span>
        </Link>

        {/* Tab: Materials */}
        <Link 
          to="/products" 
          onClick={() => resetScroll(true, '/products')}
          className="flex flex-col items-center gap-1 text-ink-soft hover:text-ink transition-colors flex-1 py-2"
        >
          <Package size={22} className="text-ink-soft" />
          <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-ink-soft">Materials</span>
        </Link>

        {/* Tab: Menu Toggle */}
        <button aria-label="Open navigation menu" onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center gap-1 text-ink-soft hover:text-ink transition-colors flex-1 py-2 bg-transparent border-0 cursor-pointer">
          <Menu size={22} className="text-ink-soft" />
          <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-ink-soft">Menu</span>
        </button>
      </div>
    </>
  );
};

export default Navbar;
