import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  as,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 outline-none focus-visible:ring-2 focus-visible:ring-[#004A7C]/30 focus-visible:ring-offset-2';

  const variants = {
    primary: 'bg-[#004A7C] text-white hover:bg-[#00365d] shadow-md',
    secondary: 'bg-white text-[#004A7C] border-2 border-[#004A7C] hover:bg-slate-50',
    outline: 'bg-transparent border-2 border-slate-200 text-slate-600 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-lg',
    md: 'px-6 py-3 text-sm rounded-full',
    lg: 'px-8 py-4 text-base rounded-full'
  };

  const Component = as ? motion(as) : motion.button;
  const isNativeButton = !as;
  const combinedClasses = `
    ${baseStyles}
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <Component
      {...(isNativeButton ? { type, disabled: disabled || loading } : {})}
      aria-disabled={!isNativeButton && (disabled || loading) ? true : undefined}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      className={combinedClasses}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Memproses...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {Icon && <Icon size={size === 'sm' ? 16 : 20} />}
          {children}
        </div>
      )}
    </Component>
  );
};

export default Button;
