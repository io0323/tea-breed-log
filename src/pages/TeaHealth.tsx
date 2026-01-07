import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeaVarieties } from '../hooks/useTeaVarieties';
import { useHealthRecords } from '../hooks/useHealthRecords';
import { HealthRecordForm } from '../components/health/HealthRecordForm';
import { HealthRecordList } from '../components/health/HealthRecordList';
import { PlusIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export const TeaHealth: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTeaById } = useTeaVarieties();
  const {
    records,
    healthStatus,
    healthStats,
    addRecord,
    updateRecord,
    deleteRecord,
  } = useHealthRecords(id);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthIssue | null>(null);

  const tea = id ? getTeaById(id) : null;

  const handleSubmit = (data: HealthRecordFormData) => {
    if (!id) return;

    const recordData = {
      ...data,
      teaId: id,
      type: data.type as HealthIssue['type'],
      severity: data.severity as HealthIssue['severity'],
      status: data.status as HealthIssue['status'],
    };

    if (editingRecord) {
      updateRecord(editingRecord.id, recordData);
    } else {
      addRecord(recordData);
    }
    
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleEdit = (record: HealthIssue) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const getStatusColor = () => {
    switch (healthStatus) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'needs_attention':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (healthStatus) {
      case 'healthy':
        return '良好';
      case 'warning':
        return '注意';
      case 'critical':
        return '要対応';
      case 'needs_attention':
        return '要確認';
      default:
        return '不明';
    }
  };

  if (id && !tea) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500">お茶の品種が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {tea ? `${tea.name}の健康管理` : 'お茶の健康管理'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          お茶の健康状態を記録・管理します
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 健康状態サマリー */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                健康状態
              </h3>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    現在の状態
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>未対応の記録</span>
                    <span className="font-medium text-gray-900">
                      {healthStats.openIssues}件
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span>解決済み</span>
                    <span className="font-medium text-gray-900">
                      {healthStats.resolvedIssues}件
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                問題の内訳
              </h3>
              <div className="space-y-3">
                {Object.entries(healthStats.issueByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {type === 'disease' ? '病気' : 
                       type === 'pest' ? '害虫' :
                       type === 'nutrition' ? '栄養障害' :
                       type === 'environmental' ? '環境要因' : 'その他'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {count}件
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 記録一覧 */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  健康記録
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  お茶の健康状態に関する記録の一覧です
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingRecord(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-tea-dark hover:bg-tea-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tea-dark"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                記録を追加
              </button>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <HealthRecordList
                records={records}
                onEdit={handleEdit}
                onDelete={deleteRecord}
                isEditable={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 記録フォームモーダル */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingRecord ? '記録を編集' : '新しい記録を追加'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingRecord(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">閉じる</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <HealthRecordForm
                initialData={editingRecord || undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingRecord(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
