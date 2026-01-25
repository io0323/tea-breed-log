import { useState, useCallback, memo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';
import { LazyImage } from './LazyImage';

interface TeaImageGalleryProps {
  images: string[];
  teaId: string;
  onImageDelete: (imageUrl: string) => void | Promise<void>;
  isOwner: boolean;
}

// 画像遅延読み込みコンポーネントはLazyImage.tsxに移動

export const TeaImageGallery = memo(({ images, teaId, onImageDelete, isOwner }: TeaImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageCache, setImageCache] = useState<Map<string, string>>(new Map());

  // 画像URLの最適化（サムネイル生成）
  const getOptimizedImageUrl = useCallback((url: string, size: 'small' | 'medium' | 'large' = 'medium') => {
    // Supabase Storage の画像変換機能を使用
    if (url.includes('supabase')) {
      const transformations = {
        small: 'width=200,height=200,quality=60',
        medium: 'width=400,height=400,quality=75',
        large: 'width=800,height=800,quality=85'
      };
      return `${url}?${transformations[size]}`;
    }
    return url;
  }, []);

  // 画像キャッシュ管理
  const getCachedImage = useCallback((url: string) => {
    return imageCache.get(url) || getOptimizedImageUrl(url, 'small');
  }, [imageCache, getOptimizedImageUrl]);

  if (images.length === 0) {
    return (
      <div className="mt-4 text-center text-gray-500">
        画像がアップロードされていません
      </div>
    );
  }

  const handleDelete = useCallback(async (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm('この画像を削除してもよろしいですか？')) {
      return;
    }

    try {
      // URLからファイル名を抽出
      const fileName = imageUrl.split('/').pop();
      if (!fileName) return;

      // Supabase Storageから画像を削除
      const { error } = await supabase.storage
        .from('tea-images')
        .remove([`${teaId}/${fileName}`]);

      if (error) throw error;

      // 親コンポーネントに削除を通知
      await Promise.resolve(onImageDelete(imageUrl));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('画像の削除に失敗しました');
    }
  }, [teaId, onImageDelete]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">画像ギャラリー</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((imageUrl, index) => (
          <div 
            key={index} 
            className="relative group cursor-pointer"
            onClick={() => setSelectedImage(imageUrl)}
          >
            <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
              <LazyImage
                src={getCachedImage(imageUrl)}
                alt={`品種画像 ${index + 1}`}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            </div>
            
            {isOwner && (
              <button
                type="button"
                onClick={(e) => handleDelete(imageUrl, e)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="画像を削除"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* モーダルで画像を拡大表示 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            <LazyImage
              src={getOptimizedImageUrl(selectedImage, 'large')}
              alt="拡大表示"
              className="max-w-full max-h-[80vh] mx-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
});
