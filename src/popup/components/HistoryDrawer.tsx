import React from 'react';
import { X, Clock, Trash2, Image as ImageIcon, Film, Download, Layers } from 'lucide-react';
import { HistoryItem } from '../../types';
import { formatBytes } from '../../utils/fileHelpers';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  const handleBatchExportCSV = () => {
    if (history.length === 0) return;

    const headers = 'filename,title,description,keywords,category,aiGenerated';
    const rows = history
      .filter((h) => h.metadata)
      .map((h) => {
        const m = h.metadata!;
        const safeTitle = `"${(m.title || '').replace(/"/g, '""')}"`;
        const safeDesc = `"${(m.description || '').replace(/"/g, '""')}"`;
        const safeKeywords = `"${(m.keywords || []).join(', ').replace(/"/g, '""')}"`;
        return `${h.filename},${safeTitle},${safeDesc},${safeKeywords},${m.category || ''},${m.aiGenerated ? 'yes' : 'no'}`;
      });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adobe_stock_history_batch_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm h-full bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">Recent Assets</h2>
              <p className="text-[10px] text-neutral-400">Stored locally in Chrome Storage</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleBatchExportCSV}
                  title="Export all recent assets to CSV"
                  className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[11px]">CSV</span>
                </button>
                <button
                  onClick={onClearHistory}
                  title="Clear All History"
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-500 text-xs">
              <Clock className="w-8 h-8 stroke-[1.5] text-neutral-600 mb-2" />
              <p className="font-medium text-neutral-400">No recent assets yet</p>
              <p className="text-[11px] mt-1 max-w-[200px]">
                Analyzed stock assets and generated metadata will appear here for fast re-access and batch export.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="p-3 rounded-xl bg-neutral-850 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer group flex items-start gap-3 relative"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.previewThumbnail ? (
                    <img src={item.previewThumbnail} alt="" className="w-full h-full object-cover" />
                  ) : item.mediaType === 'video' ? (
                    <Film className="w-5 h-5 text-purple-400" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-blue-400" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 pr-6">
                  <p className="text-xs font-semibold text-neutral-200 truncate group-hover:text-blue-400 transition-colors">
                    {item.filename}
                  </p>
                  
                  {item.metadata?.title && (
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {item.metadata.title}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1 flex-wrap">
                    <span>{formatDate(item.timestamp)}</span>
                    <span aria-hidden="true" className="text-neutral-700">·</span>
                    <span>{formatBytes(item.fileSize)}</span>
                    {item.metadata?.category && (
                      <>
                        <span aria-hidden="true" className="text-neutral-700">·</span>
                        <span className="flex items-center gap-0.5 text-neutral-300">
                          <Layers className="w-2.5 h-2.5 text-blue-400" />
                          <span>{item.metadata.category}</span>
                        </span>
                      </>
                    )}
                    {item.validation?.overallScore !== undefined && (
                      <span
                        className={`font-mono px-1.5 py-0.2 rounded font-semibold ${
                          item.validation.overallScore >= 85
                            ? 'bg-emerald-950/80 text-emerald-400'
                            : item.validation.overallScore >= 70
                            ? 'bg-yellow-950/80 text-yellow-400'
                            : 'bg-red-950/80 text-red-400'
                        }`}
                      >
                        {item.validation.overallScore}/100
                      </span>
                    )}
                  </div>
                </div>

                {/* Single Delete button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistoryItem(item.id);
                  }}
                  title="Remove from history"
                  className="absolute top-2.5 right-2.5 p-1 text-neutral-500 hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
