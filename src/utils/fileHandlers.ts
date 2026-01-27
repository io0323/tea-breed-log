import { TeaVariety } from "../types/teaVariety";

// メモリリーク防止のためのURL管理
const createdUrls = new Set<string>();

// URLのクリーンアップ関数
const cleanupUrls = () => {
  createdUrls.forEach(url => URL.revokeObjectURL(url));
  createdUrls.clear();
};

// 一定時間後に自動クリーンアップ
if (typeof window !== 'undefined') {
  setInterval(cleanupUrls, 60000); // 1分ごとにクリーンアップ
}

export const exportToJson = (data: TeaVariety[], filename: string) => {
  try {
    const dataStr = JSON.stringify(data, null, 2);
    const exportFileDefaultName = `${filename}.json`;

    const blob = new Blob([dataStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    createdUrls.add(url);

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", url);
    linkElement.setAttribute("download", exportFileDefaultName);
    document.body.appendChild(linkElement);
    linkElement.click();
    linkElement.remove();

    // クリック後に少し遅延してURLを解放
    setTimeout(() => {
      URL.revokeObjectURL(url);
      createdUrls.delete(url);
    }, 100);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('データのエクスポートに失敗しました');
  }
};

export const importFromJson = (file: File): Promise<TeaVariety[]> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("ファイルが選択されていません"));
      return;
    }

    if (!file.name.endsWith('.json')) {
      reject(new Error("JSONファイルを選択してください"));
      return;
    }

    const fileReader = new FileReader();
    
    fileReader.onload = (event) => {
      try {
        if (event.target?.result) {
          const result = JSON.parse(event.target.result as string);
          
          // データのバリデーション
          if (!Array.isArray(result)) {
            throw new Error("無効なデータ形式です");
          }
          
          // 必須フィールドのチェック
          const isValidData = result.every(item => 
            item && typeof item === 'object' && 
            'name' in item && 'generation' in item
          );
          
          if (!isValidData) {
            throw new Error("データ形式が正しくありません");
          }
          
          resolve(result as TeaVariety[]);
        } else {
          reject(new Error("ファイルの読み込みに失敗しました"));
        }
      } catch (error) {
        reject(new Error("無効なJSONファイルです"));
      }
    };
    
    fileReader.onerror = () => {
      reject(new Error("ファイルの読み込み中にエラーが発生しました"));
    };
    
    fileReader.readAsText(file);
  });
};

// 手動クリーンアップ関数をエクスポート
export { cleanupUrls };
