import { useParams, useNavigate } from "react-router-dom";
import { useTeaVarieties } from "../hooks/useTeaVarieties";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeftIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useState, useCallback, memo } from "react";
import { ImageUploader } from "../components/ImageUploader";
import { TeaImageGallery } from "../components/TeaImageGallery";

export const TeaDetails = memo(() => {
  const { id } = useParams<{ id: string }>();
  const { 
    deleteTea, 
    addTeaImage, 
    removeTeaImage,
    getTeaById 
  } = useTeaVarieties();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const tea = getTeaById(id || '');

  if (!tea) {
    return (
      <div className="p-4 text-center text-gray-500">
        品種が見つかりませんでした
      </div>
    );
  }

  const handleDelete = useCallback(async () => {
    if (!tea || !window.confirm("この品種を削除してもよろしいですか？")) {
      return;
    }
    await deleteTea(tea.id);
    navigate("/");
  }, [tea, deleteTea, navigate]);

  const handleImageUpload = useCallback(async (imageUrl: string) => {
    if (!id || !tea) return;
    setUploadError(null);
    try {
      await addTeaImage(id, imageUrl);
    } catch (error) {
      setUploadError("画像のアップロードに失敗しました");
      console.error('Image upload error:', error);
    }
  }, [id, tea, addTeaImage]);

  const handleImageDelete = useCallback((imageUrl: string) => {
    if (!id || !tea) return;
    setUploadError(null);
    try {
      removeTeaImage(id, imageUrl);
    } catch (error) {
      setUploadError("画像の削除に失敗しました");
      console.error('Image delete error:', error);
    }
  }, [id, tea, removeTeaImage]);

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-tea-dark hover:text-tea-brown mb-4"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        一覧に戻る
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {tea.name} <span className="text-gray-500">({tea.generation})</span>
            </h1>
            {user && (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/teas/${tea.id}/edit`)}
                  className="px-3 py-1 text-sm bg-tea-dark text-white rounded hover:bg-tea-brown"
                >
                  編集
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  削除
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            {tea.location} - {tea.year}年
          </p>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">基本情報</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">状態</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {tea.status === "active" ? "栽培中" : "終了"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">発芽率</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {tea.germinationRate}%
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">生育スコア</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {tea.growthScore}/5
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">耐病性</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {tea.diseaseResistance}/5
                  </dd>
                </div>
              </dl>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">香気特徴</h3>
                <p className="text-gray-700">{tea.aroma || "未記入"}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">メモ</h3>
                <p className="whitespace-pre-line text-gray-700">
                  {tea.note || "メモはありません"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 画像アップロードセクション */}
      {user && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <PhotoIcon className="h-5 w-5 mr-2 text-tea-dark" />
            画像を追加
          </h2>
          <ImageUploader 
            teaId={tea.id}
            onUploadComplete={handleImageUpload}
            onError={setUploadError}
            onClearError={clearUploadError}
          />
          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          )}
        </div>
      )}

      {/* 画像ギャラリー */}
      <div className="bg-white rounded-lg shadow p-6">
        <TeaImageGallery 
          images={tea.images || []} 
          teaId={tea.id}
          onImageDelete={handleImageDelete}
          isOwner={!!user}
        />
      </div>
    </div>
  );
});

TeaDetails.displayName = 'TeaDetails';
