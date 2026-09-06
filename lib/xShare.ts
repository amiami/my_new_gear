const X_SHARE_TEXT = "My new gear...\n\n#僕のマイニューギア #MyNewGear";

export function buildPublicGearUrl(origin: string, shareId: string) {
  return `${origin.replace(/\/$/, "")}/gadgets/${shareId}`;
}

export function buildXShareText(publicUrl: string) {
  return `${X_SHARE_TEXT}\n${publicUrl}`;
}

export function buildXIntentUrl(publicUrl: string) {
  const params = new URLSearchParams({ text: buildXShareText(publicUrl) });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}
