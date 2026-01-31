import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  try {
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

    const { data: { user } } = await supabase.auth.getUser();

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
    const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding');
    const isDashboardPage = request.nextUrl.pathname === '/' || 
                             request.nextUrl.pathname.startsWith('/dashboard') ||
                             request.nextUrl.pathname.startsWith('/members') ||
                             request.nextUrl.pathname.startsWith('/training') ||
                             request.nextUrl.pathname.startsWith('/attendance');
    
    const isProtectedRoute = !isAuthPage && !isOnboardingPage && !request.nextUrl.pathname.startsWith('/api') && !request.nextUrl.pathname.includes('.');

    // 1. 미인증 보호
    if (!user && isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. 인증됨 -> 대시보드로
    if (user && isAuthPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (user) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, dojo_id, role')
        .eq('user_id', user.id)
        .is('deleted_at', null);

      // 복수 프로필 중 하나라도 사범/관장이면 스태프로 인정
      const isStaff = profiles?.some(p => ['owner', 'instructor'].includes(p.role || '')) || false;
      const hasAnyDojo = profiles?.some(p => p.dojo_id) || false;

      const isAdminPage = request.nextUrl.pathname.startsWith('/members') || 
                          request.nextUrl.pathname.startsWith('/attendance') ||
                          request.nextUrl.pathname.startsWith('/training');

      // 3-1. 관리자 전용 페이지 접근 권한 체크
      if (isAdminPage && !isStaff) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // 3-2. 도장 소속 여부에 따른 온보딩 리다이렉트
      if (hasAnyDojo) {
        if (isOnboardingPage) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      } else {
        // 도장도 없고 프로필도 없는 경우 가입 신청 확인
        const { data: signupRequests } = await supabase
          .from('signup_requests')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('status', 'pending');

        const signupRequest = signupRequests?.[0];

        if (signupRequest && (request.nextUrl.pathname === '/onboarding' || isDashboardPage)) {
          return NextResponse.redirect(new URL("/onboarding/status", request.url));
        }
        
        if (!signupRequest && isDashboardPage && !isOnboardingPage) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
      }
    }

    return response;
  } catch (e) {
    console.error("Middleware Error:", e);
    return NextResponse.next({ request: { headers: request.headers } });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};