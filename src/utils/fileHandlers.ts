import { TeaVariety } from "../types/teaVariety";

export const exportToJson = (data: TeaVariety[], filename: string) => {
  const dataStr = JSON.stringify(data, null, 2);
  const exportFileDefaultName = `${filename}.json`;

  const blob = new Blob([dataStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", url);
  linkElement.setAttribute("download", exportFileDefaultName);
  document.body.appendChild(linkElement);
  linkElement.click();
  linkElement.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
};

export const importFromJson = (file: File): Promise<TeaVariety[]> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    
    fileReader.onload = (event) => {
      try {
        if (event.target?.result) {
          const result = JSON.parse(event.target.result as string) as TeaVariety[];
          resolve(result);
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
