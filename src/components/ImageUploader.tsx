import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploaderProps {
  teaId: string;
  onUploadComplete: (imageUrl: string) => void;
  onError: (error: string) => void;
}

export const ImageUploader = ({ teaId, onUploadComplete, onError }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // プレビュー用のURLを生成
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      try {
        setIsUploading(true);
        
        // 一意のファイル名を生成
        const fileExt = file.name.split('.').pop();
        const fileName = `${teaId}/${uuidv4()}.${fileExt}`;
        
        // Supabase Storageにアップロード
        const { error: uploadError } = await supabase.storage
          .from('tea-images')
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        // アップロードが完了したら公開URLを取得
        const { data: { publicUrl } } = supabase.storage
          .from('tea-images')
          .getPublicUrl(fileName);

        onUploadComplete(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        onError(error instanceof Error ? error.message : '画像のアップロードに失敗しました');
      } finally {
        setIsUploading(false);
        setPreview(null);
      }
    },
    [teaId, onUploadComplete, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div className="mt-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-tea-dark bg-teal-50' : 'border-gray-300 hover:border-tea-dark'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <p className="text-gray-600">アップロード中...</p>
        ) : isDragActive ? (
          <p className="text-tea-dark font-medium">ここに画像をドロップ</p>
        ) : (
          <p className="text-gray-600">
            画像をドラッグ&ドロップ、またはクリックして選択
          </p>
        )}
      </div>
      
      {preview && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">プレビュー</h4>
          <div className="relative w-40 h-40 border rounded-md overflow-hidden">
            <img
              src={preview}
              alt="プレビュー"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};
