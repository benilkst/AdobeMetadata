import React, { useState } from 'react';
import {
  X,
  Key,
  Cpu,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  Info,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Globe,
  Sliders,
  FileText
} from 'lucide-react';
import { ExtensionSettings, AIProviderId } from '../../types';
import { geminiProvider } from '../../ai/GeminiProvider';
import { UIScaleSelector } from './UIScaleSelector';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ExtensionSettings;
  onSave: (updated: Partial<ExtensionSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [model, setModel] = useState(settings.geminiModel || 'gemini-3.8-flash');
  const [customModel, setCustomModel] = useState('');
  const [keywordCount, setKeywordCount] = useState(settings.targetKeywordCount || 30);
  const [language, setLanguage] = useState(settings.language || 'English');
  const [descLength, setDescLength] = useState<'concise' | 'detailed'>(
    settings.descriptionLength || 'concise'
  );
  const [strictIp, setStrictIp] = useState(settings.strictIpMode);
  const [aiDisclosure, setAiDisclosure] = useState(settings.aiDisclosureDefault);
  const [provider, setProvider] = useState<AIProviderId>(settings.aiProvider);
  const [uiScale, setUiScale] = useState<number>(settings.uiScale || 100);
  const [showKey, setShowKey] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Live Connection Test State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const effectiveModel = model === 'custom' ? (customModel.trim() || 'gemini-3.8-flash') : model;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await geminiProvider.testConnection(apiKey, effectiveModel);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Connection test failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSave({
      geminiApiKey: apiKey.trim(),
      geminiModel: effectiveModel,
      targetKeywordCount: Number(keywordCount),
      language,
      descriptionLength: descLength,
      strictIpMode: strictIp,
      aiDisclosureDefault: aiDisclosure,
      aiProvider: provider,
      uiScale: Number(uiScale),
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Extension Settings</span>
            </h2>
            <p className="text-xs text-neutral-400">Configure AI engine, metadata guidelines, and privacy</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* 1. AI Provider Selection (Rule 3) */}
          <div>
            <label className="block font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>AI Provider</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer ${
                  provider === 'gemini'
                    ? 'border-blue-500 bg-blue-600/15 text-blue-300 font-semibold'
                    : 'border-neutral-800 hover:border-neutral-700 text-neutral-400'
                }`}
              >
                Gemini (Active)
              </button>
              <button
                type="button"
                disabled
                title="Planned for future modular release"
                className="py-2 px-3 rounded-lg border border-neutral-800/50 bg-neutral-900/50 text-neutral-600 text-center cursor-not-allowed"
              >
                OpenAI (soon)
              </button>
              <button
                type="button"
                disabled
                title="Planned for future modular release"
                className="py-2 px-3 rounded-lg border border-neutral-800/50 bg-neutral-900/50 text-neutral-600 text-center cursor-not-allowed"
              >
                Claude (soon)
              </button>
            </div>
          </div>

          {/* 2. Gemini API Key Configuration (Rule 4) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-neutral-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span>Gemini API Key</span>
              </label>
              <span className="text-[10px] text-neutral-500">Stored in chrome.storage.local</span>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-neutral-850 border border-neutral-750 rounded-lg px-3 py-2 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 text-xs pr-9 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                <Lock className="w-3 h-3 shrink-0 text-emerald-500" />
                <span>Direct client API call. Never exposed in public bundles.</span>
              </p>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !apiKey.trim()}
                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-40 disabled:hover:bg-neutral-800 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <span>Test Connection</span>
                )}
              </button>
            </div>

            {testResult && (
              <div
                className={`mt-2 p-2.5 rounded-lg border text-[11px] flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                    : 'bg-red-950/40 border-red-800/50 text-red-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* 3. Configurable Model ID (Rule 26) */}
          <div>
            <label className="block font-medium text-neutral-300 mb-1.5">Model ID</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-neutral-850 border border-neutral-750 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-blue-500 text-xs cursor-pointer"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended: Fast & Accurate)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Multimodal Reasoning)</option>
              <option value="gemini-flash-latest">gemini-flash-latest</option>
              <option value="custom">Custom Model ID...</option>
            </select>
            {model === 'custom' && (
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="Enter custom Gemini model ID..."
                className="w-full mt-2 bg-neutral-850 border border-neutral-750 rounded-lg px-3 py-2 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 text-xs font-mono"
              />
            )}
          </div>

          {/* 4. Generation Settings: Keyword Count, Language, Description Length (Rule 26) */}
          <div className="pt-2 border-t border-neutral-800/80 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-medium text-neutral-300">Target Keyword Count</label>
                <span className="font-mono text-neutral-300 font-semibold">{keywordCount} keywords</span>
              </div>
              <input
                type="range"
                min="15"
                max="49"
                value={keywordCount}
                onChange={(e) => setKeywordCount(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
                <span>15 (Tight)</span>
                <span>30 (Adobe Stock Optimal)</span>
                <span>49 (Max Allowed)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-300 mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Metadata Language</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-neutral-850 border border-neutral-750 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-blue-500 text-xs cursor-pointer"
                >
                  <option value="English">English (Standard Stock)</option>
                  <option value="Indonesian">Indonesian</option>
                  <option value="German">German</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-300 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Description Style</span>
                </label>
                <select
                  value={descLength}
                  onChange={(e) => setDescLength(e.target.value as 'concise' | 'detailed')}
                  className="w-full bg-neutral-850 border border-neutral-750 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-blue-500 text-xs cursor-pointer"
                >
                  <option value="concise">Concise (1–2 sentences)</option>
                  <option value="detailed">Detailed (2–3 sentences)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Display & UI Scaling (100%, 90%, 80%, 70%, 67%) */}
          <div className="pt-2 border-t border-neutral-800/80">
            <UIScaleSelector
              currentScale={uiScale}
              onScaleChange={setUiScale}
              variant="settings"
            />
          </div>

          {/* 6. Compliance & Strict IP Guard (Rule 15 & 26) */}
          <div className="pt-2 border-t border-neutral-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Strict IP & Brand Guard</span>
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Flags potential artist styles, trademark brands, characters, and generic filler
                </p>
              </div>
              <input
                type="checkbox"
                checked={strictIp}
                onChange={(e) => setStrictIp(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-200">Generative AI Disclosure Check</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Suggests AI disclosure tag automatically for synthetic imagery
                </p>
              </div>
              <input
                type="checkbox"
                checked={aiDisclosure}
                onChange={(e) => setAiDisclosure(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 accent-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 6. Privacy Disclosure (Rule 31) */}
          <div className="pt-2 border-t border-neutral-800/80">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <span className="font-semibold text-neutral-300 block">Privacy & Security Commitment</span>
              <p className="leading-relaxed">
                Assets selected for analysis are processed directly through your chosen AI provider API (Google Gemini).
                Assets are <strong>never uploaded to external third-party servers</strong>. All metadata history is stored exclusively in your local Chrome browser storage.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            {savedNotice ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Settings Saved</span>
              </>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
