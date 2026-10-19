import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, Check, ChevronDown } from 'lucide-react';

export const UI_SCALE_OPTIONS = [
  { value: 100, label: '100%', tag: 'Standard', desc: 'Default comfortable size' },
  { value: 90, label: '90%', tag: 'Compact', desc: 'Optimized for laptops' },
  { value: 80, label: '80%', tag: 'Dense', desc: 'Higher information density' },
  { value: 70, label: '70%', tag: 'Micro', desc: 'Wide keyword overview' },
  { value: 67, label: '67%', tag: '2/3 Scale', desc: 'Contributor side-by-side mode' },
] as const;

export type UIScaleValue = (typeof UI_SCALE_OPTIONS)[number]['value'];

interface UIScaleSelectorProps {
  currentScale: number;
  onScaleChange: (scale: number) => void;
  variant?: 'header' | 'settings';
}

export const UIScaleSelector: React.FC<UIScaleSelectorProps> = ({
  currentScale,
  onScaleChange,
  variant = 'header',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeOption =
    UI_SCALE_OPTIONS.find((opt) => opt.value === currentScale) || UI_SCALE_OPTIONS[0];

  if (variant === 'settings') {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
            UI Scale / Zoom Level
          </span>
          <span className="text-[11px] font-mono text-blue-400 font-semibold">{currentScale}%</span>
        </label>
        <p className="text-[11px] text-neutral-400">
          Adjust the visual scale of the application interface for smaller screens or high density.
        </p>
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {UI_SCALE_OPTIONS.map((opt) => {
            const isSelected = currentScale === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onScaleChange(opt.value)}
                className={`py-2 px-1 rounded-xl text-xs font-medium border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                    : 'bg-neutral-800/80 border-neutral-700/80 text-neutral-300 hover:bg-neutral-750 hover:text-white'
                }`}
              >
                <span className="font-semibold">{opt.label}</span>
                <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-neutral-400'}`}>
                  {opt.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Header quick dropdown variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Change UI Scale (100%, 90%, 80%, 70%, 67%)"
        aria-label="Change UI Scale"
        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
          currentScale !== 100
            ? 'bg-blue-950/60 border-blue-600/70 text-blue-300'
            : 'bg-neutral-800/80 border-neutral-700/80 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100'
        }`}
      >
        <ZoomIn className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="font-mono text-[11px] font-semibold">{currentScale}%</span>
        <ChevronDown className="w-3 h-3 text-neutral-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-1.5 z-50 text-neutral-100 animate-in fade-in slide-in-from-top-1">
          <div className="px-3 py-1 border-b border-neutral-800/80 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
            UI Scale Preset
          </div>
          <div className="py-1">
            {UI_SCALE_OPTIONS.map((opt) => {
              const isSelected = currentScale === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onScaleChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 text-blue-300 font-semibold'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono w-9">{opt.label}</span>
                    <span className="text-[11px] text-neutral-400 font-normal">({opt.tag})</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
