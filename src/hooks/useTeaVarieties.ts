import { useState, useEffect } from "react";
import { TeaVariety } from "../types/teaVariety";

const STORAGE_KEY = "teaVarieties";

export const useTeaVarieties = () => {
  const [teaVarieties, setTeaVarieties] = useState<TeaVariety[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teaVarieties));
  }, [teaVarieties]);

  const addTea = (tea: Omit<TeaVariety, "id">) => {
    const newTea = {
      ...tea,
      id: Date.now().toString(),
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

  const getTeaById = (id: string) => {
    return teaVarieties.find((tea) => tea.id === id);
  };

  return {
    teaVarieties,
    addTea,
    updateTea,
    deleteTea,
    getTeaById,
  };
};
