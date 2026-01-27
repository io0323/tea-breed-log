import { GrowthRecord } from '../../types/growthRecord';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { memo, useCallback } from 'react';

interface GrowthRecordListProps {
  records: GrowthRecord[];
  onEdit: (record: GrowthRecord) => void;
  onDelete: (id: string) => void;
  isEditable?: boolean;
}

const weatherIcons = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
};

const GrowthRecordItem = memo(({ record, onEdit, onDelete, isEditable }: {
  record: GrowthRecord;
  onEdit: (record: GrowthRecord) => void;
  onDelete: (id: string) => void;
  isEditable: boolean;
}) => {
  const handleEdit = useCallback(() => {
    onEdit(record);
  }, [record, onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('この成長記録を削除してもよろしいですか？')) {
      onDelete(record.id);
    }
  }, [record.id, onDelete]);

  return (
    <li className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-2xl mr-3">
            {weatherIcons[record.weather as keyof typeof weatherIcons] || '📝'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {format(parseISO(record.date), 'yyyy年MM月dd日 (E)', { locale: ja })}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>草丈: {record.height} cm</span>
              <span>葉の数: {record.leafCount}枚</span>
              <span>気温: {record.temperature}°C</span>
            </div>
            {record.notes && (
              <p className="mt-1 text-sm text-gray-600">{record.notes}</p>
            )}
          </div>
        </div>
        {isEditable && (
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="text-tea-dark hover:text-tea-brown"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </li>
  );
});

GrowthRecordItem.displayName = 'GrowthRecordItem';

export const GrowthRecordList = memo(({
  records,
  onEdit,
  onDelete,
  isEditable = true,
}: GrowthRecordListProps) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        成長記録がありません。記録を追加してください。
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {records.map((record) => (
          <GrowthRecordItem
            key={record.id}
            record={record}
            onEdit={onEdit}
            onDelete={onDelete}
            isEditable={isEditable}
          />
        ))}
      </ul>
    </div>
  );
});

GrowthRecordList.displayName = 'GrowthRecordList';
