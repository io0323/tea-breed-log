import { useState } from "react";
import { TeaVariety } from "./types/teaVariety";
import "./App.css";

// ダミーデータ
const teaVarieties: TeaVariety[] = [
  {
    id: "1",
    name: "やぶきた",
    generation: "F1",
    location: "静岡県牧之原市",
    year: 2023,
    germinationRate: 85,
    growthScore: 4,
    diseaseResistance: 3,
    aroma: "爽やかな緑茶の香り",
    note: "安定した生育を確認",
    status: "active",
  },
  {
    id: "2",
    name: "さやまかおり",
    generation: "F2",
    location: "鹿児島県南九州市",
    year: 2023,
    germinationRate: 92,
    growthScore: 5,
    diseaseResistance: 4,
    aroma: "甘い果実のような香り",
    note: "香気が特徴的",
    status: "active",
  },
  {
    id: "3",
    name: "おくみどり",
    generation: "F1",
    location: "宮崎県都城市",
    year: 2023,
    germinationRate: 78,
    growthScore: 3,
    diseaseResistance: 4,
    aroma: "深みのある緑茶の香り",
    note: "耐病性に優れる",
    status: "discarded",
  },
];

function App() {
  const [selectedTea, setSelectedTea] = useState<TeaVariety | null>(null);

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-tea-dark">TeaBreed Log</h1>
        <p className="text-tea-brown">品種改良・育種試験記録システム</p>
      </header>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">品種一覧</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teaVarieties.map((tea) => (
            <div 
              key={tea.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                tea.status === "active" 
                  ? "border-green-200 bg-green-50 hover:bg-green-100" 
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
              onClick={() => setSelectedTea(tea)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">
                  {tea.name} 
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({tea.generation})
                  </span>
                </h3>
                <span 
                  className={`px-2 py-1 text-xs rounded-full ${
                    tea.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {tea.status === "active" ? "栽培中" : "終了"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
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
        </div>
      </div>

      {selectedTea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedTea.name}
                    <span className="ml-2 text-base font-normal text-gray-600">
                      ({selectedTea.generation})
                    </span>
                  </h2>
                  <p className="text-gray-600">
                    {selectedTea.location} - {selectedTea.year}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTea(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800">発芽率</h3>
                  <div className="text-3xl font-bold mt-2">
                    {selectedTea.germinationRate}%
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800">生育スコア</h3>
                  <div className="text-3xl font-bold mt-2">
                    {selectedTea.growthScore}/5
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800">耐病性</h3>
                  <div className="text-3xl font-bold mt-2">
                    {selectedTea.diseaseResistance}/5
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">香気特徴</h3>
                <p className="text-gray-700">{selectedTea.aroma}</p>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">メモ</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedTea.note}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedTea(null)}
                  className="w-full bg-tea-dark text-white py-2 px-4 rounded-lg hover:bg-tea-brown transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
