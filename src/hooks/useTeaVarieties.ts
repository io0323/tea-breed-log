import { useState, useEffect } from "react";
import { TeaVariety } from "../types/teaVariety";

const STORAGE_KEY = "teaVarieties";

// 初期データに images プロパティを追加
const initialTeaVarieties: TeaVariety[] = [
  {
    id: '1',
    name: 'やぶきた',
    generation: 'F1',
    location: '静岡県',
    year: 2023,
    germinationRate: 85,
    growthScore: 4,
    diseaseResistance: 4,
    aroma: '爽やかで上品な香り',
    note: '生育が良く、収量も安定している',
    status: 'active',
    images: []
  },
  {
    id: '2',
    name: 'さやまかおり',
    generation: 'F2',
    location: '鹿児島県',
    year: 2023,
    germinationRate: 78,
    growthScore: 5,
    diseaseResistance: 3,
    aroma: '甘くフルーティーな香り',
    note: '香りが特徴的で高評価',
    status: 'active',
    images: []
  },
  {
    id: '3',
    name: 'ゆたかみどり',
    generation: 'F1',
    location: '宮崎県',
    year: 2022,
    germinationRate: 92,
    growthScore: 4,
    diseaseResistance: 5,
    aroma: 'まろやかで深みのある香り',
    note: '耐病性が高く栽培しやすい',
    status: 'active',
    images: []
  }
];

export const useTeaVarieties = () => {
  const [teaVarieties, setTeaVarieties] = useState<TeaVariety[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialTeaVarieties;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teaVarieties));
  }, [teaVarieties]);

  const addTea = (tea: Omit<TeaVariety, "id">) => {
    const newTea: TeaVariety = {
      ...tea,
      id: Date.now().toString(),
      images: [], // 新しい品種には空の画像配列を追加
    };
    setTeaVarieties([...teaVarieties, newTea]);
    return newTea;
  };

  const updateTea = (id: string, updatedTea: Partial<TeaVariety>) => {
    setTeaVarieties(
      teaVarieties.map((tea) =>
        tea.id === id ? { ...tea, ...updatedTea } : tea
      )
    );
  };

  const deleteTea = (id: string) => {
    setTeaVarieties(teaVarieties.filter((tea) => tea.id !== id));
  };

  const addTeaImage = (teaId: string, imageUrl: string) => {
    setTeaVarieties(
      teaVarieties.map((tea) =>
        tea.id === teaId
          ? { ...tea, images: [...(tea.images || []), imageUrl] }
          : tea
      )
    );
  };

  const removeTeaImage = (teaId: string, imageUrl: string) => {
    setTeaVarieties(
      teaVarieties.map((tea) =>
        tea.id === teaId
          ? {
              ...tea,
              images: (tea.images || []).filter((img) => img !== imageUrl),
            }
          : tea
      )
    );
  };

  const getTeaById = (id: string) => {
    return teaVarieties.find((tea) => tea.id === id);
  };

  return {
    teaVarieties,
    addTea,
    updateTea,
    deleteTea,
    getTeaById,
    addTeaImage,
    removeTeaImage,
  };
};
