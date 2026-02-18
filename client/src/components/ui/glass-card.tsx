import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'primary' | 'accent' | 'warning';
  hover?: boolean;
  glow?: boolean;
  delay?: number;
}

const variantStyles = {
  default: {
    bg: 'bg-white/70',
    border: 'border-white/20',
    glow: 'shadow-lg shadow-gray-200/50',
  },
  success: {
    bg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-200/30',
    glow: 'shadow-lg shadow-emerald-200/30',
  },
  primary: {
    bg: 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10',
    border: 'border-blue-200/30',
    glow: 'shadow-lg shadow-blue-200/30',
  },
  accent: {
    bg: 'bg-gradient-to-br from-violet-500/10 to-purple-500/10',
    border: 'border-violet-200/30',
    glow: 'shadow-lg shadow-violet-200/30',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10',
    border: 'border-amber-200/30',
    glow: 'shadow-lg shadow-amber-200/30',
  },
};

export function GlassCard({
  children,
  className,
  variant = 'default',
  hover = true,
  glow = false,
  delay = 0,
}: GlassCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={hover ? {
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 }
      } : undefined}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'backdrop-blur-xl',
        styles.bg,
        'border',
        styles.border,
        glow && styles.glow,
        hover && 'cursor-pointer transition-all duration-300',
        className
      )}
    >
      {/* Efecto de brillo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />

      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// Version con gradiente animado
export function AnimatedGradientCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-[1px]',
        className
      )}
    >
      {/* Borde con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient-x rounded-2xl" />

      {/* Contenido interior */}
      <div className="relative bg-white rounded-2xl p-6 h-full">
        {children}
      </div>
    </motion.div>
  );
}
