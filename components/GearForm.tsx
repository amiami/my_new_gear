import type {
  ChangeEvent,
  Dispatch,
  FormEvent,
  RefObject,
  SetStateAction,
} from "react";

type GearFormProps = {
  name: string;
  setName: Dispatch<SetStateAction<string>>;

  boughtAtDate: string;
  setBoughtAtDate: Dispatch<SetStateAction<string>>;

  boughtLocation: string;
  setBoughtLocation: Dispatch<SetStateAction<string>>;

  comment: string;
  setComment: Dispatch<SetStateAction<string>>;

  setSelectedFile: Dispatch<SetStateAction<File | null>>;
  fileInputRef: RefObject<HTMLInputElement | null>;

  isUploading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function GearForm({
  name,
  setName,
  boughtAtDate,
  setBoughtAtDate,
  boughtLocation,
  setBoughtLocation,
  comment,
  setComment,
  setSelectedFile,
  fileInputRef,
  isUploading,
  onSubmit,
}: GearFormProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-300 mb-4">
        新しいガジェットを記録
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="gear-name"
            className="block text-xs font-medium text-neutral-400 mb-1"
          >
            品名 <span className="text-red-400">*</span>
          </label>

          <input
            id="gear-name"
            type="text"
            required
            placeholder="例: SONY WH-1000XM5, HHKB Studio"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="bought-at-date"
              className="block text-xs font-medium text-neutral-400 mb-1"
            >
              買った日
            </label>

            <input
              id="bought-at-date"
              type="date"
              value={boughtAtDate}
              onChange={(event) => setBoughtAtDate(event.target.value)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label
              htmlFor="bought-location"
              className="block text-xs font-medium text-neutral-400 mb-1"
            >
              買った場所 / ショップ
            </label>

            <input
              id="bought-location"
              type="text"
              placeholder="例: Amazon, e☆イヤホン, 公式ストア"
              value={boughtLocation}
              onChange={(event) => setBoughtLocation(event.target.value)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-400"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="gear-photo"
            className="block text-xs font-medium text-neutral-400 mb-1"
          >
            写真（任意）
          </label>

          <input
            id="gear-photo"
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-xs text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 cursor-pointer"
          />
        </div>

        <div>
          <label
            htmlFor="gear-comment"
            className="block text-xs font-medium text-neutral-400 mb-1"
          >
            コメント / 感想
          </label>

          <textarea
            id="gear-comment"
            rows={2}
            placeholder="例: 装着感抜群。ノイキャン性能に驚いた。"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-400"
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:bg-neutral-200 transition-colors shadow disabled:opacity-50"
        >
          {isUploading
            ? "保存・画像アップロード中..."
            : "ガジェットを登録する"}
        </button>
      </form>
    </section>
  );
}