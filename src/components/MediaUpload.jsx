import { useState, useRef } from 'react';
import { uploadToCloudinary } from '../utils/cloudinary';
import toast from 'react-hot-toast';

export default function MediaUpload({ onUpload, folder = 'talksy', accept = 'image/*,video/*', children }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 50MB.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadToCloudinary(file, folder);
      onUpload(result);
      toast.success('Media uploaded successfully');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-surface-500">Uploading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    </div>
  );
}

export function MediaPreview({ url, type = 'image', className = '' }) {
  if (!url) return null;

  if (type === 'video' || url.match(/\.(mp4|mov|webm|avi)$/i)) {
    return (
      <video
        src={url}
        controls
        className={`rounded-xl max-w-full max-h-64 object-contain ${className}`}
        preload="metadata"
        playsInline
      />
    );
  }

  return (
    <img
      src={url}
      alt="Media"
      className={`rounded-xl max-w-full max-h-64 object-cover cursor-pointer ${className}`}
      loading="lazy"
      onClick={() => window.open(url, '_blank')}
    />
  );
}
