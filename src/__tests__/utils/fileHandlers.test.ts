import { exportToJson, importFromJson } from "../../utils/fileHandlers";
import { TeaVariety } from "../../types/teaVariety";

describe("fileHandlers", () => {
  describe("exportToJson", () => {
    it("Blob + createObjectURL でダウンロードリンクを作成し、URLをrevokeすること", () => {
      jest.useFakeTimers();

      const originalCreateObjectURL = (URL as unknown as { createObjectURL?: unknown }).createObjectURL;
      const originalRevokeObjectURL = (URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL;

      Object.defineProperty(URL, "createObjectURL", {
        value: jest.fn(),
        writable: true,
        configurable: true,
      });

      Object.defineProperty(URL, "revokeObjectURL", {
        value: jest.fn(),
        writable: true,
        configurable: true,
      });

      const createObjectURLSpy = jest
        .spyOn(URL, "createObjectURL")
        .mockReturnValue("blob:mock-url");
      const revokeObjectURLSpy = jest
        .spyOn(URL, "revokeObjectURL")
        .mockImplementation(() => {});

      const clickSpy = jest
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(() => {});

      const originalCreateElement = document.createElement.bind(document);
      let createdAnchor: HTMLAnchorElement | null = null;

      const createElementSpy = (jest
        .spyOn(document as unknown as { createElement: (tagName: string) => HTMLElement }, "createElement")
        .mockImplementation((tagName: string) => {
          const el = originalCreateElement(tagName);
          if (tagName === "a") {
            createdAnchor = el as unknown as HTMLAnchorElement;
          }
          return el;
        })) as unknown as jest.SpyInstance<HTMLElement, [string]>;

      const data: TeaVariety[] = [
        {
          id: "1",
          name: "やぶきた",
          generation: "F1",
          location: "静岡県",
          year: 2023,
          germinationRate: 90,
          growthScore: 4,
          diseaseResistance: 3,
          aroma: "",
          note: "",
          status: "active",
          images: [],
        },
      ];

      exportToJson(data, "tea-varieties");

      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(createdAnchor).not.toBeNull();

      if (!createdAnchor) {
        throw new Error("Anchor element was not created");
      }

      const anchor = createdAnchor as unknown as HTMLAnchorElement;
      expect(anchor.getAttribute("href")).toBe("blob:mock-url");
      expect(anchor.getAttribute("download")).toBe("tea-varieties.json");
      expect(clickSpy).toHaveBeenCalledTimes(1);

      jest.runAllTimers();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
      clickSpy.mockRestore();
      createElementSpy.mockRestore();

      if (originalCreateObjectURL === undefined) {
        delete (URL as any).createObjectURL;
      } else {
        Object.defineProperty(URL, "createObjectURL", {
          value: originalCreateObjectURL,
          writable: true,
          configurable: true,
        });
      }

      if (originalRevokeObjectURL === undefined) {
        delete (URL as any).revokeObjectURL;
      } else {
        Object.defineProperty(URL, "revokeObjectURL", {
          value: originalRevokeObjectURL,
          writable: true,
          configurable: true,
        });
      }

      jest.useRealTimers();
    });
  });

  describe("importFromJson", () => {
    it("JSONファイルをTeaVariety[]として読み込めること", async () => {
      const data: TeaVariety[] = [
        {
          id: "1",
          name: "やぶきた",
          generation: "F1",
          location: "静岡県",
          year: 2023,
          germinationRate: 90,
          growthScore: 4,
          diseaseResistance: 3,
          aroma: "",
          note: "",
          status: "active",
          images: [],
        },
      ];

      const file = new File([JSON.stringify(data)], "data.json", {
        type: "application/json",
      });

      await expect(importFromJson(file)).resolves.toEqual(data);
    });

    it("不正なJSONの場合はエラーになること", async () => {
      const file = new File(["{invalid"], "data.json", {
        type: "application/json",
      });

      await expect(importFromJson(file)).rejects.toThrow("無効なJSONファイルです");
    });

    it("FileReaderでエラーが発生した場合はエラーになること", async () => {
      const OriginalFileReader = global.FileReader;

      class MockFileReader {
        public onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
        public onerror: (() => void) | null = null;

        readAsText() {
          if (this.onerror) this.onerror();
        }
      }

      // @ts-expect-error - test mock
      global.FileReader = MockFileReader;

      const file = new File(["[]"], "data.json", { type: "application/json" });

      await expect(importFromJson(file)).rejects.toThrow(
        "ファイルの読み込み中にエラーが発生しました"
      );

      global.FileReader = OriginalFileReader;
    });
  });
});
