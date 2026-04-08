import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import MusicPlayer from '@/components/MusicPlayer';
import { 
  Menu, X, Sun, Moon, Zap, Globe, Code2 
} from 'lucide-react';

const navItems = ['home', 'about', 'skills', 'projects', 'contact'];

export default function Navigation() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const themeIcons = {
    light: <Sun className="w-4 h-4 sm:w-5 sm:h-5" />,
    dark: <Moon className="w-4 h-4 sm:w-5 sm:h-5" />,
    neon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />,
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'neon'> = ['light', 'dark', 'neon'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass py-2 sm:py-3' : 'py-3 sm:py-5 bg-transparent'
        }`}
      >
        <div className="section-padding max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo - Simplified on mobile */}
          <motion.a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
            className="flex items-center gap-1.5 sm:gap-2 font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Code2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <span className="gradient-text text-base sm:text-xl hidden sm:inline">Cuong.Dev</span>
            <span className="gradient-text text-lg sm:hidden">&lt;C/&gt;</span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <motion.button
                key={item}
                onClick={() => scrollToSection(item)}
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {t(`nav.${item}`)}
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            ))}
          </div>

          {/* Controls - Compact on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Theme Toggle */}
            <motion.button
              onClick={cycleTheme}
              className="p-1.5 sm:p-2 rounded-full glass hover:bg-primary/10 transition-colors"
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              title={`Theme: ${theme}`}
            >
              {themeIcons[theme]}
            </motion.button>

            {/* Language Toggle */}
            <motion.button
              onClick={toggleLanguage}
              className="p-1.5 sm:p-2 rounded-full glass hover:bg-primary/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={i18n.language === 'en' ? 'Switch to Vietnamese' : 'Switch to English'}
            >
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            {/* Music Player */}
            <div className="scale-90 sm:scale-100 origin-right">
              <MusicPlayer />
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-full glass hover:bg-primary/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[60px] z-40 md:hidden"
          >
            <div className="glass mx-4 rounded-2xl p-3 shadow-xl">
              <div className="flex flex-col gap-1">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => scrollToSection(item)}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-foreground hover:bg-primary/10 transition-colors font-medium text-sm"
                  >
                    {t(`nav.${item}`)}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
