import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { 
  Code2, Server, Database, Wrench, Layers 
} from 'lucide-react';

interface Skill {
  name: string;
  level: number;
}

interface SkillCategory {
  icon: React.ElementType;
  title: string;
  skills: Skill[];
  color: string;
}

function SkillBar({ skill, index }: { skill: Skill; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.5 });

  return (
    <motion.div
      ref={ref}
      className="mb-3 sm:mb-4"
      initial={{ opacity: 0, x: -20 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex justify-between items-center mb-1 sm:mb-2">
        <span className="font-medium text-xs sm:text-sm">{skill.name}</span>
        <span className="text-xs sm:text-sm text-muted-foreground">{skill.level}%</span>
      </div>
      <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
          }}
          initial={{ width: 0 }}
          animate={isVisible ? { width: `${skill.level}%` } : { width: 0 }}
          transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

function SkillCard({ category, index }: { category: SkillCategory; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      className="tech-card p-4 sm:p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15 }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div 
          className="p-2 sm:p-3 rounded-xl"
          style={{ background: `${category.color}20` }}
        >
          <category.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: category.color }} />
        </div>
        <h3 className="text-sm sm:text-lg font-bold">{category.title}</h3>
      </div>
      
      <div className="space-y-1">
        {category.skills.map((skill, skillIndex) => (
          <SkillBar key={skill.name} skill={skill} index={skillIndex} />
        ))}
      </div>
    </motion.div>
  );
}

// Tech Stack Item Component
function TechStackItem({ tech, index, isVisible }: { tech: { name: string; icon: string }; index: number; isVisible: boolean }) {
  return (
    <motion.div
      className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-full glass hover:bg-primary/10 transition-colors cursor-default"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.8 + index * 0.05 }}
      whileHover={{ scale: 1.05, y: -2 }}
    >
      <span className="text-base sm:text-lg">{tech.icon}</span>
      <span className="font-medium text-[10px] sm:text-xs">{tech.name}</span>
    </motion.div>
  );
}

export default function Skills() {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const skillCategories: SkillCategory[] = [
    {
      icon: Code2,
      title: t('skills.categories.frontend'),
      color: '#3b82f6',
      skills: t('skills.frontend', { returnObjects: true }) as Skill[],
    },
    {
      icon: Server,
      title: t('skills.categories.backend'),
      color: '#10b981',
      skills: t('skills.backend', { returnObjects: true }) as Skill[],
    },
    {
      icon: Database,
      title: t('skills.categories.database'),
      color: '#f59e0b',
      skills: t('skills.database', { returnObjects: true }) as Skill[],
    },
    {
      icon: Wrench,
      title: t('skills.categories.tools'),
      color: '#ec4899',
      skills: t('skills.tools', { returnObjects: true }) as Skill[],
    },
  ];

  const techStack = [
    { name: 'React', icon: '⚛️' },
    { name: 'TypeScript', icon: '🔷' },
    { name: '.NET Core', icon: '🎯' },
    { name: 'C#', icon: '☕' },
    { name: 'SQL Server', icon: '🗄️' },
    { name: 'PostgreSQL', icon: '🐘' },
    { name: 'MongoDB', icon: '🍃' },
    { name: 'Git', icon: '📦' },
    { name: 'Tailwind', icon: '🎨' },
    { name: 'ABP Framework', icon: '🏗️' },
    { name: 'Blazor', icon: '⚡' },
    { name: 'Express.js', icon: '🚂' },
  ];

  return (
    <section
      id="skills"
      className="relative py-16 sm:py-24 overflow-hidden"
      ref={ref}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 section-padding max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* Section Header */}
        <motion.div 
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
        >
          <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass text-xs sm:text-sm font-medium text-primary mb-3 sm:mb-4">
            {t('skills.subtitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text">
            {t('skills.title')}
          </h2>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-16">
          {skillCategories.map((category, index) => (
            <SkillCard key={category.title} category={category} index={index} />
          ))}
        </div>

        {/* Tech Stack Cloud - Grid on mobile, flex on desktop */}
        <motion.div
          className="tech-card p-4 sm:p-6 lg:p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
            <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold">Tech Stack</h3>
          </div>

          {/* Mobile: 3-column grid, Tablet: 4-column grid, Desktop: flex wrap */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:flex lg:flex-wrap gap-2 sm:gap-2.5 lg:gap-3 justify-items-center lg:justify-center">
            {techStack.map((tech, index) => (
              <TechStackItem 
                key={tech.name} 
                tech={tech} 
                index={index} 
                isVisible={isVisible} 
              />
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
        >
          {[
            { value: '2+', label: 'Years Experience' },
            { value: '10+', label: 'Projects Completed' },
            { value: '15+', label: 'Technologies' },
            { value: '100%', label: 'Commitment' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-4 sm:p-6 rounded-xl glass"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
