"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

import GearForm from "@/components/GearForm";
import GearCard from "@/components/GearCard";
import { loadGears, saveGears } from "@/lib/gearStorage";
import type { Gear } from "@/types/gear";

export default function MyNewGearApp() {
  const [gears, setGears] = useState<Gear[]>(() => loadGears());
  const [name, setName] = useState("");
  const [boughtAtDate, setBoughtAtDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [boughtLocation, setBoughtLocation] = useState("");
  const [comment, setComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filterDisposed, setFilterDisposed] = useState<"all" | "active" | "disposed">("all");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // LocalStorageから読み込み

  const updateGears = (newGears: Gear[]) => {
    setGears(newGears);
    saveGears(newGears);
  };

  // ガジェット登録（画像アップロード含む）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUploading(true);
    let uploadedImageUrl = "";

    try {
      // 画像が選択されている場合はSupabase Storageにアップロード
      if (selectedFile) {
        // 拡張子を安全に取得（取得できない場合は png にフォールバック）
        const fileExt = selectedFile.name.includes(".")
          ? selectedFile.name.split(".").pop()?.toLowerCase()
          : "png";

        // 半角英数字とアンダースコアのみでクリーンなファイル名を生成
        const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = cleanFileName; // ← 階層を作らずルートに保存（確実）

        console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log("Uploading Path:", filePath);
        const { error: uploadError } = await supabase.storage
          .from("gear-images")
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw uploadError;
        }

        // 公開URLを取得
        const { data: publicUrlData } = supabase.storage
          .from("gear-images")
          .getPublicUrl(filePath);

        uploadedImageUrl = publicUrlData.publicUrl;
      }

      const newGear: Gear = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        name: name.trim(),
        boughtAtDate,
        boughtLocation: boughtLocation.trim(),
        comment: comment.trim(),
        imageUrl: uploadedImageUrl || undefined,
        isDisposed: false,
        createdAt: Date.now(),
      };

      updateGears([newGear, ...gears]);

      // フォーム初期化
      setName("");
      setBoughtLocation("");
      setComment("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      console.error("Upload error:", err);

      const message =
        err instanceof Error ? err.message : "不明なエラーが発生しました";

      alert("画像のアップロードまたは登録に失敗しました: " + message);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleDisposed = (id: string) => {
    const updated = gears.map((g) =>
      g.id === id ? { ...g, isDisposed: !g.isDisposed } : g
    );
    updateGears(updated);
  };

  const deleteGear = (id: string) => {
    if (!window.confirm("このガジェットの記録を削除しますか？")) return;
    updateGears(gears.filter((g) => g.id !== id));
  };

  // Xシェア処理（スマホ: OS共有シートで画像添付 / PC: 画像コピー & ポップアップ）
  const shareToX = async (gear: Gear) => {
    const text = "My new gear...";
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // 1. スマホの場合（Web Share APIで画像ファイルを直接渡す）
    if (isMobile && gear.imageUrl && navigator.share && navigator.canShare) {
      try {
        const response = await fetch(gear.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "mynewgear.png", { type: blob.type || "image/png" });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            text: text,
            files: [file],
          });
          return;
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    // 2. PCの場合（画像があればクリップボードにコピーしておく）
    if (!isMobile && gear.imageUrl && navigator.clipboard && window.ClipboardItem) {
      try {
        const response = await fetch(gear.imageUrl);
        const blob = await response.blob();
        // PNG形式にしてクリップボードにセット
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
      } catch (e) {
        console.warn("クリップボードへの画像コピーをスキップしました:", e);
      }
    }

    // 3. Xの投稿画面を開く
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

    if (isMobile) {
      window.location.href = shareUrl;
    } else {
      const width = 550;
      const height = 420;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        shareUrl,
        "shareToXWindow",
        `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );
    }
  };

  const filteredGears = gears.filter((gear) => {
    if (filterDisposed === "active") return !gear.isDisposed;
    if (filterDisposed === "disposed") return gear.isDisposed;
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="border-b border-neutral-800 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>📦</span> 僕のマイニューギア
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            買ったガジェットを手元ですぐ記録。ワンクリックでXにシェアできます。
          </p>
        </header>

        {/* 登録フォーム */}
        <GearForm
          name={name}
          setName={setName}
          boughtAtDate={boughtAtDate}
          setBoughtAtDate={setBoughtAtDate}
          boughtLocation={boughtLocation}
          setBoughtLocation={setBoughtLocation}
          comment={comment}
          setComment={setComment}
          setSelectedFile={setSelectedFile}
          fileInputRef={fileInputRef}
          isUploading={isUploading}
          onSubmit={handleSubmit}
        />

        {/* ガジェット一覧 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-300">
              記録したガジェット ({filteredGears.length})
            </h2>

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
              記録されたガジェットがありません。
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredGears.map((gear) => (
                <GearCard
                  key={gear.id}
                  gear={gear}
                  onShare={shareToX}
                  onToggleDisposed={toggleDisposed}
                  onDelete={deleteGear}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
