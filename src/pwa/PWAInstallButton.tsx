import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, CheckCircle, Smartphone } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGenericGuide, setShowGenericGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the install button
  if (isInstalled) {
    return (
      <div
        title="Running in Standalone PWA mode"
        className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-400 font-medium"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>PWA Installed</span>
      </div>
    );
  }

  // Native Chromium / Android / Desktop prompt
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-all duration-150 cursor-pointer animate-in fade-in"
        title="Install Adobe Stock AI Assistant as Desktop / Mobile PWA"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/70 hover:bg-neutral-800 text-neutral-200 text-xs font-medium transition cursor-pointer"
          title="Install on iOS Home Screen"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Install on iOS</span>
          <span className="sm:hidden">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl text-neutral-100">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-md text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-neutral-300">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-neutral-100 font-medium">1. Tap the Share button</strong>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      In the Safari browser bottom toolbar, tap the Share icon.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-neutral-100 font-medium">2. Add to Home Screen</strong>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Scroll down in the share sheet and tap <em>"Add to Home Screen"</em>.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2 text-xs font-semibold text-white transition cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Ambient web button (when beforeinstallprompt hasn't fired yet or browser is desktop Firefox/Safari)
  return (
    <>
      <button
        onClick={() => setShowGenericGuide(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition cursor-pointer"
        title="PWA Install Guide"
      >
        <Download className="w-3.5 h-3.5 text-blue-400" />
        <span className="hidden sm:inline">Install PWA</span>
        <span className="sm:hidden">PWA</span>
      </button>

      {showGenericGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl text-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-400" />
                Install Web App (PWA)
              </h3>
              <button
                onClick={() => setShowGenericGuide(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-neutral-300">
              <p className="text-neutral-400">
                You can install this app to your desktop or mobile device for quick, offline-capable access:
              </p>
              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-1.5">
                <p className="font-medium text-neutral-200">On Chrome / Edge (Desktop & Android):</p>
                <p className="text-neutral-400 text-[11px]">
                  Click the install icon in the address bar (top right) or browser menu &rarr; <em>"Install Adobe Stock AI Assistant"</em>.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-1.5">
                <p className="font-medium text-neutral-200">On iOS (Safari):</p>
                <p className="text-neutral-400 text-[11px]">
                  Tap Share &rarr; <em>"Add to Home Screen"</em>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGenericGuide(false)}
              className="mt-5 w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2 text-xs font-semibold text-white transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
