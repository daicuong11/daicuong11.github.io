import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTypingEffect } from '@/hooks/useScrollAnimation';
import { Download, ArrowRight, Github, Linkedin, Mail } from 'lucide-react';

export default function Hero() {
  const { t } = useTranslation();
  const typingTexts = t('hero.typing', { returnObjects: true }) as string[];
  const typedText = useTypingEffect(typingTexts, 100, 50);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24 lg:pt-0"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
        
        {/* Animated Grid - Hidden on mobile */}
        <div className="absolute inset-0 opacity-20 hidden sm:block">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(var(--primary), 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(var(--primary), 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* Floating Orbs - Smaller on mobile */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, -25, 0],
            y: [0, 25, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full hidden sm:block"
          style={{
            background: 'radial-gradient(circle, hsl(var(--secondary) / 0.25) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Code Particles - Fewer on mobile */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute code-font text-xs text-primary/20 hidden sm:block"
            style={{
              left: `${10 + i * 10}%`,
              top: `${20 + (i % 4) * 15}%`,
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            {['{ }', '< />', '[ ]', '( )', '&&', '||', '=>', '//'][i % 8]}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 section-padding max-w-7xl mx-auto w-full py-8 sm:py-12 lg:py-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <motion.div variants={itemVariants} className="mb-3 sm:mb-4">
              <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass text-xs sm:text-sm font-medium text-primary">
                {t('hero.greeting')}
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4"
            >
              <span className="gradient-text">{t('hero.name')}</span>
            </motion.h1>

            <motion.div
              variants={itemVariants}
              className="h-8 sm:h-10 lg:h-12 mb-4 sm:mb-6 flex items-center justify-center lg:justify-start"
            >
              <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-muted-foreground code-font">
                {typedText}
                <span className="animate-pulse text-primary">|</span>
              </span>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 px-2 sm:px-0"
            >
              {t('hero.description')}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-8"
            >
              <motion.a
                href="/LyDaiCuong_CV_En.pdf"
                download
                className="btn-primary-gradient flex items-center gap-2 text-sm sm:text-base px-5 sm:px-8 py-2.5 sm:py-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('hero.cta.download')}
              </motion.a>
              <motion.button
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2 text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('hero.cta.projects')}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </motion.div>

            {/* Social Links */}
            <motion.div
              variants={itemVariants}
              className="flex gap-3 sm:gap-4 justify-center lg:justify-start"
            >
              {[
                { icon: Github, href: 'https://github.com/daicuong11', label: 'GitHub' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
                { icon: Mail, href: 'mailto:lydaicuong784@gmail.com', label: 'Email' },
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 sm:p-3 rounded-full glass hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Profile Image with Avatar */}
          <motion.div
            variants={itemVariants}
            className="relative flex justify-center lg:justify-end order-1 lg:order-2"
          >
            <div className="relative">
              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--secondary)), hsl(var(--primary)))',
                  filter: 'blur(30px)',
                  opacity: 0.5,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Profile Container with Real Avatar */}
              <motion.div
                className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full overflow-hidden glass shadow-2xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Real Avatar Image */}
                <img
                  src="/avatar.png"
                  alt="Ly Dai Cuong"
                  className="w-full h-full object-cover object-top"
                />
                
                {/* Decorative Ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 sm:border-4 border-primary/30 pointer-events-none"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  style={{
                    borderStyle: 'dashed',
                  }}
                />
              </motion.div>

              {/* Floating Badges - Smaller and repositioned on mobile */}
              <motion.div
                className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl glass font-semibold text-xs sm:text-sm"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                .NET
              </motion.div>
              <motion.div
                className="absolute top-1/4 -left-4 sm:-left-8 px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl glass font-semibold text-xs sm:text-sm"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                React
              </motion.div>
              <motion.div
                className="absolute bottom-4 -right-3 sm:bottom-8 sm:-right-6 px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl glass font-semibold text-xs sm:text-sm"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                C#
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator - Hidden on small mobile */}
      <motion.div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-primary/50 flex justify-center pt-1.5 sm:pt-2">
          <motion.div
            className="w-1 sm:w-1.5 h-2 sm:h-3 rounded-full bg-primary"
            animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
