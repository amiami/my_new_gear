import { redirect } from "next/navigation";

import GearApp from "@/components/GearApp";
import { listGears } from "@/lib/gearRepository";
import { createClient } from "@/lib/supabase/server";
import type { Gear } from "@/types/gear";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const rows = await listGears();
  const gears: Gear[] = rows.map((row) => {
    const imageUrl = row.image_path
      ? supabase.storage.from("gear-images").getPublicUrl(row.image_path).data
          .publicUrl
      : undefined;

    return {
      id: row.id,
      name: row.name,
      boughtAtDate: row.bought_at ?? "",
      boughtLocation: row.bought_location,
      comment: row.comment,
      imagePath: row.image_path ?? undefined,
      imageUrl,
      isDisposed: row.is_disposed,
      createdAt: row.created_at,
    };
  });

  return <GearApp gears={gears} />;
}
