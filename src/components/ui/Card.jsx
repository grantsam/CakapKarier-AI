import { motion } from 'framer-motion';

const Card = ({
  children,
  variant = 'default',
  interactive = false,
  className = '',
  as: Component = 'div',
  ...props
}) => {
  const variants = {
    default: 'bg-white rounded-2xl border border-slate-200 shadow-sm',
    elevated: 'bg-white rounded-2xl border border-slate-200 shadow-md',
    glass: 'rounded-2xl border border-white/40 shadow-xl backdrop-blur-2xl bg-white/75',
    subtle: 'bg-slate-50 rounded-2xl border border-slate-200'
  };

  const classes = `
    ${variants[variant] || variants.default}
    ${interactive ? 'transition-all duration-300 hover:-translate-y-1 hover:border-[#004A7C]/60 hover:shadow-xl cursor-pointer' : ''}
    ${className}
  `.trim();

  if (interactive) {
    const MotionComponent = Component === 'div' ? motion.div : motion(Component);
    return (
      <MotionComponent
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={classes}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  }

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Card;
