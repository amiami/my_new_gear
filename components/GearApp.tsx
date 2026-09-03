"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  createGearAction,
  deleteGearAction,
  updateGearDisposedAction,
} from "@/app/actions/gears";
import AuthStatus from "@/components/AuthStatus";
import GearCard from "@/components/GearCard";
import GearDetailModal from "@/components/GearDetailModal";
import GearForm from "@/components/GearForm";
import {
  DEFAULT_GEAR_SORT,
  GEAR_SORT_OPTIONS,
  isGearSort,
  sortGears,
  type GearSort,
} from "@/lib/gearSort";
import { createClient } from "@/lib/supabase/client";
import type { Gear } from "@/types/gear";

type GearAppProps = {
  gears: Gear[];
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const GEAR_SORT_STORAGE_KEY = "my-new-gear:owner-list-sort";

export default function GearApp({ gears }: GearAppProps) {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [name, setName] = useState("");
  const [boughtAtDate, setBoughtAtDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [boughtLocation, setBoughtLocation] = useState("");
  const [comment, setComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filterDisposed, setFilterDisposed] = useState<
    "all" | "active" | "disposed"
  >("all");
  const [sort, setSort] = useState<GearSort>(DEFAULT_GEAR_SORT);
  const [selectedGearId, setSelectedGearId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const storedSort = window.localStorage.getItem(GEAR_SORT_STORAGE_KEY);
        if (isGearSort(storedSort)) setSort(storedSort);
      } catch {
        // The default remains available when storage is blocked.
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const changeSort = (nextSort: GearSort) => {
    setSort(nextSort);
    try {
      window.localStorage.setItem(GEAR_SORT_STORAGE_KEY, nextSort);
    } catch {
      // Sorting still works for the current visit when storage is blocked.
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;

    setIsUploading(true);
    let uploadedImagePath: string | undefined;

    try {
      if (selectedFile) {
        if (!ALLOWED_IMAGE_TYPES.has(selectedFile.type)) {
          throw new Error("画像はJPEG、PNG、WebP、GIF形式を選択してください。");
        }

        if (selectedFile.size > MAX_IMAGE_SIZE) {
          throw new Error("画像は10MB以下を選択してください。");
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("画像を保存するにはログインが必要です。");
        }

        const rawFileExt = selectedFile.name.includes(".")
          ? selectedFile.name.split(".").pop()?.toLowerCase()
          : undefined;
        const fileExt =
          rawFileExt && /^[a-z0-9]+$/.test(rawFileExt) ? rawFileExt : "png";
        uploadedImagePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("gear-images")
          .upload(uploadedImagePath, selectedFile);

        if (uploadError) {
          throw uploadError;
        }
      }

      const result = await createGearAction({
        name,
        boughtAtDate,
        boughtLocation,
        comment,
        imagePath: uploadedImagePath,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setName("");
      setBoughtLocation("");
      setComment("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      router.refresh();
    } catch (error) {
      if (uploadedImagePath) {
        await supabase.storage.from("gear-images").remove([uploadedImagePath]);
      }

      console.error("Failed to save gadget:", error);
      const message =
        error instanceof Error ? error.message : "不明なエラーが発生しました。";
      alert(`ガジェットの登録に失敗しました: ${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleDisposed = async (id: string) => {
    const gear = gears.find((item) => item.id === id);
    if (!gear) return;

    const result = await updateGearDisposedAction(id, !gear.isDisposed);

    if (!result.success) {
      alert(result.error);
      return;
    }

    router.refresh();
  };

  const deleteGear = async (id: string) => {
    if (!window.confirm("このガジェットの記録を削除しますか？")) return;

    const result = await deleteGearAction(id);

    if (!result.success) {
      alert(result.error);
      return;
    }

    router.refresh();
  };

  const shareToX = async (gear: Gear) => {
    const text = "My new gear...";
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && gear.imageUrl && navigator.share && navigator.canShare) {
      try {
        const response = await fetch(gear.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "mynewgear.png", {
          type: blob.type || "image/png",
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ text, files: [file] });
          return;
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }

    if (
      !isMobile &&
      gear.imageUrl &&
      navigator.clipboard &&
      window.ClipboardItem
    ) {
      try {
        const response = await fetch(gear.imageUrl);
        const blob = await response.blob();
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
      } catch (error) {
        console.warn("クリップボードへの画像コピーをスキップしました:", error);
      }
    }

    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

    if (isMobile) {
      window.location.href = shareUrl;
      return;
    }

    const width = 550;
    const height = 420;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      shareUrl,
      "shareToXWindow",
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
    );
  };

  const filteredGears = gears.filter((gear) => {
    if (filterDisposed === "active") return !gear.isDisposed;
    if (filterDisposed === "disposed") return gear.isDisposed;
    return true;
  });
  const displayedGears = sortGears(filteredGears, sort);
  const selectedGear = gears.find((gear) => gear.id === selectedGearId);

  return (
    <div className="min-h-screen bg-neutral-950 p-4 font-sans text-neutral-100 md:p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="border-b border-neutral-800 pb-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
              <span>📦</span> 僕のマイニューギア
            </h1>
            <AuthStatus />
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            買ったガジェットを手元ですぐ記録。ワンクリックでXにシェアできます。
          </p>
        </header>

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

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-sm font-semibold text-neutral-300">
              記録したガジェット ({filteredGears.length})
            </h2>

            <div className="flex flex-wrap items-end gap-2">
              <label>
                <span className="sr-only">並び順</span>
                <select
                  aria-label="並び順"
                  value={sort}
                  onChange={(event) =>
                    changeSort(event.target.value as GearSort)
                  }
                  className="min-h-9 rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 text-xs text-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {GEAR_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div
                className="flex min-h-9 gap-1 rounded-lg border border-neutral-800 bg-neutral-900 p-1 text-xs"
                aria-label="所持状態で絞り込む"
              >
                {(["all", "active", "disposed"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFilterDisposed(mode)}
                    aria-pressed={filterDisposed === mode}
                    className={`rounded px-2.5 py-1 transition-colors ${
                      filterDisposed === mode
                        ? "bg-neutral-800 font-medium text-white"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {mode === "all"
                      ? "すべて"
                      : mode === "active"
                        ? "所持中"
                        : "手放し済"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {displayedGears.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-800 py-12 text-center text-sm text-neutral-500">
              {gears.length === 0
                ? "まだガジェットが登録されていません。"
                : filterDisposed === "active"
                  ? "所持中のガジェットはありません。"
                  : "手放し済みのガジェットはありません。"}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {displayedGears.map((gear) => (
                <GearCard
                  key={gear.id}
                  gear={gear}
                  onOpen={(item) => setSelectedGearId(item.id)}
                  onShare={shareToX}
                  onToggleDisposed={toggleDisposed}
                  onDelete={deleteGear}
                />
              ))}
            </div>
          )}
        </section>
      </div>
      {selectedGear && (
        <GearDetailModal
          gear={selectedGear}
          onClose={() => setSelectedGearId(null)}
        />
      )}
    </div>
  );
}
