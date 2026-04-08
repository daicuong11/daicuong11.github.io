import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart, Code2, ArrowUp } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-12 overflow-hidden">
      {/* Top Border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="section-padding max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <motion.a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
              className="flex items-center gap-2 text-xl font-bold"
              whileHover={{ scale: 1.05 }}
            >
              <Code2 className="w-6 h-6 text-primary" />
              <span className="gradient-text">Cuong.Dev</span>
            </motion.a>
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </p>
          </div>

          {/* Made With */}
          <motion.div 
            className="flex items-center gap-2 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span>{t('footer.madeWith')}</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>{t('footer.and')}</span>
            <span className="font-medium text-primary">React + TypeScript</span>
          </motion.div>

          {/* Back to Top */}
          <motion.button
            onClick={scrollToTop}
            className="p-3 rounded-full glass hover:bg-primary/10 transition-colors"
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-border/50">
          {['home', 'about', 'skills', 'projects', 'contact'].map((item) => (
            <motion.a
              key={item}
              href={`#${item}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ y: -2 }}
            >
              {t(`nav.${item}`)}
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
}
