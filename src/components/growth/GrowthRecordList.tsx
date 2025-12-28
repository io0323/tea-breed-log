import { GrowthRecord } from '../../types/growthRecord';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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

export const GrowthRecordList = ({
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
          <li key={record.id} className="px-4 py-4 sm:px-6">
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
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {record.notes}
                    </p>
                  )}
                </div>
              </div>
              
              {isEditable && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => onEdit(record)}
                    className="rounded-full p-1 text-gray-400 hover:text-tea-dark focus:outline-none focus:ring-2 focus:ring-tea-dark focus:ring-offset-2"
                  >
                    <PencilIcon className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">編集</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('この記録を削除してもよろしいですか？')) {
                        onDelete(record.id);
                      }
                    }}
                    className="rounded-full p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <TrashIcon className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">削除</span>
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
