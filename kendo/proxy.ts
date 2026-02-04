import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  try {
    // 1. 초기 응답 객체 생성
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.next({ request: { headers: request.headers } });
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request: { headers: request.headers } });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      }
    );

    // 2. 인증 상태 확인
    const { data: { user } } = await supabase.auth.getUser();

    // 3. URL 패턴 확인
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
    const isProtectedRoute = !isAuthPage && !request.nextUrl.pathname.startsWith('/api') && !request.nextUrl.pathname.includes('.');

    // 4. 리다이렉션 로직
    if (!user && isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user && isAuthPage) {
      return NextResponse.redirect(new URL("/community", request.url));
    }

    // 5. [핵심 최적화] 인증된 사용자 정보를 헤더에 주입하여 서버 컴포넌트 전달
    if (user) {
      response.headers.set('x-user-id', user.id);
    }

    return response;
  } catch (e) {
    console.error("Proxy Error:", e);
    return NextResponse.next({ request: { headers: request.headers } });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
