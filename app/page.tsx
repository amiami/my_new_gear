"use client";

import { useState, useEffect } from "react";

type Gear = {
  id: string;
  name: string;
  boughtAtDate: string;
  boughtLocation: string;
  comment: string;
  isDisposed: boolean;
  createdAt: number;
};

export default function MyNewGearApp() {
  const [gears, setGears] = useState<Gear[]>([]);
  const [name, setName] = useState("");
  const [boughtAtDate, setBoughtAtDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [boughtLocation, setBoughtLocation] = useState("");
  const [comment, setComment] = useState("");
  const [filterDisposed, setFilterDisposed] = useState<"all" | "active" | "disposed">("all");

  // LocalStorageから初期読み込み
  useEffect(() => {
    const saved = localStorage.getItem("my_new_gears");
    if (saved) {
      try {
        setGears(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load gears", e);
      }
    }
  }, []);

  // 保存処理
  const saveGears = (newGears: Gear[]) => {
    setGears(newGears);
    localStorage.setItem("my_new_gears", JSON.stringify(newGears));
  };

  // ギア登録
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newGear: Gear = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: name.trim(),
      boughtAtDate,
      boughtLocation: boughtLocation.trim(),
      comment: comment.trim(),
      isDisposed: false,
      createdAt: Date.now(),
    };

    saveGears([newGear, ...gears]);
    setName("");
    setBoughtLocation("");
    setComment("");
  };

  // 処分・売却トグル
  const toggleDisposed = (id: string) => {
    const updated = gears.map((g) =>
      g.id === id ? { ...g, isDisposed: !g.isDisposed } : g
    );
    saveGears(updated);
  };

  // 削除
  const deleteGear = (id: string) => {
    if (!window.confirm("このギアの記録を削除しますか？")) return;
    saveGears(gears.filter((g) => g.id !== id));
  };

  // X（旧Twitter）へシェア
  const shareToX = (gear: Gear) => {
    const textLines = [
      `My new gear... 📦✨`,
      `【${gear.name}】`,
      gear.boughtLocation ? `購入場所: ${gear.boughtLocation}` : "",
      gear.comment ? `一言: ${gear.comment}` : "",
      `#MNG #MyNewGear`,
    ].filter(Boolean);

    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      textLines.join("\n")
    )}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const filteredGears = gears.filter((gear) => {
    if (filterDisposed === "active") return !gear.isDisposed;
    if (filterDisposed === "disposed") return gear.isDisposed;
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* ヘッダー */}
        <header className="border-b border-neutral-800 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>📦</span> My New Gear Log
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            買ったギアを手元ですぐ記録。ワンクリックでXにシェアできます。
          </p>
        </header>

        {/* 登録フォーム */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center mb-4">
            <h2 className="text-sm font-semibold text-neutral-300 me-1">
              新しいギアを記録
            </h2>
            <p className="text-xs text-neutral-400">※画像登録は開発中です</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                品名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例: SONY WH-1000XM5, HHKB Studio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  買った日
                </label>
                <input
                  type="date"
                  value={boughtAtDate}
                  onChange={(e) => setBoughtAtDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  買った場所 / ショップ
                </label>
                <input
                  type="text"
                  placeholder="例: Amazon, e☆イヤホン, 公式ストア"
                  value={boughtLocation}
                  onChange={(e) => setBoughtLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                コメント / 感想
              </label>
              <textarea
                rows={2}
                placeholder="例: 音質も装着感も最高。今年買ってよかった機材筆頭。"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:bg-neutral-200 transition-colors shadow"
            >
              ギアを登録する
            </button>
          </form>
        </section>

        {/* ギア一覧 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-300">
              記録したギア ({filteredGears.length})
            </h2>

            {/* フィルタータブ */}
            <div className="flex gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs">
              {(["all", "active", "disposed"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterDisposed(mode)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    filterDisposed === mode
                      ? "bg-neutral-800 text-white font-medium"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {mode === "all" ? "すべて" : mode === "active" ? "所持中" : "手放し済"}
                </button>
              ))}
            </div>
          </div>

          {filteredGears.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl text-neutral-500 text-sm">
              記録されたギアがありません。
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredGears.map((gear) => (
                <div
                  key={gear.id}
                  className={`p-4 rounded-xl border transition-all ${
                    gear.isDisposed
                      ? "bg-neutral-950/60 border-neutral-900 opacity-60"
                      : "bg-neutral-900 border-neutral-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base text-white">
                          {gear.name}
                        </span>
                        {gear.isDisposed && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                            Disposed
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-400 mt-1">
                        {gear.boughtAtDate && <span>📅 {gear.boughtAtDate}</span>}
                        {gear.boughtLocation && <span>📍 {gear.boughtLocation}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => shareToX(gear)}
                      className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1 transition-colors border border-neutral-700"
                      title="Xでポスト"
                    >
                      <span className="font-bold">𝕏</span> シェア
                    </button>
                  </div>

                  {gear.comment && (
                    <p className="text-xs text-neutral-300 mt-2.5 bg-neutral-950/50 p-2.5 rounded-lg border border-neutral-800/80 leading-relaxed whitespace-pre-wrap">
                      {gear.comment}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-800/60 text-xs text-neutral-400">
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-neutral-200">
                      <input
                        type="checkbox"
                        checked={gear.isDisposed}
                        onChange={() => toggleDisposed(gear.id)}
                        className="rounded border-neutral-700 bg-neutral-950 accent-white"
                      />
                      <span>手放した（処分・売却）</span>
                    </label>

                    <button
                      onClick={() => deleteGear(gear.id)}
                      className="text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}