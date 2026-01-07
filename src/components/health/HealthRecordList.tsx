import React from 'react';
import { HealthIssue } from '../../types/healthRecord';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface HealthRecordListProps {
  records: HealthIssue[];
  onEdit: (record: HealthIssue) => void;
  onDelete: (id: string) => void;
  isEditable?: boolean;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'open':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'resolved':
      return '解決済み';
    case 'in_progress':
      return '対応中';
    case 'open':
      return '未対応';
    default:
      return status;
  }
};

export const HealthRecordList: React.FC<HealthRecordListProps> = ({
  records,
  onEdit,
  onDelete,
  isEditable = true,
}) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        健康記録がありません。記録を追加してください。
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {records.map((record) => (
          <li key={record.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                      record.severity
                    )} mr-2`}>
                      {record.severity === 'high' ? '高' : record.severity === 'medium' ? '中' : '低'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {format(parseISO(record.date), 'yyyy年MM月dd日 (E)', { locale: ja })}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    record.status
                  )}`}>
                    {getStatusLabel(record.status)}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">
                    {record.type === 'disease' ? '病気' : 
                     record.type === 'pest' ? '害虫' :
                     record.type === 'nutrition' ? '栄養障害' :
                     record.type === 'environmental' ? '環境要因' : 'その他'}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{record.description}</p>
                  {record.solution && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500">対策・処置:</p>
                      <p className="text-sm text-gray-700">{record.solution}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {isEditable && (
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    type="button"
                    onClick={() => onEdit(record)}
                    className="mr-2 inline-flex items-center p-1 border border-transparent rounded-full text-tea-dark hover:bg-tea-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tea-dark"
                  >
                    <PencilIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">編集</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('この記録を削除してもよろしいですか？')) {
                        onDelete(record.id);
                      }
                    }}
                    className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-4 w-4" aria-hidden="true" />
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
