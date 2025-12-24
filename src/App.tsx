import { useState, useEffect, useMemo } from "react";
import { TeaForm } from "./components/TeaForm";
import { useTeaVarieties } from "./hooks/useTeaVarieties";
import { TeaVariety } from "./types/teaVariety";
import { TeaFilters } from "./components/filters/TeaFilters";
import { TeaGrowthChart } from "./components/charts/TeaGrowthChart";
import { exportToJson, importFromJson } from "./utils/fileHandlers";
import "./App.css";

function App() {
  const {
    teaVarieties,
    addTea,
    updateTea,
    deleteTea,
  } = useTeaVarieties();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTea, setEditingTea] = useState<TeaVariety | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    generation: "",
    year: "",
    search: "",
  });

  // フィルタリングされた品種を計算
  const filteredTeas = useMemo(() => {
    return teaVarieties.filter((tea) => {
      const matchesStatus = !filters.status || tea.status === filters.status;
      const matchesGeneration = !filters.generation || tea.generation === filters.generation;
      const matchesYear = !filters.year || tea.year.toString() === filters.year;
      const matchesSearch = !filters.search || 
        tea.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        tea.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        tea.aroma.toLowerCase().includes(filters.search.toLowerCase());

      return matchesStatus && matchesGeneration && matchesYear && matchesSearch;
    });
  }, [teaVarieties, filters]);

  // 年度の一覧を取得
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    teaVarieties.forEach((tea) => years.add(tea.year));
    return Array.from(years).sort((a, b) => b - a); // 新しい年度順にソート
  }, [teaVarieties]);

  const handleAddTea = () => {
    setEditingTea(null);
    setIsFormOpen(true);
  };

  const handleEditTea = (tea: TeaVariety) => {
    setEditingTea(tea);
    setIsFormOpen(true);
  };

  const handleSubmit = (tea: Omit<TeaVariety, "id">) => {
    if (editingTea) {
      updateTea(editingTea.id, tea);
    } else {
      addTea(tea);
    }
    setIsFormOpen(false);
  };

  const handleDeleteTea = (id: string) => {
    if (window.confirm("この品種を削除してもよろしいですか？")) {
      deleteTea(id);
    }
  };

  const handleExportData = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    exportToJson(teaVarieties, `tea-breed-log-${timestamp}`);
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedTeas = await importFromJson(file);
      if (window.confirm(`${importedTeas.length}件のデータをインポートします。よろしいですか？`)) {
        // 既存のデータをクリアしてインポート
        localStorage.setItem("teaVarieties", JSON.stringify(importedTeas));
        window.location.reload();
      }
    } catch (error) {
      alert(`インポートに失敗しました: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-tea-light">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-tea-dark">TeaBreed Log</h1>
          <p className="text-tea-brown">品種改良・育種試験記録システム</p>
        </header>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">品種一覧</h2>
          <div className="flex flex-wrap gap-2">
            <label className="px-4 py-2 bg-white border border-tea-dark text-tea-dark rounded hover:bg-gray-50 transition-colors cursor-pointer">
              データをインポート
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-tea-dark text-white rounded hover:bg-tea-brown transition-colors"
            >
              データをエクスポート
            </button>
            <button
              onClick={handleAddTea}
              className="px-4 py-2 bg-tea-dark text-white rounded hover:bg-tea-brown transition-colors"
            >
              新規追加
            </button>
          </div>
        </div>

        <TeaFilters
          filters={filters}
          onFilterChange={setFilters}
          years={availableYears}
        />

        {filteredTeas.length > 0 && (
          <TeaGrowthChart teas={filteredTeas} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeas.map((tea) => (
            <div
              key={tea.id}
              className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-white"
            >
              <div className="flex justify-between items-start">
                <h3 
                  className="font-bold text-lg hover:text-tea-dark"
                  onClick={() => handleEditTea(tea)}
                >
                  {tea.name}
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({tea.generation})
                  </span>
                </h3>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      tea.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tea.status === "active" ? "栽培中" : "終了"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTea(tea.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="削除"
                  >
                    ×
                  </button>
                </div>
              </div>
              <p 
                className="text-sm text-gray-600 mt-1 hover:text-tea-dark"
                onClick={() => handleEditTea(tea)}
              >
                {tea.location} - {tea.year}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{tea.germinationRate}%</div>
                  <div className="text-xs text-gray-500">発芽率</div>
                </div>
                <div className="text-center border-l border-r border-gray-200">
                  <div className="font-semibold">{tea.growthScore}/5</div>
                  <div className="text-xs text-gray-500">生育</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{tea.diseaseResistance}/5</div>
                  <div className="text-xs text-gray-500">耐病性</div>
                </div>
              </div>
            </div>
          ))}
          {filteredTeas.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              該当する品種が見つかりませんでした。
            </div>
          )}
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    {editingTea ? "品種を編集" : "新規品種を追加"}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    &times;
                  </button>
                </div>
                <TeaForm
                  initialData={editingTea || undefined}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsFormOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
