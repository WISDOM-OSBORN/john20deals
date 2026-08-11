import React from 'react';
import { Camera, Upload } from 'lucide-react';

interface ImageUploadButtonsProps {
  onFile: (file: File) => void;
  disabled?: boolean;
  compact?: boolean;
}

/**
 * Two photo sources for mobile-friendly image uploads:
 * "Take Photo" opens the device camera (capture="environment"),
 * "Upload" opens the gallery/file picker. Both drive onFile(file).
 */
export default function ImageUploadButtons({ onFile, disabled, compact }: ImageUploadButtonsProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  };

  const base = compact
    ? 'w-full py-2.5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors'
    : 'w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-bold cursor-pointer transition-colors';

  const disabledCls = disabled ? 'opacity-50 pointer-events-none' : '';

  return (
    <div className="grid grid-cols-2 gap-3">
      <label className={`${base} border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 ${disabledCls}`}>
        <Camera className="w-4 h-4" />
        Take Photo
        <input type="file" accept="image/*" capture="environment" onChange={handleChange} disabled={disabled} className="hidden" />
      </label>
      <label className={`${base} border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 ${disabledCls}`}>
        <Upload className="w-4 h-4" />
        Upload
        <input type="file" accept="image/*" onChange={handleChange} disabled={disabled} className="hidden" />
      </label>
    </div>
  );
}