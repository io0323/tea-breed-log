import React from 'react';
import { TeaVariety } from '../types/teaVariety';

interface TeaListProps {
  teas: TeaVariety[];
  onTeaSelect: (tea: TeaVariety) => void;
  onTeaEdit: (tea: TeaVariety) => void;
  onTeaDelete: (teaId: string) => void;
}

export const TeaList: React.FC<TeaListProps> = ({
  teas,
  onTeaSelect,
  onTeaEdit,
  onTeaDelete,
}) => {
  return (
    <div className="tea-list">
      <h2>お茶の品種一覧</h2>
      {teas.length === 0 ? (
        <p>お茶の品種が登録されていません</p>
      ) : (
        <div className="tea-grid">
          {teas.map((tea) => (
            <div key={tea.id} className="tea-card">
              <h3>{tea.name}</h3>
              <p>世代: {tea.generation}</p>
              <p>場所: {tea.location}</p>
              <p>年: {tea.year}</p>
              <div className="tea-actions">
                <button onClick={() => onTeaSelect(tea)}>詳細</button>
                <button onClick={() => onTeaEdit(tea)}>編集</button>
                <button onClick={() => onTeaDelete(tea.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
