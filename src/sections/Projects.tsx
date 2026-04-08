import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { 
  ExternalLink, Github, Building2, Globe, Code 
} from 'lucide-react';
import { useState } from 'react';

interface Project {
  title: string;
  description: string;
  tech: string[];
  category: string;
  image: string;
  demoUrl?: string;
  codeUrl?: string;
}

// Default project images - can be replaced with actual screenshots later
const projectImages: Record<string, string> = {
  'Ajinomoto VNTT - eSales DMS': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
  'Sabeco AMS': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
  'E-Commerce Platform': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
  'Task Management System': 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const [isHovered, setIsHovered] = useState(false);

  const categoryIcons: Record<string, React.ElementType> = {
    'Enterprise': Building2,
    'Web App': Globe,
    'Doanh nghiệp': Building2,
    'Default': Code,
  };

  const Icon = categoryIcons[project.category] || categoryIcons['Default'];

  return (
    <motion.div
      ref={ref}
      className="tech-card project-card group relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image/Header with Scroll Preview Effect */}
      <div className="relative h-44 sm:h-52 lg:h-56 overflow-hidden project-image-container">
        {/* Project Screenshot with Scroll Animation */}
        <motion.div
          className="absolute inset-0"
          animate={{
            y: isHovered ? '-30%' : '0%',
          }}
          transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
        >
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-auto min-h-[150%] object-cover object-top"
          />
        </motion.div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full glass text-xs font-medium backdrop-blur-md">
            {project.category}
          </span>
        </div>

        {/* Hover Overlay with Actions */}
        <motion.div
          className="absolute inset-0 bg-primary/80 flex items-center justify-center gap-3 sm:gap-4 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {project.demoUrl && (
            <motion.a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 sm:p-3 rounded-full bg-white text-primary shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
              transition={{ delay: 0.1 }}
            >
              <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.a>
          )}
          {project.codeUrl && (
            <motion.a
              href={project.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 sm:p-3 rounded-full bg-white text-primary shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
              transition={{ delay: 0.15 }}
            >
              <Github className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.a>
          )}
        </motion.div>

        {/* Scroll Indicator on Hover */}
        <motion.div
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full glass text-[10px] sm:text-xs">
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.div>
            <span>Preview</span>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1.5 sm:mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {project.title}
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {project.tech.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-muted text-[10px] sm:text-xs font-medium"
            >
              {tech}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-muted text-[10px] sm:text-xs font-medium">
              +{project.tech.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-14 h-14 sm:w-20 sm:h-20 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 bg-primary/10 rotate-45 translate-x-10 -translate-y-10 sm:translate-x-14 sm:-translate-y-14" />
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const [filter, setFilter] = useState('all');

  const rawProjects = t('projects.items', { returnObjects: true }) as Omit<Project, 'image'>[];
  
  // Add images to projects
  const projects: Project[] = rawProjects.map(p => ({
    ...p,
    image: projectImages[p.title] || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
  }));
  
  const filters = ['all', 'Enterprise', 'Web App', 'Doanh nghiệp'];
  
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter || 
        (filter === 'Enterprise' && p.category === 'Doanh nghiệp'));

  return (
    <section
      id="projects"
      className="relative py-16 sm:py-24 overflow-hidden"
      ref={ref}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 section-padding max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* Section Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
        >
          <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass text-xs sm:text-sm font-medium text-primary mb-3 sm:mb-4">
            {t('projects.subtitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-3 sm:mb-4">
            {t('projects.title')}
          </h2>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div 
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          {filters.map((f) => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'glass hover:bg-primary/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {f === 'all' ? 'All' : f}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div 
          className="grid sm:grid-cols-2 gap-4 sm:gap-6"
          layout
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </motion.div>

        {/* View More */}
        <motion.div 
          className="text-center mt-8 sm:mt-12"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <motion.a
            href="https://github.com/daicuong11"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full glass hover:bg-primary/10 transition-colors text-sm sm:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Github className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>View More on GitHub</span>
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}
