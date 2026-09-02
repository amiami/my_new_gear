import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const flowId = requestUrl.searchParams.get("sb_flow_id");
  const requestedPath = requestUrl.searchParams.get("next") ?? "/";
  const nextPath = requestedPath.startsWith("/") ? requestedPath : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined
    );

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProtocol =
        request.headers.get("x-forwarded-proto") ?? "https";

      if (process.env.NODE_ENV !== "development" && forwardedHost) {
        return NextResponse.redirect(
          `${forwardedProtocol}://${forwardedHost}${nextPath}`
        );
      }

      return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=oauth_callback", requestUrl.origin)
  );
}
