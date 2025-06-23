
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  value?: string;
  onChange: (photo: string | null) => void;
  placeholder?: string;
  cameraOnly?: boolean;
  className?: string;
}

const PhotoUpload = ({ value, onChange, placeholder = "Загрузить фото", cameraOnly = false, className }: PhotoUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    // Simulate file upload
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {value ? (
        <div className="relative">
          <img 
            src={value} 
            alt="Uploaded photo" 
            className="w-full h-48 object-cover rounded-2xl border-2 border-slate-200"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <p className="text-slate-600">{placeholder}</p>
            <div className="flex gap-3 justify-center">
              <Button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isLoading}
                className="bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-xl"
              >
                <Camera className="h-4 w-4 mr-2" />
                Камера
              </Button>
              {!cameraOnly && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Галерея
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileSelect}
      />
      
      {!cameraOnly && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      )}
    </div>
  );
};

export default PhotoUpload;
