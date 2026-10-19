import React from 'react';
import { X, RefreshCw, Film, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import { AssetInput, ProcessingStage } from '../../types';
import { formatBytes, formatDuration } from '../../utils/fileHelpers';

interface AssetPreviewProps {
  asset: AssetInput;
  processingStage: ProcessingStage;
  onClear: () => void;
  onAnalyze: () => void;
  aiEngineName: string;
}

export const AssetPreview: React.FC<AssetPreviewProps> = ({
  asset,
  processingStage,
  onClear,
  onAnalyze,
  aiEngineName,
}) => {
  const isAnalyzing = processingStage === 'analyzing' || processingStage === 'generating' || processingStage === 'validating';

  return (
    <div className="bg-neutral-850 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      {/* Visual Preview Frame */}
      <div className="relative bg-neutral-950 aspect-video flex items-center justify-center overflow-hidden group">
        {asset.mediaType === 'image' ? (
          <img
            src={asset.previewUrl}
            alt={asset.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            src={asset.previewUrl}
            controls
            className="w-full h-full object-contain"
          />
        )}

        {/* Media Type & Dimension Overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-900/80 backdrop-blur border border-neutral-700/60 text-[11px] text-neutral-200">
          {asset.mediaType === 'image' ? (
            <ImageIcon className="w-3 h-3 text-blue-400" />
          ) : (
            <Film className="w-3 h-3 text-purple-400" />
          )}
          <span className="capitalize">{asset.mediaType}</span>
          {asset.width && asset.height && (
            <>
              <span className="text-neutral-500">·</span>
              <span className="font-mono">{asset.width}×{asset.height}</span>
            </>
          )}
          {asset.aspectRatio && (
            <>
              <span className="text-neutral-500">·</span>
              <span>{asset.aspectRatio}</span>
            </>
          )}
        </div>

        {/* Clear Button */}
        {!isAnalyzing && (
          <button
            onClick={onClear}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors border border-neutral-700/60"
            title="Remove asset and choose another"
            aria-label="Remove asset"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Asset Specifications Row */}
      <div className="p-3.5 border-t border-neutral-800/80 bg-neutral-900/40">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-semibold text-neutral-200 truncate" title={asset.name}>
              {asset.name}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
              <span>{formatBytes(asset.size)}</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="font-mono text-neutral-400">{asset.type || 'standard format'}</span>
              {asset.duration !== undefined && (
                <>
                  <span aria-hidden="true" className="text-neutral-600">·</span>
                  <span>{formatDuration(asset.duration)}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Asset Ready</span>
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-3.5 pt-3 border-t border-neutral-800/60 flex items-center justify-between gap-3">
          <div className="text-[11px] text-neutral-400 truncate">
            <span>Engine: </span>
            <span className="text-neutral-200 font-medium">{aiEngineName}</span>
          </div>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
              isAnalyzing
                ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-900/20 active:scale-[0.98]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Asset...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze Asset</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
