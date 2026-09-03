"use server";

import { revalidatePath } from "next/cache";

import {
  createGear,
  deleteGear,
  updateGearDisposed,
} from "@/lib/gearRepository";

export type GearActionResult =
  | { success: true }
  | { success: false; error: string };

export type CreateGearActionInput = {
  name: string;
  boughtAtDate: string;
  boughtLocation: string;
  comment: string;
  imagePath?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export async function createGearAction(
  input: CreateGearActionInput,
): Promise<GearActionResult> {
  const name = input.name.trim();
  const boughtAtDate = input.boughtAtDate.trim();
  const boughtLocation = input.boughtLocation.trim();
  const comment = input.comment.trim();
  const imagePath = input.imagePath?.trim() || null;

  if (!name || name.length > 200) {
    return {
      success: false,
      error: "品名は1文字以上200文字以内で入力してください。",
    };
  }

  if (boughtAtDate && !isValidDate(boughtAtDate)) {
    return { success: false, error: "購入日を正しく入力してください。" };
  }

  try {
    await createGear({
      name,
      bought_at: boughtAtDate || null,
      bought_location: boughtLocation,
      comment,
      image_path: imagePath,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to create gear:", error);
    return { success: false, error: "ガジェットの登録に失敗しました。" };
  }
}

export async function updateGearDisposedAction(
  id: string,
  isDisposed: boolean,
): Promise<GearActionResult> {
  if (!UUID_PATTERN.test(id) || typeof isDisposed !== "boolean") {
    return { success: false, error: "更新内容が正しくありません。" };
  }

  try {
    await updateGearDisposed(id, isDisposed);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update gear:", error);
    return { success: false, error: "ガジェットの更新に失敗しました。" };
  }
}

export async function deleteGearAction(
  id: string,
): Promise<GearActionResult> {
  if (!UUID_PATTERN.test(id)) {
    return { success: false, error: "削除対象が正しくありません。" };
  }

  try {
    await deleteGear(id);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete gear:", error);
    return { success: false, error: "ガジェットの削除に失敗しました。" };
  }
}
