import { ExtractedFrame } from '../types';

export async function extractVideoFrame(videoUrl: string, atTimeSeconds = 0): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.src = videoUrl;

    const timeout = setTimeout(() => {
      reject(new Error('Video frame seek timed out'));
    }, 8000);

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(atTimeSeconds, Math.max(0, video.duration - 0.1));
    };

    video.onseeked = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(1280, video.videoWidth || 960);
        canvas.height = Math.min(720, video.videoHeight || 540);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load video for frame extraction'));
    };
  });
}

/**
 * Extracts representative frames across the video timeline (e.g. 0%, 25%, 50%, 75%, 100%)
 * avoiding duplicate frames per Section 7 & 30.
 */
export async function extractRepresentativeFrames(
  videoUrl: string,
  durationSeconds: number,
  targetCount = 5
): Promise<ExtractedFrame[]> {
  const duration = Math.max(1, durationSeconds);
  const percentages = targetCount === 5 ? [0.05, 0.25, 0.5, 0.75, 0.95] : [0.1, 0.5, 0.9];
  const frames: ExtractedFrame[] = [];

  for (const pct of percentages) {
    const atTime = Math.min(duration * pct, duration - 0.1);
    try {
      const dataUrl = await extractVideoFrame(videoUrl, atTime);
      frames.push({
        timestamp: parseFloat(atTime.toFixed(1)),
        percentage: Math.round(pct * 100),
        dataUrl,
      });
    } catch (err) {
      console.warn(`Could not extract frame at ${pct * 100}%:`, err);
    }
  }

  // Ensure at least one frame is extracted
  if (frames.length === 0) {
    try {
      const fallback = await extractVideoFrame(videoUrl, 0);
      frames.push({
        timestamp: 0,
        percentage: 0,
        dataUrl: fallback,
      });
    } catch (err) {
      console.error('All frame extraction attempts failed:', err);
    }
  }

  return frames;
}
