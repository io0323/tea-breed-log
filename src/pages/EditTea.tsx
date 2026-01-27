import { useCallback, memo, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTeaVarieties } from "../../hooks/useTeaVarieties";
import { TeaForm } from "../../components/TeaForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { TeaVariety } from "../../types/teaVariety";

export const EditTea = memo(() => {
  const { id } = useParams<{ id: string }>();
  const { teaVarieties, updateTea } = useTeaVarieties();
  const navigate = useNavigate();

  const tea = useMemo(() => teaVarieties.find((t) => t.id === id), [teaVarieties, id]);

  const handleSubmit = useCallback(async (updatedTea: Omit<TeaVariety, "id">) => {
    if (!id) return;
    await updateTea(id, updatedTea);
    navigate(`/teas/${id}`);
  }, [id, updateTea, navigate]);

  const handleCancel = useCallback(() => {
    if (!id) return;
    navigate(`/teas/${id}`);
  }, [id, navigate]);

  if (!tea) {
    return (
      <div className="p-4 text-center text-gray-500">
        品種が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-tea-dark hover:text-tea-brown mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        キャンセル
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">品種を編集</h1>
        <TeaForm
          initialData={tea}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
});

EditTea.displayName = 'EditTea';
