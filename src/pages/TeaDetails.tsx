import { useParams, useNavigate } from "react-router-dom";
import { useTeaVarieties } from "../hooks/useTeaVarieties";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const TeaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { teaVarieties, deleteTea } = useTeaVarieties();
  const { user } = useAuth();
  const navigate = useNavigate();

  const tea = teaVarieties.find((t) => t.id === id);

  if (!tea) {
    return (
      <div className="p-4 text-center text-gray-500">
        品種が見つかりませんでした
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm("この品種を削除してもよろしいですか？")) {
      await deleteTea(tea.id);
      navigate("/");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-tea-dark hover:text-tea-brown mb-4"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        一覧に戻る
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
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
    </div>
  );
};
