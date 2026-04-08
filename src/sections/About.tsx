import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { 
  GraduationCap, Briefcase, Calendar, MapPin, 
  Mail, Phone, Github, Award, User 
} from 'lucide-react';

export default function About() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  const personalInfo = [
    { icon: User, label: t('about.info.name'), value: 'Ly Dai Cuong' },
    { icon: Calendar, label: t('about.info.birth'), value: '01/01/2003' },
    { icon: Mail, label: t('about.info.email'), value: 'lydaicuong784@gmail.com' },
    { icon: Phone, label: t('about.info.phone'), value: '0367265803' },
    { icon: MapPin, label: t('about.info.address'), value: 'HCMC, Vietnam' },
    { icon: Github, label: 'GitHub', value: 'github.com/daicuong11' },
    { icon: Award, label: t('about.info.language'), value: 'Aptis Esol B1' },
  ];

  return (
    <section
      id="about"
      className="relative py-16 sm:py-24 overflow-hidden"
      ref={ref}
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <motion.div
        className="relative z-10 section-padding max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-10 sm:mb-16">
          <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass text-xs sm:text-sm font-medium text-primary mb-3 sm:mb-4">
            {t('about.subtitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text">
            {t('about.title')}
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Image & Quick Info */}
          <motion.div variants={itemVariants} className="space-y-6 sm:space-y-8">
            {/* Profile Card */}
            <div className="tech-card p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden glass flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl sm:text-5xl font-bold gradient-text">LC</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold mb-1">Ly Dai Cuong</h3>
                  <p className="text-primary font-medium mb-1 sm:mb-2 text-sm sm:text-base">{t('hero.title')}</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">{t('about.education.university')}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="tech-card p-4 sm:p-6">
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {t('about.description')}
              </p>
            </div>

            {/* Personal Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {personalInfo.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl glass"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 3 }}
                >
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-xs sm:text-sm font-medium truncate">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Education & Experience */}
          <motion.div variants={itemVariants} className="space-y-6 sm:space-y-8">
            {/* Education */}
            <div className="tech-card p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t('about.education.title')}</h3>
              </div>
              
              {/* Timeline */}
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[11px] sm:left-[15px] top-2 bottom-2 w-0.5 bg-primary/20" />
                
                {/* Timeline Item */}
                <div className="relative flex gap-4 sm:gap-6">
                  {/* Node */}
                  <div className="relative flex-shrink-0">
                    <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-primary border-4 border-background flex items-center justify-center" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="glass rounded-xl p-3 sm:p-4">
                      <h4 className="font-semibold text-base sm:text-lg">{t('about.education.university')}</h4>
                      <p className="text-primary font-medium text-sm">{t('about.education.degree')}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {t('about.education.period')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                          {t('about.education.gpa')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="tech-card p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t('about.experience.title')}</h3>
              </div>
              
              {/* Timeline */}
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[11px] sm:left-[15px] top-2 bottom-2 w-0.5 bg-primary/20" />
                
                {/* Timeline Item */}
                <div className="relative flex gap-4 sm:gap-6">
                  {/* Node with pulse */}
                  <div className="relative flex-shrink-0">
                    <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-primary border-4 border-background flex items-center justify-center">
                      <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="glass rounded-xl p-3 sm:p-4">
                      <h4 className="font-semibold text-base sm:text-lg">{t('about.experience.company')}</h4>
                      <p className="text-primary font-medium text-sm">{t('about.experience.position')}</p>
                      <p className="flex items-center gap-1 mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t('about.experience.period')}
                      </p>
                      
                      <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                        <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50">
                          <p className="font-medium text-xs sm:text-sm">Ajinomoto VNTT - eSales DMS</p>
                          <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                            Enterprise DMS solution for optimizing distribution and sales efficiency
                          </p>
                        </div>
                        <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50">
                          <p className="font-medium text-xs sm:text-sm">Sabeco AMS</p>
                          <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                            Distribution management and sales force automation system
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
