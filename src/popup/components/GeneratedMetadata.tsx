import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  AlertTriangle,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  SlidersHorizontal,
  Info,
  GripVertical,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { StockMetadata, ValidationResult, AssetInput } from '../../types';
import { ADOBE_STOCK_CATEGORIES } from '../../ai/prompts/metadataPrompt';
import { calculateQualityScore } from '../../compliance/qualityScorer';
import { rankKeywords } from '../../metadata/keywordRanker';

interface GeneratedMetadataProps {
  metadata: StockMetadata;
  validation: ValidationResult;
  asset: AssetInput;
  onUpdateMetadata: (updated: StockMetadata, newValidation?: ValidationResult) => void;
  onRegenerate: () => void;
}

export const GeneratedMetadata: React.FC<GeneratedMetadataProps> = ({
  metadata,
  validation,
  asset,
  onUpdateMetadata,
}) => {
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [keywordViewMode, setKeywordViewMode] = useState<'priority' | 'grouped'>('priority');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleCopyAll = () => {
    const text = `TITLE:
${metadata.title}

DESCRIPTION:
${metadata.description}

CATEGORY:
${metadata.category}

CREATED USING GENERATIVE AI:
${metadata.aiGenerated ? 'Yes' : 'No'}

KEYWORDS (${metadata.keywords.length}):
${metadata.keywords.join(', ')}`;

    handleCopy(text, 'all');
  };

  const handleTitleChange = (newTitle: string) => {
    const updated = { ...metadata, title: newTitle };
    const newScore = calculateQualityScore(updated);
    onUpdateMetadata(updated, newScore);
  };

  const handleDescriptionChange = (newDesc: string) => {
    const updated = { ...metadata, description: newDesc };
    const newScore = calculateQualityScore(updated);
    onUpdateMetadata(updated, newScore);
  };

  const handleCategoryChange = (newCat: string) => {
    const updated = { ...metadata, category: newCat };
    const newScore = calculateQualityScore(updated);
    onUpdateMetadata(updated, newScore);
  };

  const handleAiToggle = (enabled: boolean) => {
    const updated = { ...metadata, aiGenerated: enabled };
    onUpdateMetadata(updated);
  };

  const handleAddKeyword = () => {
    const clean = newKeywordInput.trim().toLowerCase();
    if (!clean || metadata.keywords.includes(clean)) {
      setNewKeywordInput('');
      return;
    }
    const updatedKeywords = [...metadata.keywords, clean];
    const updated = { ...metadata, keywords: updatedKeywords };
    const newScore = calculateQualityScore(updated);
    onUpdateMetadata(updated, newScore);
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (index: number) => {
    const updatedKeywords = metadata.keywords.filter((_, i) => i !== index);
    const updated = { ...metadata, keywords: updatedKeywords };
    const newScore = calculateQualityScore(updated);
    onUpdateMetadata(updated, newScore);
  };

  const handleRemoveKeywordByName = (keywordName: string) => {
    const target = keywordName.toLowerCase().trim();
    const updatedKeywords = metadata.keywords.filter((k) => k.toLowerCase() !== target);
    const updated = { ...metadata, keywords: updatedKeywords };
    const newScore = calculateQualityScore(updated);
    onUpdateMetadata(updated, newScore);
  };

  const handleMoveKeyword = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= metadata.keywords.length || fromIndex === toIndex) return;
    const clone = [...metadata.keywords];
    const [moved] = clone.splice(fromIndex, 1);
    clone.splice(toIndex, 0, moved);
    const updated = { ...metadata, keywords: clone };
    const newScore = calculateQualityScore(updated);
    onUpdateMetadata(updated, newScore);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      handleMoveKeyword(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAutoReRank = () => {
    const rankingResult = rankKeywords(
      metadata.keywords,
      {
        subjects: [],
        actions: [],
        environments: [],
        objects: [],
        styles: [],
        concepts: [],
      },
      metadata.keywords.length
    );
    const updated = {
      ...metadata,
      keywords: rankingResult.ranked,
      classifiedKeywords: rankingResult.classified,
    };
    const newScore = calculateQualityScore(updated);
    onUpdateMetadata(updated, newScore);
  };

  // Export functions
  const exportAsFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const safeTitle = `"${metadata.title.replace(/"/g, '""')}"`;
    const safeDesc = `"${metadata.description.replace(/"/g, '""')}"`;
    const safeKeywords = `"${metadata.keywords.join(', ').replace(/"/g, '""')}"`;
    const csvContent = `filename,title,description,keywords,category,aiGenerated\n${asset.name},${safeTitle},${safeDesc},${safeKeywords},${metadata.category},${metadata.aiGenerated ? 'yes' : 'no'}`;
    exportAsFile(csvContent, `${asset.name.replace(/\.[^/.]+$/, '')}_metadata.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(
      {
        filename: asset.name,
        fileType: asset.type,
        fileSize: asset.size,
        metadata,
        qualityScore: validation.overallScore,
      },
      null,
      2
    );
    exportAsFile(jsonContent, `${asset.name.replace(/\.[^/.]+$/, '')}_metadata.json`, 'application/json');
  };

  const handleExportTXT = () => {
    const txtContent = `Adobe Stock Metadata Export
Filename: ${asset.name}
----------------------------------------
TITLE:
${metadata.title}

DESCRIPTION:
${metadata.description}

CATEGORY:
${metadata.category}

GENERATIVE AI:
${metadata.aiGenerated ? 'Yes' : 'No'}

KEYWORDS (${metadata.keywords.length}):
${metadata.keywords.join(', ')}
`;
    exportAsFile(txtContent, `${asset.name.replace(/\.[^/.]+$/, '')}_metadata.txt`, 'text/plain');
  };

  const redFlags = validation.warnings.filter((w) => w.level === 'red');
  const yellowFlags = validation.warnings.filter((w) => w.level === 'yellow');
  const greenFlags = validation.warnings.filter((w) => w.level === 'green');

  // Group keywords if grouped view is selected
  const groupedKeywords: Record<string, string[]> = {};
  if (metadata.classifiedKeywords?.length) {
    for (const item of metadata.classifiedKeywords) {
      const g = item.group.replace(/_/g, ' ');
      if (!groupedKeywords[g]) groupedKeywords[g] = [];
      groupedKeywords[g].push(item.keyword);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-neutral-800">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <span>Generated Stock Metadata</span>
            <span className="text-[10px] font-normal text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 font-mono">
              Ready to copy
            </span>
          </h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Formula: Subject + Action + Context · 20–35 Priority-ranked keywords
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleCopyAll}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            {copiedKey === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'all' ? 'Copied All!' : 'Copy All'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            title="Export CSV (Ready for stock batch submission)"
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            title="Export JSON"
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <button
            onClick={handleExportTXT}
            title="Export TXT"
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">TXT</span>
          </button>
        </div>
      </div>

      {/* Quality Score Header Card (Rule 18: Label is Metadata Quality Score) */}
      <div className="bg-neutral-850 border border-neutral-800 rounded-xl p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-base border shadow-inner ${
                validation.overallScore >= 85
                  ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-400'
                  : validation.overallScore >= 70
                  ? 'bg-yellow-950/60 border-yellow-600/40 text-yellow-400'
                  : 'bg-red-950/60 border-red-600/40 text-red-400'
              }`}
            >
              {validation.overallScore}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-100">Metadata Quality Score</span>
                <span className="text-[10px] text-neutral-400 font-mono">/ 100</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {validation.overallScore >= 85
                  ? 'Green status: High metadata consistency with stock contributor standards'
                  : validation.overallScore >= 70
                  ? 'Yellow status: Review recommended potential issues below'
                  : 'Red status: Significant metadata issue requiring modification'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowScoreDetails(!showScoreDetails)}
            className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
          >
            <span>{showScoreDetails ? 'Hide Breakdown' : 'Score Breakdown'}</span>
            {showScoreDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Detailed Scores Breakdown */}
        {showScoreDetails && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2.5 mt-1 border-t border-neutral-800/80 text-[11px]">
            <div className="text-center p-2 bg-neutral-900 rounded-lg border border-neutral-800/60">
              <span className="text-neutral-400 block text-[10px]">Title</span>
              <span className="font-mono text-neutral-200 font-medium">{validation.titleScore}%</span>
            </div>
            <div className="text-center p-2 bg-neutral-900 rounded-lg border border-neutral-800/60">
              <span className="text-neutral-400 block text-[10px]">Description</span>
              <span className="font-mono text-neutral-200 font-medium">{validation.descriptionScore}%</span>
            </div>
            <div className="text-center p-2 bg-neutral-900 rounded-lg border border-neutral-800/60">
              <span className="text-neutral-400 block text-[10px]">Keywords</span>
              <span className="font-mono text-neutral-200 font-medium">{validation.keywordsScore}%</span>
            </div>
            <div className="text-center p-2 bg-neutral-900 rounded-lg border border-neutral-800/60">
              <span className="text-neutral-400 block text-[10px]">Relevance</span>
              <span className="font-mono text-neutral-200 font-medium">{validation.relevanceScore}%</span>
            </div>
            <div className="text-center p-2 bg-neutral-900 rounded-lg border border-neutral-800/60">
              <span className="text-neutral-400 block text-[10px]">IP Safety</span>
              <span className="font-mono text-neutral-200 font-medium">{validation.ipSafetyScore}%</span>
            </div>
            <div className="text-center p-2 bg-neutral-900 rounded-lg border border-neutral-800/60">
              <span className="text-neutral-400 block text-[10px]">AI Compliance</span>
              <span className="font-mono text-neutral-200 font-medium">{validation.aiComplianceScore}%</span>
            </div>
          </div>
        )}

        {/* Quality Warnings (Rule 15 & 19: GREEN / YELLOW / RED) */}
        <div className="space-y-2 pt-1 border-t border-neutral-800/70">
          {redFlags.map((w, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-200 text-xs space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-red-300 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>⚠ Potential Issue ({w.code.replace(/_/g, ' ')})</span>
                </div>
                {w.keyword && (
                  <button
                    onClick={() => handleRemoveKeywordByName(w.keyword!)}
                    className="text-[10px] px-2 py-0.5 rounded bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/60 transition-colors cursor-pointer"
                  >
                    Remove "{w.keyword}"
                  </button>
                )}
              </div>
              <p className="text-neutral-200 text-[11px]">
                <strong className="text-red-300">Issue:</strong> {w.message}
              </p>
              {w.recommendation && (
                <p className="text-neutral-300 text-[11px] bg-red-950/60 p-2 rounded border border-red-900/50">
                  <strong className="text-red-300">Recommendation:</strong> {w.recommendation}
                </p>
              )}
            </div>
          ))}

          {yellowFlags.map((w, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-yellow-950/30 border border-yellow-800/40 text-yellow-200 text-xs space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-yellow-300 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Review Recommended ({w.code.replace(/_/g, ' ')})</span>
                </div>
                {w.keyword && (
                  <button
                    onClick={() => handleRemoveKeywordByName(w.keyword!)}
                    className="text-[10px] px-2 py-0.5 rounded bg-yellow-900/60 hover:bg-yellow-800 text-yellow-200 border border-yellow-700/60 transition-colors cursor-pointer"
                  >
                    Remove "{w.keyword}"
                  </button>
                )}
              </div>
              <p className="text-neutral-200 text-[11px]">
                <strong className="text-yellow-300">Issue:</strong> {w.message}
              </p>
              {w.recommendation && (
                <p className="text-neutral-300 text-[11px] bg-yellow-950/50 p-2 rounded border border-yellow-900/50">
                  <strong className="text-yellow-300">Recommendation:</strong> {w.recommendation}
                </p>
              )}
            </div>
          ))}

          {redFlags.length === 0 && yellowFlags.length === 0 && greenFlags.length > 0 && (
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Metadata appears consistent with the analyzed asset and Adobe Stock guidelines.</span>
            </div>
          )}
        </div>
      </div>

      {/* 1. TITLE SECTION */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <label className="font-medium text-neutral-300">Title</label>
            <span className="text-[10px] text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40 font-mono">
              Formula: Subject + Action + Context
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 font-mono">
              {metadata.title.length} chars
            </span>
            <button
              onClick={() => handleCopy(metadata.title, 'title')}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'title' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
        <textarea
          rows={2}
          value={metadata.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g. 3D businessman running through airport terminal with briefcase to catch departing airplane"
          className="w-full bg-neutral-850 border border-neutral-800 focus:border-blue-500 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none leading-relaxed resize-none"
        />
        <p className="text-[11px] text-neutral-400 flex items-center gap-1">
          <Info className="w-3 h-3 shrink-0" />
          <span>Factual, natural, and concise. No clickbait or promotional hype.</span>
        </p>
      </div>

      {/* 2. DESCRIPTION SECTION */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <label className="font-medium text-neutral-300">Description</label>
            <span className="text-[10px] text-neutral-400 font-normal">1–2 concise natural sentences</span>
          </div>
          <button
            onClick={() => handleCopy(metadata.description, 'desc')}
            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            {copiedKey === 'desc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKey === 'desc' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <textarea
          rows={2}
          value={metadata.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Natural, non-promotional description explaining what, action, and context."
          className="w-full bg-neutral-850 border border-neutral-800 focus:border-blue-500 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none leading-relaxed resize-none"
        />
      </div>

      {/* 3. CATEGORY & AI DISCLOSURE ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-medium text-neutral-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Adobe Stock Category</span>
            </label>
            {metadata.categoryConfidence && (
              <span className="text-[10px] text-emerald-400 font-mono">
                {Math.round(metadata.categoryConfidence * 100)}% match
              </span>
            )}
          </div>
          <select
            value={metadata.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full bg-neutral-850 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {ADOBE_STOCK_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="font-medium text-neutral-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Generative AI Disclosure</span>
          </label>
          <div className="flex items-center justify-between p-2.5 bg-neutral-850 border border-neutral-800 rounded-xl">
            <div>
              <span className="text-[11px] text-neutral-200 block font-medium">Created using Generative AI</span>
              <span className="text-[10px] text-neutral-400 block">Adobe Stock requires disclosure</span>
            </div>
            <button
              type="button"
              onClick={() => handleAiToggle(!metadata.aiGenerated)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                metadata.aiGenerated ? 'bg-blue-600 justify-end' : 'bg-neutral-700 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. KEYWORDS ENGINE */}
      <div className="space-y-2.5 pt-2 border-t border-neutral-800">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-200">Keyword Engine</span>
            <span
              className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                metadata.keywords.length >= 20 && metadata.keywords.length <= 35
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {metadata.keywords.length} / 49 keywords
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Priority List vs Grouped */}
            <div className="flex items-center p-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px]">
              <button
                type="button"
                onClick={() => setKeywordViewMode('priority')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  keywordViewMode === 'priority'
                    ? 'bg-neutral-800 text-neutral-100 font-medium'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Priority Order
              </button>
              <button
                type="button"
                onClick={() => setKeywordViewMode('grouped')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  keywordViewMode === 'grouped'
                    ? 'bg-neutral-800 text-neutral-100 font-medium'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Grouped View
              </button>
            </div>

            <button
              onClick={() => handleCopy(metadata.keywords.join(', '), 'keywords')}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              {copiedKey === 'keywords' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'keywords' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Add keyword row */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newKeywordInput}
            onChange={(e) => setNewKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
            placeholder="Add new keyword or phrase (press Enter)..."
            className="flex-1 bg-neutral-850 border border-neutral-800 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none"
          />
          <button
            onClick={handleAddKeyword}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          <button
            onClick={handleAutoReRank}
            title="Auto-Rank by stock search intent"
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Auto-Rank</span>
          </button>
        </div>

        {keywordViewMode === 'priority' ? (
          <>
            {/* Priority Legend & Drag/Drop hint */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-400 pt-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>#1–#10 Essential Priority</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-neutral-600" />
                  <span>#11–#35 Supporting</span>
                </div>
              </div>
              <span className="text-neutral-400 italic">Drag & drop or use buttons to reorder</span>
            </div>

            {/* Ordered Keywords Grid with HTML5 Drag & Drop (Rule 22) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-72 overflow-y-auto p-1 border border-neutral-850 rounded-xl bg-neutral-900/40">
              {metadata.keywords.map((kw, index) => {
                const isEssential = index < 10;
                const isBeingDragged = draggedIndex === index;
                const isDragOver = dragOverIndex === index;

                return (
                  <div
                    key={`${kw}-${index}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-1.5 rounded-lg border text-xs transition-all group cursor-grab active:cursor-grabbing select-none ${
                      isDragOver
                        ? 'border-blue-400 bg-blue-900/30 scale-[1.02]'
                        : isBeingDragged
                        ? 'opacity-40 border-dashed border-neutral-600'
                        : isEssential
                        ? 'bg-blue-950/20 border-blue-900/40 text-blue-200'
                        : 'bg-neutral-850 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <GripVertical className="w-3 h-3 text-neutral-400 group-hover:text-neutral-400 shrink-0 cursor-grab" />
                      <span
                        className={`font-mono text-[10px] w-5 text-right shrink-0 ${
                          isEssential ? 'text-blue-400 font-semibold' : 'text-neutral-500'
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <span className="truncate" title={kw}>
                        {kw}
                      </span>
                    </div>

                    {/* Move & Delete Controls */}
                    <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleMoveKeyword(index, index - 1)}
                        disabled={index === 0}
                        title="Move up in priority"
                        className="p-1 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-500 cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveKeyword(index, index + 1)}
                        disabled={index === metadata.keywords.length - 1}
                        title="Move down in priority"
                        className="p-1 hover:text-white disabled:opacity-20 disabled:hover:text-neutral-500 cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveKeyword(index)}
                        title="Remove keyword"
                        className="p-1 text-neutral-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Grouped Categories View */
          <div className="space-y-2.5 max-h-72 overflow-y-auto p-2 border border-neutral-850 rounded-xl bg-neutral-900/40 text-xs">
            {Object.keys(groupedKeywords).length > 0 ? (
              Object.entries(groupedKeywords).map(([groupName, kws]) => (
                <div key={groupName} className="space-y-1">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3 text-blue-400" />
                    <span>{groupName}</span>
                    <span className="text-neutral-600 font-mono">({kws.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {kws.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-neutral-850 border border-neutral-800 text-neutral-200 text-[11px]"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-neutral-400 text-center py-4 text-xs">
                Run "Auto-Rank" or re-analyze to classify keywords into functional groups.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
