import { useForm, Controller } from 'react-hook-form';
import { GrowthRecord, GrowthRecordFormData } from '../../types/growthRecord';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { memo, useMemo, useCallback } from 'react';

interface GrowthRecordFormProps {
  initialData?: Partial<GrowthRecord>;
  onSubmit: (data: GrowthRecordFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const GrowthRecordForm = memo(({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: GrowthRecordFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GrowthRecordFormData>({
    defaultValues: {
      date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
      height: initialData?.height || 0,
      leafCount: initialData?.leafCount || 0,
      weather: initialData?.weather || 'sunny',
      temperature: initialData?.temperature || 20,
      notes: initialData?.notes || '',
      imageUrl: initialData?.imageUrl || '',
    },
  });

  // 天気オプションをメモ化
  const weatherOptions = useMemo(() => [
    { value: 'sunny', label: '晴れ' },
    { value: 'cloudy', label: '曇り' },
    { value: 'rainy', label: '雨' },
    { value: 'snowy', label: '雪' },
  ], []);

  // フォーム送信ハンドラをメモ化
  const handleFormSubmit = useCallback((data: GrowthRecordFormData) => {
    onSubmit(data);
  }, [onSubmit]);

  // キャンセルハンドラをメモ化
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            記録日 <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="date"
            {...register('date', { required: '記録日は必須です' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark sm:text-sm"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="weather" className="block text-sm font-medium text-gray-700 mb-1">
            天気 <span className="text-red-500">*</span>
          </label>
          <select
            id="weather"
            {...register('weather', { required: '天気を選択してください' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark sm:text-sm"
          >
            {weatherOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
            気温 (°C) <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              id="temperature"
              type="number"
              step="0.1"
              {...register('temperature', {
                required: '気温を入力してください',
                min: { value: -50, message: '-50°C以上を入力してください' },
                max: { value: 50, message: '50°C以下を入力してください' },
              })}
              className="block w-full rounded-md border-gray-300 pr-12 focus:border-tea-dark focus:ring-tea-dark sm:text-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">°C</span>
            </div>
          </div>
          {errors.temperature && (
            <p className="mt-1 text-sm text-red-600">
              {errors.temperature.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
            草丈 (cm) <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              id="height"
              type="number"
              step="0.1"
              {...register('height', {
                required: '草丈を入力してください',
                min: { value: 0, message: '0cm以上を入力してください' },
                max: { value: 1000, message: '1000cm以下を入力してください' },
              })}
              className="block w-full rounded-md border-gray-300 pr-12 focus:border-tea-dark focus:ring-tea-dark sm:text-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">cm</span>
            </div>
          </div>
          {errors.height && (
            <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="leafCount" className="block text-sm font-medium text-gray-700 mb-1">
            葉の枚数 <span className="text-red-500">*</span>
          </label>
          <input
            id="leafCount"
            type="number"
            min="0"
            {...register('leafCount', {
              required: '葉の枚数を入力してください',
              min: { value: 0, message: '0以上を入力してください' },
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark sm:text-sm"
          />
          {errors.leafCount && (
            <p className="mt-1 text-sm text-red-600">
              {errors.leafCount.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          観察メモ
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register('notes')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark sm:text-sm"
          placeholder="成長の様子や気づいたことなどを記録しましょう"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tea-dark"
          disabled={isSubmitting}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-tea-dark hover:bg-tea-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tea-dark"
          disabled={isSubmitting}
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
});

GrowthRecordForm.displayName = 'GrowthRecordForm';
