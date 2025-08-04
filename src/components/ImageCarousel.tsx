import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface ImageCarouselProps {
  images: string[];
  title: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageError = (index: number) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a storage path, get the public URL
    const { data } = supabase.storage
      .from('asset-images')
      .getPublicUrl(imagePath);
    
    return data.publicUrl;
  };

  if (images.length === 0) {
    return (
      <div className="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <div className="text-center text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  const currentImagePath = images[currentIndex];
  const currentImageUrl = getImageUrl(currentImagePath);
  const hasError = imageError[currentIndex];

  return (
    <div className="h-64 bg-gray-200 relative group overflow-hidden">
      {hasError || !currentImageUrl ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      ) : (
        <img 
          src={currentImageUrl}
          alt={`${title} - ${currentIndex + 1}`} 
          className="w-full h-full object-cover"
          onError={() => handleImageError(currentIndex)}
          loading="lazy"
        />
      )}
      
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={prevImage}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={nextImage}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;