import React from 'react';
import { Settings, History, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { ExtensionSettings } from '../../types';
import { PWAInstallButton } from '../../pwa/PWAInstallButton';
import { UIScaleSelector } from './UIScaleSelector';

interface HeaderProps {
  settings: ExtensionSettings;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  isCompactMode: boolean;
  onToggleCompactMode: () => void;
  uiScale: number;
  onScaleChange: (scale: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenSettings,
  onOpenHistory,
  historyCount,
  isCompactMode,
  onToggleCompactMode,
  uiScale,
  onScaleChange,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight text-neutral-100 truncate">
              Adobe Stock AI Assistant
            </h1>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
              PWA
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 truncate">
            AI-powered metadata optimization for stock creators
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* PWA In-App Install Button */}
        <PWAInstallButton />

        {/* UI Scale Zoom Selector (100%, 90%, 80%, 70%, 67%) */}
        <UIScaleSelector currentScale={uiScale} onScaleChange={onScaleChange} variant="header" />

        {/* Toggle between 420px Chrome popup frame simulator and full width */}
        <button
          onClick={onToggleCompactMode}
          title={isCompactMode ? 'Switch to Full Tab Mode' : 'Switch to Chrome Popup Mode'}
          className="p-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition cursor-pointer"
          aria-label="Toggle display mode"
        >
          {isCompactMode ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenHistory}
          title="Recent Assets History"
          className="relative p-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition cursor-pointer"
          aria-label="Asset History"
        >
          <History className="w-4 h-4" />
          {historyCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-neutral-900" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          title="Settings & Gemini API Config"
          className="p-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition cursor-pointer"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
