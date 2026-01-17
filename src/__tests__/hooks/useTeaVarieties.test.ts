import { renderHook, act } from '@testing-library/react';
import { useTeaVarieties } from '../../hooks/useTeaVarieties';

// モックデータ
const mockTeaVarieties = [
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
    status: 'active' as const,
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
    status: 'active' as const,
    images: []
  }
];

describe('useTeaVarieties', () => {
  beforeEach(() => {
    // 各テストの前にlocalStorageをクリア
    localStorage.clear();
    // モックデータをlocalStorageにセット
    localStorage.setItem('teaVarieties', JSON.stringify(mockTeaVarieties));
  });

  it('お茶の品種一覧を取得できること', () => {
    const { result } = renderHook(() => useTeaVarieties());
    
    expect(result.current.teaVarieties).toHaveLength(2);
    expect(result.current.teaVarieties[0].name).toBe('やぶきた');
    expect(result.current.teaVarieties[1].name).toBe('さやまかおり');
  });

  it('IDでお茶の品種を取得できること', () => {
    const { result } = renderHook(() => useTeaVarieties());
    
    const tea = result.current.getTeaById('1');
    expect(tea).toBeDefined();
    expect(tea?.name).toBe('やぶきた');
    
    const notFoundTea = result.current.getTeaById('999');
    expect(notFoundTea).toBeUndefined();
  });

  it('新しいお茶の品種を追加できること', () => {
    const { result } = renderHook(() => useTeaVarieties());
    
    const newTea = {
      name: 'ゆたかみどり',
      generation: 'F1',
      location: '宮崎県',
      year: 2023,
      germinationRate: 92,
      growthScore: 4,
      diseaseResistance: 5,
      aroma: 'まろやかで深みのある香り',
      note: '耐病性が高く栽培しやすい',
      status: 'active' as const,
      images: []
    };

    act(() => {
      result.current.addTea(newTea);
    });

    expect(result.current.teaVarieties).toHaveLength(3);
    expect(result.current.teaVarieties[2].name).toBe('ゆたかみどり');
    expect(result.current.teaVarieties[2]).toHaveProperty('id');
  });

  it('お茶の品種を更新できること', () => {
    const { result } = renderHook(() => useTeaVarieties());
    
    const updatedTea = {
      ...mockTeaVarieties[0],
      name: 'やぶきた（改良種）',
      note: '耐寒性が向上した改良種'
    };

    act(() => {
      result.current.updateTea('1', updatedTea);
    });

    const updated = result.current.getTeaById('1');
    expect(updated?.name).toBe('やぶきた（改良種）');
    expect(updated?.note).toBe('耐寒性が向上した改良種');
  });

  it('お茶の品種を削除できること', () => {
    const { result } = renderHook(() => useTeaVarieties());
    
    act(() => {
      result.current.deleteTea('1');
    });

    expect(result.current.teaVarieties).toHaveLength(1);
    expect(result.current.getTeaById('1')).toBeUndefined();
  });

  it('localStorageにデータが保存されていること', () => {
    const { result } = renderHook(() => useTeaVarieties());
    
    // 新しいお茶を追加
    act(() => {
      result.current.addTea({
        name: 'テスト品種',
        generation: 'F1',
        location: 'テスト県',
        year: 2023,
        germinationRate: 90,
        growthScore: 4,
        diseaseResistance: 4,
        aroma: 'テスト香り',
        note: 'テストノート',
        status: 'active',
        images: []
      });
    });

    // localStorageからデータを取得して検証
    const storedData = JSON.parse(localStorage.getItem('teaVarieties') || '[]');
    expect(storedData).toHaveLength(3);
    expect(storedData[2].name).toBe('テスト品種');
  });
});
