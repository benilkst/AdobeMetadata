import { AssetInput, MediaType } from '../types';

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

export const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov'];

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function calculateAspectRatio(width: number, height: number): string {
  if (!width || !height) return '';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const ratioW = width / divisor;
  const ratioH = height / divisor;

  // Approximate to standard photographic / screen ratios
  const decimal = width / height;
  if (Math.abs(decimal - 1.777) < 0.05) return '16:9';
  if (Math.abs(decimal - 0.5625) < 0.05) return '9:16';
  if (Math.abs(decimal - 1.333) < 0.05) return '4:3';
  if (Math.abs(decimal - 0.75) < 0.05) return '3:4';
  if (Math.abs(decimal - 1.5) < 0.05) return '3:2';
  if (Math.abs(decimal - 0.667) < 0.05) return '2:3';
  if (Math.abs(decimal - 1.0) < 0.05) return '1:1';

  return `${ratioW}:${ratioH}`;
}

export function isSupportedFile(file: File): { supported: boolean; reason?: string } {
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
  const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);

  // Check extension fallback if mime type is missing or generic
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  const isExtensionSupported = SUPPORTED_EXTENSIONS.includes(extension);

  if (!isImage && !isVideo && !isExtensionSupported) {
    return {
      supported: false,
      reason: `Unsupported format (${file.type || extension}). Please select JPG, PNG, WEBP, or MP4.`,
    };
  }

  // 100MB limit for browser-based processing
  const MAX_SIZE = 100 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      supported: false,
      reason: `File size exceeds 100MB limit (${formatBytes(file.size)}).`,
    };
  }

  return { supported: true };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export async function processAssetFile(file: File): Promise<AssetInput> {
  const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');
  const mediaType: MediaType = isVideo ? 'video' : 'image';
  const previewUrl = URL.createObjectURL(file);

  if (mediaType === 'image') {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const aspectRatio = calculateAspectRatio(width, height);
        resolve({
          file,
          name: file.name,
          type: file.type || 'image/jpeg',
          size: file.size,
          previewUrl,
          mediaType: 'image',
          width,
          height,
          aspectRatio,
        });
      };
      img.onerror = () => {
        resolve({
          file,
          name: file.name,
          type: file.type || 'image/jpeg',
          size: file.size,
          previewUrl,
          mediaType: 'image',
        });
      };
      img.src = previewUrl;
    });
  } else {
    // Video dimension and duration inspection
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const width = video.videoWidth;
        const height = video.videoHeight;
        const duration = video.duration;
        const aspectRatio = calculateAspectRatio(width, height);
        resolve({
          file,
          name: file.name,
          type: file.type || 'video/mp4',
          size: file.size,
          previewUrl,
          mediaType: 'video',
          width,
          height,
          duration,
          aspectRatio,
        });
      };
      video.onerror = () => {
        resolve({
          file,
          name: file.name,
          type: file.type || 'video/mp4',
          size: file.size,
          previewUrl,
          mediaType: 'video',
        });
      };
      video.src = previewUrl;
    });
  }
}

/**
 * Downscales and optimizes high-resolution or heavy images (like 12MB PNGs)
 * before sending to Gemini API. This drastically reduces token count, speeds up
 * network transfer, and prevents RESOURCE_EXHAUSTED / 429 rate limit errors.
 */
export async function getOptimizedImageBase64(
  file: File,
  maxDimension = 1536,
  quality = 0.85
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || !file.type.startsWith('image/')) {
      fileToBase64(file)
        .then((b64) => {
          const clean = b64.replace(/^data:[^;]+;base64,/, '');
          resolve({ base64: clean, mimeType: file.type || 'image/jpeg' });
        })
        .catch(() => {
          resolve({ base64: '', mimeType: 'image/jpeg' });
        });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Downscale if either dimension exceeds maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        fileToBase64(file).then((b64) => {
          const clean = b64.replace(/^data:[^;]+;base64,/, '');
          resolve({ base64: clean, mimeType: file.type || 'image/jpeg' });
        });
        return;
      }

      // Draw white background for transparent PNGs
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to high-quality compressed JPEG (vastly smaller payload, perfect for vision AI)
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const cleanBase64 = dataUrl.replace(/^data:[^;]+;base64,/, '');
      resolve({ base64: cleanBase64, mimeType: 'image/jpeg' });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      fileToBase64(file)
        .then((b64) => {
          const clean = b64.replace(/^data:[^;]+;base64,/, '');
          resolve({ base64: clean, mimeType: file.type || 'image/jpeg' });
        })
        .catch(() => {
          resolve({ base64: '', mimeType: 'image/jpeg' });
        });
    };

    img.src = objectUrl;
  });
}
