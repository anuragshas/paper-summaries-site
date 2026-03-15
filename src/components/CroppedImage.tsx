import React, { useEffect, useRef, useState } from 'react';

interface CroppedImageProps {
  base64Image: string;
  boundingBox: { ymin: number; xmin: number; ymax: number; xmax: number };
  alt: string;
  className?: string;
  onClick?: (src: string) => void;
}

export function CroppedImage({ base64Image, boundingBox, alt, className, onClick }: CroppedImageProps) {
  const [src, setSrc] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTokenRef = useRef(0);

  useEffect(() => {
    const token = ++renderTokenRef.current;
    if (!base64Image || !boundingBox) {
      setSrc('');
      return;
    }

    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (renderTokenRef.current !== token) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (!boundingBox || typeof boundingBox !== 'object' || !('ymin' in boundingBox)) {
        setSrc('');
        return;
      }
      const sx = Math.max(0, (Number(boundingBox.xmin) / 1000) * img.width);
      const sy = Math.max(0, (Number(boundingBox.ymin) / 1000) * img.height);
      const sWidth = Math.max(0, ((Number(boundingBox.xmax) - Number(boundingBox.xmin)) / 1000) * img.width);
      const sHeight = Math.max(0, ((Number(boundingBox.ymax) - Number(boundingBox.ymin)) / 1000) * img.height);
      if (sWidth < 2 || sHeight < 2) {
        setSrc('');
        return;
      }
      const marginX = Math.min(Math.max(4, sWidth * 0.05), img.width * 0.025);
      const marginY = Math.min(Math.max(4, sHeight * 0.05), img.height * 0.025);
      const finalSx = Math.max(0, sx - marginX);
      const finalSy = Math.max(0, sy - marginY);
      const finalSWidth = Math.max(1, Math.min(img.width - finalSx, sWidth + marginX * 2));
      const finalSHeight = Math.max(1, Math.min(img.height - finalSy, sHeight + marginY * 2));
      canvas.width = Math.round(finalSWidth);
      canvas.height = Math.round(finalSHeight);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, finalSx, finalSy, finalSWidth, finalSHeight, 0, 0, finalSWidth, finalSHeight);
      setSrc(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      if (renderTokenRef.current !== token) return;
      setSrc('');
    };
    img.src = `data:image/jpeg;base64,${base64Image}`;

    return () => {
      if (renderTokenRef.current === token) {
        renderTokenRef.current += 1;
      }
    };
  }, [base64Image, boundingBox]);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {src ? <img src={src} alt={alt} className={className} onClick={() => onClick && onClick(src)} /> : <div className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className}`}>Loading figure...</div>}
    </>
  );
}
