'use client';

import { ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useId, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface AppSelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function AppSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  label,
  error,
  disabled,
  className,
}: AppSelectProps) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)} ref={ref}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-secondary ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full bg-card border border-border text-text-primary',
            'rounded-2xl px-4 py-3 text-sm text-left',
            'flex items-center justify-between gap-2',
            'transition-all duration-200 outline-none',
            'focus:border-primary/50 focus:ring-2 focus:ring-primary/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isOpen && 'border-primary/50 ring-2 ring-primary/20',
            error && 'border-danger focus:border-danger/50 focus:ring-danger/20',
            !selectedOption && 'text-muted/50'
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.icon}
            {selectedOption?.label || placeholder}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted flex-shrink-0" />
          </motion.span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute z-50 w-full mt-2',
                'bg-card border border-border rounded-2xl',
                'shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
                'overflow-hidden'
              )}
            >
              <div className="max-h-60 overflow-y-auto py-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      'w-full px-4 py-2.5 text-sm text-left',
                      'flex items-center justify-between gap-2',
                      'transition-colors duration-150',
                      'hover:bg-primary/10',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                      option.value === value && 'bg-primary/10 text-primary'
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {option.icon}
                      {option.label}
                    </span>
                    {option.value === value && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <span className="text-xs text-danger ml-1">{error}</span>}
    </div>
  );
}
