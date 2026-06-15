'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  productId: number;
  onUploaded: (paths: string[]) => void;
}

export default function ImageUpload({ productId, onUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    // Preview
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('images', f));

    const res = await fetch(`/api/products/${productId}/images`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      onUploaded(urls);
    }

    setUploading(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {previews.map((url, i) => (
          <div key={i} className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
            <img src={url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-400 transition"
        >
          <span className="text-2xl">+</span>
          <span className="text-xs">{uploading ? '上传中...' : '添加图片'}</span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
    </div>
  );
}
