import { downloadPublishedGearImage } from "@/lib/publicGearRepository";

export const dynamic = "force-dynamic";

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function notFoundResponse() {
  return new Response(null, {
    status: 404,
    headers: RESPONSE_HEADERS,
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> },
) {
  const { shareId } = await params;
  const image = await downloadPublishedGearImage(shareId);

  if (!image || !ALLOWED_IMAGE_TYPES.has(image.type)) {
    return notFoundResponse();
  }

  return new Response(image.stream(), {
    headers: {
      ...RESPONSE_HEADERS,
      "Content-Disposition": "inline",
      "Content-Type": image.type,
    },
  });
}
