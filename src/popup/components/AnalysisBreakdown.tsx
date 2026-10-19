import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  ShieldAlert,
  Sparkles,
  Box,
  Compass,
  Palette,
  Copy,
  Check,
  UserCheck,
  Code2,
  Gauge,
  Film
} from 'lucide-react';
import { VisualAnalysis } from '../../types';

interface AnalysisBreakdownProps {
  analysis: VisualAnalysis;
}

export const AnalysisBreakdown: React.FC<AnalysisBreakdownProps> = ({ analysis }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1800);
  };

  const confidenceEntries = Object.entries(analysis.confidence || {});

  return (
    <div className="bg-neutral-850 border border-neutral-800 rounded-xl overflow-hidden transition-all text-xs">
      {/* Header bar */}
      <div className="px-4 py-3 flex items-center justify-between bg-neutral-900/60 border-b border-neutral-800/80">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left flex-1"
        >
          <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-100">Structured Visual Understanding</span>
              <span className="text-[10px] text-blue-400 bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-800/40 font-mono">
                JSON Pipeline
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {analysis.primarySubject?.length || 0} primary subjects · {analysis.concepts?.length || 0} stock concepts
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1 transition-colors ${
              showRawJson
                ? 'bg-neutral-800 border-neutral-700 text-blue-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Toggle raw JSON structure"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 text-neutral-300">
          {/* Raw JSON View */}
          {showRawJson ? (
            <div className="relative">
              <div className="flex items-center justify-between pb-1.5 text-[11px] text-neutral-400">
                <span>Structured JSON Payload (Adobe Stock Schema)</span>
                <button
                  onClick={handleCopyJson}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono text-[10px]"
                >
                  {copiedJson ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-[11px] text-blue-200 overflow-x-auto max-h-64 leading-relaxed">
                {JSON.stringify(analysis, null, 2)}
              </pre>
            </div>
          ) : (
            <>
              {/* Video Timeline Keyframes & Temporal Synthesis (Rule 7) */}
              {analysis.videoFrames && analysis.videoFrames.length > 0 && (
                <div className="space-y-2 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-purple-400" />
                      <span>Extracted Video Timeline Keyframes ({analysis.videoFrames.length} frames sampled)</span>
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                      Temporal Multi-Frame
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    {analysis.videoFrames.map((f, i) => (
                      <div key={i} className="space-y-1">
                        <div className="aspect-video bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800 relative">
                          <img src={f.dataUrl} alt="" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono text-neutral-200">
                            {f.timestamp}s ({f.percentage}%)
                          </span>
                        </div>
                        <span className="text-[9px] text-neutral-400 block text-center truncate">
                          {i === 0 ? 'Start State' : i === analysis.videoFrames!.length - 1 ? 'End State' : `Frame #${i + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {analysis.movementDetails && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-neutral-800 text-[11px]">
                      {analysis.movementDetails.beginningState && (
                        <div className="p-2 rounded bg-neutral-950/60 border border-neutral-800/80">
                          <span className="text-neutral-400 block text-[10px] font-semibold">Beginning State</span>
                          <span className="text-neutral-200">{analysis.movementDetails.beginningState}</span>
                        </div>
                      )}
                      {analysis.movementDetails.cameraMovement && (
                        <div className="p-2 rounded bg-neutral-950/60 border border-neutral-800/80">
                          <span className="text-neutral-400 block text-[10px] font-semibold">Camera Motion</span>
                          <span className="text-neutral-200">{analysis.movementDetails.cameraMovement}</span>
                        </div>
                      )}
                      {analysis.movementDetails.endingState && (
                        <div className="p-2 rounded bg-neutral-950/60 border border-neutral-800/80">
                          <span className="text-neutral-400 block text-[10px] font-semibold">Ending State</span>
                          <span className="text-neutral-200">{analysis.movementDetails.endingState}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Core Visual Dimensions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Primary & Secondary Subject */}
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                    <Box className="w-3.5 h-3.5 text-blue-400" />
                    <span>Primary Subject</span>
                  </span>
                  <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
                    <p className="text-neutral-100 font-medium">
                      {analysis.primarySubject?.join(', ') || 'None specified'}
                    </p>
                    {analysis.secondarySubjects?.length > 0 && (
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Supporting: {analysis.secondarySubjects.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Action & Movement */}
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-blue-400" />
                    <span>Action & Activity</span>
                  </span>
                  <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
                    <p className="text-neutral-100 font-medium">
                      {analysis.actions?.join(', ') || 'Static composition / None'}
                    </p>
                    {analysis.objects?.length > 0 && (
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Key objects: {analysis.objects.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Environment & Setting */}
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-neutral-400">Environment & Setting</span>
                  <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
                    <p className="text-neutral-200">
                      {analysis.environment?.join(', ') || 'Studio / Isolated background'}
                    </p>
                  </div>
                </div>

                {/* 4. Visual Style & Medium */}
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-purple-400" />
                    <span>Visual Style</span>
                  </span>
                  <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
                    <p className="text-neutral-200 font-medium">
                      {analysis.visualStyle?.join(', ') || 'Realistic photography'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Composition, Colors, Text */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800/80">
                  <span className="text-neutral-400 block mb-0.5">Composition</span>
                  <span className="text-neutral-200">
                    {analysis.composition?.join(', ') || 'Standard framing'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800/80">
                  <span className="text-neutral-400 block mb-0.5">Visible Colors</span>
                  <span className="text-neutral-200">
                    {analysis.colors?.join(', ') || 'Natural palette'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800/80">
                  <span className="text-neutral-400 block mb-0.5">Text in Image</span>
                  <span className="text-neutral-200">
                    {analysis.textDetected?.length ? analysis.textDetected.join(', ') : 'None detected'}
                  </span>
                </div>
              </div>

              {/* Abstract Concepts (Search Drivers) */}
              {analysis.concepts?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-neutral-400">
                    Abstract Stock Concepts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.concepts.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-200 text-[11px]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Adobe Stock Compliance Guards */}
              <div className="space-y-2 pt-1 border-t border-neutral-800/70">
                {/* Model Release Guard */}
                {analysis.peoplePresent && (
                  <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/40 text-blue-300 flex items-start gap-2">
                    <UserCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                    <div>
                      <p className="font-semibold text-[11px]">Model Release Rule</p>
                      <p className="text-[11px] text-blue-300/80 mt-0.5">
                        People detected. Adobe Stock requires a signed Model Release if recognizable persons appear in commercial assets.
                      </p>
                    </div>
                  </div>
                )}

                {/* Brand & Trademark Warnings */}
                {(analysis.possibleBrands?.length > 0 || analysis.possibleTrademarks?.length > 0) && (
                  <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <p className="font-semibold text-[11px]">Brand / Trademark Warning</p>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        Potential commercial properties observed:{' '}
                        {[...analysis.possibleBrands, ...analysis.possibleTrademarks].join(', ')}.
                        Ensure logos are removed before stock submission.
                      </p>
                    </div>
                  </div>
                )}

                {/* Generative AI Recommendation */}
                {analysis.generativeAIIndicators?.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-900/40 text-purple-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-purple-400" />
                    <div>
                      <p className="font-semibold text-[11px]">Generative AI Indicators</p>
                      <p className="text-[11px] text-purple-300/80 mt-0.5">
                        Identified traits: {analysis.generativeAIIndicators.join(', ')}. Disclose as AI-generated in Adobe Stock Contributor Portal.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Confidence Rating Meter */}
              {confidenceEntries.length > 0 && (
                <div className="pt-2 border-t border-neutral-800/70">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1.5">
                    <Gauge className="w-3.5 h-3.5 text-blue-400" />
                    <span>Visual Analysis Confidence</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {confidenceEntries.map(([metric, val]) => (
                      <div key={metric} className="p-2 rounded bg-neutral-900/70 border border-neutral-800/70">
                        <div className="flex justify-between text-[10px] text-neutral-400 capitalize mb-1">
                          <span>{metric}</span>
                          <span className="font-mono text-neutral-200">{Math.round(val * 100)}%</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all"
                            style={{ width: `${Math.round(val * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
