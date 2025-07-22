
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

interface CircularCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  size?: number;
  originalFile: File;
}

export interface CircularCropperRef {
  getCurrentCrop: () => Promise<Blob | null>;
}

const CircularCropper = forwardRef<CircularCropperRef, CircularCropperProps>(
  ({ imageUrl, onCropComplete, size = 200, originalFile }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();

    // Определяем выходной формат
    const getOutputFormat = () => {
      const mimeType = originalFile.type.toLowerCase();
      console.log('Original file MIME type:', mimeType);
      
      if (mimeType.includes('png')) return { type: 'image/png', quality: 1 };
      if (mimeType.includes('webp')) return { type: 'image/webp', quality: 0.92 };
      if (mimeType.includes('gif')) return { type: 'image/png', quality: 1 };
      return { type: 'image/jpeg', quality: 0.92 };
    };

    useEffect(() => {
      if (isImageLoaded) {
        drawCanvas();
        // Debounced auto-crop
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
          createCrop().then(blob => {
            if (blob) {
              onCropComplete(blob);
            }
          });
        }, 300);
      }
    }, [isImageLoaded, cropPosition, scale]);

    const handleImageLoad = () => {
      console.log('Image loaded successfully');
      setIsImageLoaded(true);
      if (imageRef.current) {
        const img = imageRef.current;
        const containerSize = size;
        
        // Простая логика масштабирования
        const scaleToFit = Math.max(
          containerSize / img.naturalWidth,
          containerSize / img.naturalHeight
        );
        
        setScale(scaleToFit * 1.1); // Немного больше для покрытия круга
        
        // Центрируем изображение
        setCropPosition({
          x: (containerSize - img.naturalWidth * scaleToFit * 1.1) / 2,
          y: (containerSize - img.naturalHeight * scaleToFit * 1.1) / 2
        });
      }
    };

    const drawCanvas = () => {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      if (!canvas || !img) {
        console.log('Canvas or image not available for drawing');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.log('Cannot get canvas context');
        return;
      }

      try {
        // Очищаем canvas
        ctx.clearRect(0, 0, size, size);

        // Рисуем изображение
        ctx.save();
        ctx.drawImage(
          img,
          cropPosition.x,
          cropPosition.y,
          img.naturalWidth * scale,
          img.naturalHeight * scale
        );
        ctx.restore();

        // Добавляем затемнение вне круга
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, size, size);

        // Вырезаем круг
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        // Рисуем границу круга
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 10, 0, 2 * Math.PI);
        ctx.stroke();
      } catch (error) {
        console.error('Error drawing canvas:', error);
      }
    };

    const createCrop = async (): Promise<Blob | null> => {
      console.log('Creating crop...');
      
      return new Promise((resolve) => {
        try {
          const img = imageRef.current;
          
          if (!img) {
            console.error('Image not loaded');
            resolve(null);
            return;
          }

          // Создаем новый canvas для обрезки
          const cropCanvas = document.createElement('canvas');
          const ctx = cropCanvas.getContext('2d');
          
          if (!ctx) {
            console.error('Cannot create canvas context');
            resolve(null);
            return;
          }

          const cropSize = 300; // Фиксированный размер для аватара
          cropCanvas.width = cropSize;
          cropCanvas.height = cropSize;

          console.log('Crop canvas created:', cropSize, 'x', cropSize);

          // Создаем круглую маску
          ctx.save();
          ctx.beginPath();
          ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, 2 * Math.PI);
          ctx.clip();

          // Вычисляем параметры для обрезки
          const centerX = size / 2;
          const centerY = size / 2;
          const radius = cropSize / 2;

          // Рисуем обрезанное изображение
          const sourceX = (centerX - radius - cropPosition.x) / scale;
          const sourceY = (centerY - radius - cropPosition.y) / scale;
          const sourceWidth = cropSize / scale;
          const sourceHeight = cropSize / scale;

          console.log('Drawing cropped image with params:', {
            sourceX, sourceY, sourceWidth, sourceHeight,
            destX: 0, destY: 0, destWidth: cropSize, destHeight: cropSize
          });

          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            cropSize,
            cropSize
          );
          
          ctx.restore();

          const format = getOutputFormat();
          console.log('Converting to blob with format:', format);

          cropCanvas.toBlob((blob) => {
            if (blob) {
              console.log('Crop created successfully, size:', blob.size, 'bytes');
              resolve(blob);
            } else {
              console.error('Failed to create blob');
              resolve(null);
            }
          }, format.type, format.quality);

        } catch (error) {
          console.error('Error in createCrop:', error);
          resolve(null);
        }
      });
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getCurrentCrop: createCrop
    }));

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - crop

Position.x,
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

    const centerImage = () => {
      if (imageRef.current) {
        const img = imageRef.current;
        const containerSize = size;
        setCropPosition({
          x: (containerSize - img.naturalWidth * scale) / 2,
          y: (containerSize - img.naturalHeight * scale) / 2
        });
      }
    };

    return (
      <div className="relative">
        <img
          ref={imageRef}
          src={imageUrl}
          onLoad={handleImageLoad}
          onError={(e) => console.error('Image load error:', e)}
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

        <div className="mt-4 space-y-4">
          <div className="text-center">
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
            onClick={centerImage}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Центрировать
          </button>
        </div>
      </div>
    );
  }
);

CircularCropper.displayName = 'CircularCropper';

export default CircularCropper;
