import { ChangeEvent, useCallback, memo } from "react";

interface TeaFiltersProps {
  filters: {
    status: string;
    generation: string;
    year: string;
    search: string;
    location: string;
  };
  onFilterChange: (filters: {
    status: string;
    generation: string;
    year: string;
    search: string;
    location: string;
  }) => void;
  years: number[];
}

export const TeaFilters = memo(({ filters, onFilterChange, years }: TeaFiltersProps) => {
  // フィルター変更ハンドラをメモ化
  const handleChange = useCallback((e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value,
    });
  }, [filters, onFilterChange]);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">場所</label>
          <select
            name="location"
            value={filters.location}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
          >
            <option value="">すべて</option>
            <option value="静岡県">静岡県</option>
            <option value="鹿児島県">鹿児島県</option>
            <option value="宮崎県">宮崎県</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">状態</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
          >
            <option value="">すべて</option>
            <option value="active">栽培中</option>
            <option value="discarded">終了</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">世代</label>
          <select
            name="generation"
            value={filters.generation}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
          >
            <option value="">すべて</option>
            <option value="F1">F1</option>
            <option value="F2">F2</option>
            <option value="F3">F3</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">年度</label>
          <select
            name="year"
            value={filters.year}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
          >
            <option value="">すべて</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">検索</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="品種名、栽培地など"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark"
          />
        </div>
      </div>
    </div>
  );
});

TeaFilters.displayName = 'TeaFilters';
