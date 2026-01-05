import { useState, useEffect } from "react";
import { TeaVariety } from "../types/teaVariety";

interface TeaFormProps {
  initialData?: Partial<TeaVariety>;
  onSubmit: (tea: Omit<TeaVariety, "id">) => void;
  onCancel: () => void;
}

export const TeaForm = ({ initialData, onSubmit, onCancel }: TeaFormProps) => {
  const [formData, setFormData] = useState<Omit<TeaVariety, "id">>({
    name: "",
    generation: "F1",
    location: "",
    year: new Date().getFullYear(),
    germinationRate: 0,
    growthScore: 0,
    diseaseResistance: 0,
    aroma: "",
    note: "",
    status: "active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        generation: initialData.generation || "F1",
        location: initialData.location || "",
        year: initialData.year || new Date().getFullYear(),
        germinationRate: initialData.germinationRate || 0,
        growthScore: initialData.growthScore || 0,
        diseaseResistance: initialData.diseaseResistance || 0,
        aroma: initialData.aroma || "",
        note: initialData.note || "",
        status: initialData.status || "active",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.endsWith("Rate") || 
              name.endsWith("Score") || 
              name.endsWith("Resistance") ||
              name === "year"
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">品種名</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">世代</label>
          <select
            name="generation"
            value={formData.generation}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
            required
          >
            <option value="F1">F1</option>
            <option value="F2">F2</option>
            <option value="F3">F3</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">栽培地</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">年</label>
          <input
            type="number"
            name="year"
            min="2000"
            max="2100"
            value={formData.year}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            発芽率 (%)
          </label>
          <input
            type="number"
            name="germinationRate"
            min="0"
            max="100"
            value={formData.germinationRate}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            生育スコア (1-5)
          </label>
          <input
            type="number"
            name="growthScore"
            min="1"
            max="5"
            value={formData.growthScore}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            耐病性 (1-5)
          </label>
          <input
            type="number"
            name="diseaseResistance"
            min="1"
            max="5"
            value={formData.diseaseResistance}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">状態</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
          >
            <option value="active">栽培中</option>
            <option value="discarded">終了</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">香気特徴</label>
        <input
          type="text"
          name="aroma"
          value={formData.aroma}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
        <textarea
          name="note"
          rows={3}
          value={formData.note}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tea-dark"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-tea-dark hover:bg-tea-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tea-dark"
        >
          {initialData?.id ? "更新" : "追加"}
        </button>
      </div>
    </form>
  );
};
