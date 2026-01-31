import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
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
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options })
              =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { 
      data: { user }, 
    } = await supabase.auth.getUser();

    // AUTH PROTECTIONS
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                       request.nextUrl.pathname.startsWith('/signup');
    const isDashboardPage = request.nextUrl.pathname === '/' || 
                             request.nextUrl.pathname.startsWith('/dashboard');
    const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding');

    // 1. 미인증 -> 로그인 (대시보드 또는 온보딩 접근 시)
    if (!user && (isDashboardPage || isOnboardingPage)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. 인증됨 -> 대시보드로 (로그인/회원가입 페이지 접근 시)
    if (user && isAuthPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 3. 인증됨 -> 프로필 및 가입 신청 여부에 따른 리다이렉션
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, dojo_id, role')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .maybeSingle();

      const isStaff = profile?.role === 'owner' || profile?.role === 'instructor';
      const isAdminPage = request.nextUrl.pathname.startsWith('/members') || 
                          request.nextUrl.pathname.startsWith('/attendance');

      // 3-1. 관리자 페이지 접근 권한 체크
      if (isAdminPage && !isStaff) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // 3-2. 프로필이 있는 경우
      if (profile?.dojo_id) {
        if (isOnboardingPage) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      } 
      // 3-3. 프로필이 없는 경우
      else {
        // 가입 신청 여부 확인
        const { data: signupRequest } = await supabase
          .from('signup_requests')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();

        // 신청 중인데 온보딩 메인이나 대시보드에 있으면 상태 페이지로
        if (signupRequest && (request.nextUrl.pathname === '/onboarding' || isDashboardPage)) {
          return NextResponse.redirect(new URL("/onboarding/status", request.url));
        }
        
        // 신청도 없고 프로필도 없는데 대시보드 접근 시 온보딩으로
        if (!signupRequest && isDashboardPage) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
      }
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next.js Config instructions.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};