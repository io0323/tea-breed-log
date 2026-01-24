import React from 'react';
import { useForm } from 'react-hook-form';
import { HealthIssue, HealthRecordFormData } from '../../types/healthRecord';
import { format } from 'date-fns';
import { memo, useMemo, useCallback } from 'react';

interface HealthRecordFormProps {
  initialData?: Partial<HealthIssue>;
  onSubmit: (data: HealthRecordFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const issueTypes = useMemo(() => [
  { value: 'disease', label: '病気' },
  { value: 'pest', label: '害虫' },
  { value: 'nutrition', label: '栄養障害' },
  { value: 'environmental', label: '環境要因' },
  { value: 'other', label: 'その他' },
], []);

const severityLevels = useMemo(() => [
  { value: 'low', label: '軽度' },
  { value: 'medium', label: '中程度' },
  { value: 'high', label: '重度' },
], []);

const statusOptions = useMemo(() => [
  { value: 'open', label: '未対応' },
  { value: 'in_progress', label: '対応中' },
  { value: 'resolved', label: '解決済み' },
], []);

export const HealthRecordForm: React.FC<HealthRecordFormProps> = memo(({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HealthRecordFormData>({
    defaultValues: {
      date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
      type: initialData?.type || '',
      severity: initialData?.severity || 'medium',
      description: initialData?.description || '',
      status: initialData?.status || 'open',
      solution: initialData?.solution || '',
    },
  });

  // フォーム送信ハンドラをメモ化
  const handleFormSubmit = useCallback((data: HealthRecordFormData) => {
    onSubmit(data);
  }, [onSubmit]);

  // キャンセルハンドラをメモ化
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="health-date" className="block text-sm font-medium text-gray-700 mb-1">
            日付 <span className="text-red-500">*</span>
          </label>
          <input
            id="health-date"
            type="date"
            {...register('date', { required: '日付を入力してください' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark sm:text-sm"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="health-type" className="block text-sm font-medium text-gray-700 mb-1">
            問題の種類 <span className="text-red-500">*</span>
          </label>
          <select
            id="health-type"
            {...register('type', { required: '問題の種類を選択してください' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark sm:text-sm"
          >
            <option value="">選択してください</option>
            {issueTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="health-severity" className="block text-sm font-medium text-gray-700 mb-1">
            深刻度 <span className="text-red-500">*</span>
          </label>
          <select
            id="health-severity"
            {...register('severity', { required: '深刻度を選択してください' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark sm:text-sm"
          >
            {severityLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="health-status" className="block text-sm font-medium text-gray-700 mb-1">
            ステータス <span className="text-red-500">*</span>
          </label>
          <select
            id="health-status"
            {...register('status', { required: 'ステータスを選択してください' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark sm:text-sm"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="health-description" className="block text-sm font-medium text-gray-700 mb-1">
          症状・問題の詳細 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="health-description"
          rows={3}
          {...register('description', { required: '症状や問題の詳細を入力してください' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark sm:text-sm"
          placeholder="具体的な症状や問題の詳細を記入してください"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="health-solution" className="block text-sm font-medium text-gray-700 mb-1">
          対策・処置内容
        </label>
        <textarea
          id="health-solution"
          rows={3}
          {...register('solution')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tea-dark focus:ring-tea-dark sm:text-sm"
          placeholder="実施した対策や処置内容を記入してください"
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

HealthRecordForm.displayName = 'HealthRecordForm';
