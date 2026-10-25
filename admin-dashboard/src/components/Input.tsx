import { motion } from 'framer-motion';
import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  onIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = 'text', label, error, className = '', icon: Icon, onIconClick, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-[#1D1D1F]/80">{label}</label>
        )}
        <div className="relative">
          {/* @ts-expect-error framer-motion types clash with native input props */}
          <motion.input
            ref={ref}
            type={type}
            {...props}
            className={`w-full px-4 py-2.5 bg-white/50 border border-white/20 rounded-xl text-[#1D1D1F] placeholder:text-[#1D1D1F]/40 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:border-transparent transition-all duration-200 ${error ? 'border-[#FF3B30] ring-1 ring-[#FF3B30]/50' : ''} ${Icon ? 'pr-10' : ''} ${className}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          />
          {Icon && onIconClick && (
            <button
              type="button"
              onClick={onIconClick}
              disabled={props.disabled}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1D1D1F]/50 hover:text-[#1D1D1F] transition-colors disabled:opacity-50"
            >
              <Icon className="w-5 h-5" />
            </button>
          )}
        </div>
        {error && (
          <span className="text-xs text-[#FF3B30] mt-1">{error}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
