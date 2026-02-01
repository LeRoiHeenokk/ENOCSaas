import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protéger /dashboard/* : rediriger vers /login si non connecté
  if (path.startsWith("/dashboard") && !user) {
    const redirectUrl = new URL("/login", request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((c) =>
      redirectResponse.cookies.set(c.name, c.value)
    );
    return redirectResponse;
  }

  // Si déjà connecté sur /login ou /onboarding, rediriger vers /dashboard
  if ((path === "/login" || path.startsWith("/login") || path === "/onboarding") && user) {
    const redirectUrl = new URL("/dashboard", request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((c) =>
      redirectResponse.cookies.set(c.name, c.value)
    );
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
