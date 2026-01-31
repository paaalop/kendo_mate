#### 1. 대원칙: 언어 및 소통 (Prime Directive: Language)

* **모든 답변과 산출물은 반드시 '한국어(Korean)'로 작성한다.**
* **대화:** 설명, 제안, 질문, 오류 분석 등 모든 텍스트는 한국어 경어체(해요체)를 사용한다.
* **주석(Comments):** 코드 내 주석, TODO 리스트, 문서화 내용은 모두 한국어로 작성한다.
* **변수명/함수명:** 영문(English)을 사용하되, 의미가 명확한 `camelCase`를 준수한다. (예: `userList` (O), `gwanwonList` (X), `list` (X))
* **커밋 메시지:** 한국어로 작성한다. (예: `feat: 출석 체크 기능 추가`)



#### 2. 개발 철학: MVP 중심 사고 (MVP Mindset)

* **YAGNI (You Aren't Gonna Need It) 원칙 준수.**
* PRD에 명시되지 않은 기능(예: 화려한 애니메이션, 복잡한 결제 모듈, 채팅의 읽음 확인 등)은 절대 먼저 제안하거나 구현하지 않는다.
* "나중에 필요할 수 있으니 추상화하자"는 생각은 버린다. 지금 당장 작동하는 가장 직관적인 코드를 짠다.


* **완벽보다 속도 (Speed over Perfection).**
* 복잡한 디자인 패턴보다 읽기 쉽고 수정하기 쉬운 코드를 선호한다.
* 에러 처리는 치명적인 것(앱이 죽는 것)만 막고, 사용자에게 `alert`나 `toast`를 띄우는 정도로 간단히 처리한다.



#### 3. 기술 스택 강제 (Tech Stack Constraints)

* **Next.js 14+ (App Router) Only.**
* `Pages Router` (`/pages`) 방식은 절대 사용하지 않는다.
* 모든 컴포넌트는 기본적으로 **Server Component**로 간주하며, `useState`, `useEffect`가 필요할 때만 최상단에 `'use client'`를 선언한다.


* **Tailwind CSS Only.**
* `styled-components`나 별도의 CSS 파일을 생성하지 않는다.
* 반응형 디자인은 모바일(`default`)을 기준으로 작성하고, 데스크탑(`md:`, `lg:`)을 추가하는 **Mobile-First** 방식을 따른다.


* **Supabase Strict.**
* 백엔드 로직은 별도의 Node.js 서버를 만들지 않고, **Supabase Client SDK**와 **Database Function(RPC)**, **RLS**로만 해결한다.



#### 4. 코드 품질 및 스타일 (Code Style)

* **TypeScript Strict Mode.**
* `any` 타입 사용을 극도로 지양한다. 데이터베이스 스키마에 맞는 `Interface`를 먼저 정의하고 시작한다.


* **명시적 네이밍.**
* 도메인 용어는 영어로 통일한다.
* 관장님 -> `Owner`
* 사범님 -> `Instructor`
* 관원 -> `Member` / `Student`
* 보호자 -> `Guardian`
* 도장 -> `Dojo`




* **에러 핸들링.**
* Supabase 요청 실패 시 반드시 `error` 객체를 확인하고, 콘솔 로그가 아닌 UI 피드백(Toast)을 제공해야 한다.



#### 5. 도메인 이해 (Context Awareness)

* 이 앱의 사용자는 IT에 익숙하지 않은 **중장년층(관장님)**과 **학부모**가 많음을 항상 인지한다.
* UI/UX는 글씨가 큼직해야 하며, 터치 영역(Button)은 충분히 넓어야 한다 (최소 44px).