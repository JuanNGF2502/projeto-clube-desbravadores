'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ColorPickerProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
  className?: string;
}

const presetColors = [
  // Reds
  '#EF4444', '#DC2626', '#B91C1C', '#991B1B',
  // Oranges
  '#F97316', '#EA580C', '#C2410C',
  // Yellows
  '#EAB308', '#CA8A04', '#A16207',
  // Greens
  '#22C55E', '#16A34A', '#15803D', '#166534',
  // Teals
  '#14B8A6', '#0D9488', '#0F766E',
  // Blues
  '#0EA5E9', '#0284C7', '#0369A1', '#1E40AF', '#1E3A8A',
  // Purples
  '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6',
  // Pinks
  '#EC4899', '#DB2777', '#BE185D',
  // Neutral
  '#71717A', '#52525B', '#3F3F46', '#27272A',
];

export function ColorPicker({ colors, onChange, maxColors = 3, className }: ColorPickerProps) {
  const [showPresets, setShowPresets] = useState(false);
  const [customColor, setCustomColor] = useState('#C6A15B');

  const addColor = (color: string) => {
    if (colors.length < maxColors && !colors.includes(color)) {
      onChange([...colors, color]);
    }
  };

  const removeColor = (colorToRemove: string) => {
    onChange(colors.filter((c) => c !== colorToRemove));
  };

  const getRingStyle = (color: string, isSelected: boolean) => {
    return isSelected ? { boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${color}` } : {};
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
  };

  const addCustomColor = () => {
    addColor(customColor);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Selected colors */}
      <div className="flex gap-2 flex-wrap items-center">
        <AnimatePresence mode="popLayout">
          {colors.map((color, index) => (
            <motion.div
              key={color}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="relative group"
            >
              <div
                className="w-10 h-10 rounded-xl cursor-pointer transition-all hover:scale-105"
                style={{
                  backgroundColor: color,
                  ...getRingStyle(color, true),
                }}
              />
              {colors.length > 1 && (
                <button
                  onClick={() => removeColor(color)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-card border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-text-primary" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add color button */}
        {colors.length < maxColors && (
          <button
            onClick={() => setShowPresets(!showPresets)}
            className={cn(
              'w-10 h-10 rounded-xl border-2 border-dashed border-border',
              'flex items-center justify-center text-muted',
              'hover:border-primary hover:text-primary transition-colors'
            )}
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Color picker dropdown */}
      <AnimatePresence>
        {showPresets && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border rounded-xl p-4 shadow-xl"
          >
            {/* Custom color input */}
            <div className="flex gap-2 mb-4 pb-4 border-b border-border">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary uppercase"
              />
              <button
                onClick={addCustomColor}
                className="px-3 py-2 bg-primary text-background rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
              >
                Adicionar
              </button>
            </div>

            {/* Preset colors */}
            <div className="space-y-2">
              <p className="text-xs text-muted">Cores predefinidas</p>
              <div className="grid grid-cols-8 gap-2">
                {presetColors.map((color) => {
                  const isSelected = colors.includes(color);
                  const isDisabled = colors.includes(color) || colors.length >= maxColors;

                  return (
                    <button
                      key={color}
                      onClick={() => addColor(color)}
                      disabled={isDisabled}
                      className={cn(
                        'w-8 h-8 rounded-lg transition-all hover:scale-110',
                        isSelected && 'opacity-50 cursor-not-allowed',
                        !isDisabled && 'hover:brightness-110'
                      )}
                      style={{
                        backgroundColor: color,
                        ...(isSelected ? getRingStyle(color, true) : {}),
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            <p className="text-xs text-muted mt-3">
              {colors.length === 0
                ? 'Adicione pelo menos 1 cor'
                : `${colors.length}/${maxColors} cores adicionadas`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview gradient */}
      {colors.length > 0 && (
        <div>
          <p className="text-xs text-muted mb-1">Pré-visualização</p>
          <div
            className="h-3 rounded-full"
            style={{
              background: colors.length === 1
                ? colors[0]
                : `linear-gradient(to right, ${colors.join(', ')})`,
            }}
          />
        </div>
      )}
    </div>
  );
}