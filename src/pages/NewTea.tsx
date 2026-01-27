import { useNavigate } from "react-router-dom";
import { TeaForm } from "../components/TeaForm";
import { useTeaVarieties } from "../hooks/useTeaVarieties";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useCallback, memo } from "react";
import { TeaVariety } from "../types/teaVariety";

export const NewTea = memo(() => {
  const { addTea } = useTeaVarieties();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (newTea: Omit<TeaVariety, "id">) => {
    const result = await addTea(newTea);
    navigate(`/teas/${result.id}`);
  }, [addTea, navigate]);

  const handleCancel = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button
        onClick={handleBack}
        className="flex items-center text-tea-dark hover:text-tea-brown mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        キャンセル
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">新規品種を追加</h1>
        <TeaForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
});

NewTea.displayName = 'NewTea';
