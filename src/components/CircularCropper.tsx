
import React, { useState, useRef, useEffect } from 'react';

interface CircularCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  size?: number;
}

const CircularCropper = ({ imageUrl, onCropComplete, size = 200 }: CircularCropperProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isImageLoaded) {
      drawCanvas();
      // Автоматически создаем первичную обрезку при загрузке
      setTimeout(() => {
        getCroppedImage();
      }, 100);
    }
  }, [isImageLoaded, cropPosition, scale]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    if (imageRef.current) {
      const img = imageRef.current;
      const containerSize = size;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      
      let newScale;
      if (imgAspect > 1) {
        // Landscape image
        newScale = containerSize / img.naturalHeight;
      } else {
        // Portrait or square image
        newScale = containerSize / img.naturalWidth;
      }
      
      setScale(newScale);
      setCropPosition({
        x: (containerSize - img.naturalWidth * newScale) / 2,
        y: (containerSize - img.naturalHeight * newScale) / 2
      });
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw image
    ctx.save();
    ctx.drawImage(
      img,
      cropPosition.x,
      cropPosition.y,
      img.naturalWidth * scale,
      img.naturalHeight * scale
    );
    ctx.restore();

    // Draw overlay (darkened area outside circle)
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, size, size);

    // Cut out circle
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // Draw circle border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 10, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropPosition.x,
      y: e.clientY - cropPosition.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setCropPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - cropPosition.x,
      y: touch.clientY - cropPosition.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    setCropPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const getCroppedImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!ctx || !img) {
      console.error('Ошибка: не удалось получить контекст canvas или изображение');
      return;
    }

    const cropSize = size - 20; // Account for border
    canvas.width = cropSize;
    canvas.height = cropSize;

    // Calculate the crop area
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = cropSize / 2;

    try {
      // Create circular mask
      ctx.save();
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
      ctx.clip();

      // Draw the cropped image
      const sourceX = centerX - radius - cropPosition.x;
      const sourceY = centerY - radius - cropPosition.y;
      
      ctx.drawImage(
        img,
        sourceX / scale,
        sourceY / scale,
        (cropSize * 2) / scale,
        (cropSize * 2) / scale,
        0,
        0,
        cropSize,
        cropSize
      );
      
      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
        } else {
          console.error('Ошибка: не удалось создать blob из canvas');
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Ошибка при обработке изображения:', error);
    }
  };

  return (
    <div className="relative">
      <img
        ref={imageRef}
        src={imageUrl}
        onLoad={handleImageLoad}
        className="hidden"
        alt="Source"
      />
      
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="border border-gray-200 rounded-full cursor-move touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      <div className="mt-4 text-center">
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="w-full max-w-xs"
        />
        <p className="text-sm text-gray-600 mt-2">
          Перетащите для позиционирования, используйте ползунок для масштабирования
        </p>
      </div>

      <button
        onClick={getCroppedImage}
        className="mt-4 w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700"
      >
        Обрезать фото
      </button>
    </div>
  );
};

export default CircularCropper;
