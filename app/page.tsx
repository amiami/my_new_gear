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
  const gears: Gear[] = await Promise.all(rows.map(async (row) => {
    let imageUrl: string | undefined;

    if (row.image_path) {
      const { data, error } = await supabase.storage
        .from("gear-images")
        .createSignedUrl(row.image_path, 60 * 60);

      if (error) {
        console.error("Failed to create a signed image URL:", error);
      } else {
        imageUrl = data.signedUrl;
      }
    }

    return {
      id: row.id,
      name: row.name,
      boughtAtDate: row.bought_at ?? "",
      boughtLocation: row.bought_location,
      comment: row.comment,
      imagePath: row.image_path ?? undefined,
      imageUrl,
      shareId: row.gear_shares?.share_id,
      isDisposed: row.is_disposed,
      createdAt: row.created_at,
    };
  }));

  return <GearApp gears={gears} />;
}
