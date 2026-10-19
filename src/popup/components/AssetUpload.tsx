import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Image as ImageIcon, Video, AlertCircle, Sparkles } from 'lucide-react';
import { isSupportedFile, processAssetFile, SUPPORTED_EXTENSIONS } from '../../utils/fileHelpers';
import { AssetInput } from '../../types';

interface AssetUploadProps {
  onAssetSelected: (asset: AssetInput) => void;
  isLoading: boolean;
}

export const AssetUpload: React.FC<AssetUploadProps> = ({ onAssetSelected, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setErrorMessage(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
    // Reset input so re-selecting same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    const check = isSupportedFile(file);
    if (!check.supported) {
      setErrorMessage(check.reason || 'Unsupported file format.');
      return;
    }

    try {
      const asset = await processAssetFile(file);
      onAssetSelected(asset);
    } catch (err) {
      console.error('File parsing error:', err);
      setErrorMessage('Could not read this asset. Please try another image or video.');
    }
  };

  // Helper to load sample photographic/render asset
  const loadSampleAsset = async (sampleType: 'businessman' | 'cyberpunk') => {
    setErrorMessage(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (sampleType === 'businessman') {
        const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
        grad.addColorStop(0, '#0F172A');
        grad.addColorStop(0.5, '#1E3A8A');
        grad.addColorStop(1, '#0284C7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let i = 100; i < 1920; i += 280) {
          ctx.fillRect(i, 0, 40, 1080);
        }

        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, 700);
        ctx.lineTo(1920, 700);
        ctx.lineTo(1920, 1080);
        ctx.lineTo(0, 1080);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(960, 460, 45, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(930, 520);
        ctx.lineTo(990, 520);
        ctx.lineTo(975, 680);
        ctx.lineTo(945, 680);
        ctx.closePath();
        ctx.fill();

        ctx.lineWidth = 24;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(950, 680);
        ctx.lineTo(910, 800);
        ctx.lineTo(870, 840);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(970, 680);
        ctx.lineTo(1020, 790);
        ctx.lineTo(1060, 820);
        ctx.stroke();

        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(1030, 610, 55, 40);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(1400, 320);
        ctx.lineTo(1520, 310);
        ctx.lineTo(1490, 270);
        ctx.stroke();

        ctx.font = '600 32px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText('Sample Asset: 3D Businessman Running in Airport Terminal', 960, 980);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
        grad.addColorStop(0, '#1E1B4B');
        grad.addColorStop(0.6, '#4338CA');
        grad.addColorStop(1, '#EC4899');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);

        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.moveTo(0, 1080);
        ctx.lineTo(0, 650);
        ctx.lineTo(400, 480);
        ctx.lineTo(800, 720);
        ctx.lineTo(1200, 420);
        ctx.lineTo(1600, 620);
        ctx.lineTo(1920, 510);
        ctx.lineTo(1920, 1080);
        ctx.closePath();
        ctx.fill();

        ctx.font = '600 32px sans-serif';
        ctx.fillStyle = '#F8FAFC';
        ctx.textAlign = 'center';
        ctx.fillText('Sample Asset: Minimalist Mountain Sunset Landscape', 960, 980);
      }

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (!blob) return;

      const filename =
        sampleType === 'businessman' ? '3d-businessman-airport.jpg' : 'minimalist-mountain-sunset.jpg';
      const file = new File([blob], filename, { type: 'image/jpeg' });
      await handleFile(file);
    } catch (err) {
      console.error('Failed to create sample asset:', err);
    }
  };

  // Helper to dynamically record a sample 2.5s stock video footage clip (Airplane Takeoff B-Roll)
  const loadSampleVideoAsset = async () => {
    setErrorMessage(null);
    setIsGeneratingSample(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 960;
      canvas.height = 540;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsGeneratingSample(false);
        return;
      }

      const stream = canvas.captureStream(25);
      const mime = MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType: mime });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.start();

      let frame = 0;
      const totalFrames = 50; // ~2 seconds

      const renderInterval = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;

        // Sunset sky background
        const grad = ctx.createLinearGradient(0, 0, 960, 540);
        grad.addColorStop(0, '#1E1B4B');
        grad.addColorStop(0.5, '#4338CA');
        grad.addColorStop(1, '#F43F5E');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 960, 540);

        // Moving clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        ctx.arc(150 + progress * 240, 160, 80, 0, Math.PI * 2);
        ctx.arc(220 + progress * 240, 140, 100, 0, Math.PI * 2);
        ctx.arc(300 + progress * 240, 160, 70, 0, Math.PI * 2);
        ctx.fill();

        // Airport runway / skyline silhouette below
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 480, 960, 60);

        // Airplane climbing dynamically
        const planeX = 80 + progress * 780;
        const planeY = 380 - progress * 220;

        ctx.save();
        ctx.translate(planeX, planeY);
        ctx.rotate(-0.25); // ascending angle

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, 45, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = '#CBD5E1';
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-24, 25);
        ctx.lineTo(-12, 26);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-24, -25);
        ctx.lineTo(-12, -26);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // Label
        ctx.font = '600 20px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText(`Stock Video: Commercial Jet Takeoff B-Roll (${(progress * 2).toFixed(1)}s)`, 480, 520);

        if (frame >= totalFrames) {
          clearInterval(renderInterval);
          recorder.stop();
        }
      }, 40);

      recorder.onstop = async () => {
        setIsGeneratingSample(false);
        const videoBlob = new Blob(chunks, { type: mime });
        const videoFile = new File([videoBlob], 'commercial-airplane-takeoff.mp4', { type: mime });
        await handleFile(videoFile);
      };
    } catch (err) {
      console.error('Failed to create sample video:', err);
      setIsGeneratingSample(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={SUPPORTED_EXTENSIONS.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isLoading || isGeneratingSample}
      />

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && !isGeneratingSample && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
            : 'border-neutral-700 hover:border-neutral-500 bg-neutral-800/40 hover:bg-neutral-800/60'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-200">
              Drag & drop asset here, or <span className="text-blue-400 underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Supports JPG, PNG, WEBP, and MP4 / MOV (Up to 100MB)
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-neutral-400 mt-2">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
              <span>Stock Photos & AI Renders</span>
            </div>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <div className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-purple-400" />
              <span>Short Stock Footage (Multi-Frame)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <div>
            <p className="font-medium">Asset Selection Issue</p>
            <p className="text-red-300/90 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Quick Sample Selector */}
      <div className="pt-1 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Quick test samples:</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadSampleAsset('businessman');
            }}
            className="hover:text-blue-400 underline underline-offset-2 transition-colors cursor-pointer"
          >
            3D Businessman (Image)
          </button>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadSampleAsset('cyberpunk');
            }}
            className="hover:text-blue-400 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Mountain Sunset (Image)
          </button>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadSampleVideoAsset();
            }}
            disabled={isGeneratingSample}
            className="hover:text-purple-400 text-purple-300 font-medium underline underline-offset-2 transition-colors cursor-pointer"
          >
            {isGeneratingSample ? 'Preparing Video...' : 'Airplane Video Clip (2s)'}
          </button>
        </div>
      </div>
    </div>
  );
};
