# 내 블로그

Node.js + Express + Neon PostgreSQL로 만든 개인 블로그입니다.

## 실행 방법

1. Neon 대시보드(https://console.neon.tech)에서 프로젝트를 만들고 Connection string을 복사합니다.
2. `.env.example`을 `.env`로 복사한 뒤, `DATABASE_URL` 값을 채워 넣습니다.
   ```bash
   cp .env.example .env
   ```
3. 설치 및 실행:
   ```bash
   npm install
   npm start
   ```
4. 브라우저에서 http://localhost:3000 접속

첫 실행 시 테이블이 자동 생성되고, 예시 글 2개가 시드로 들어갑니다.

## 구조

- `server.js` — Express 서버, REST API (/api/posts)
- `db.js` — pg Pool 연결 + 테이블 초기화 (Neon은 SSL 필수라 `ssl: { rejectUnauthorized: false }` 설정됨)
- `public/` — 프론트엔드 (index.html: 목록, post.html: 상세, write.html: 글쓰기)
- `.env` — DB 연결 정보 (커밋하지 마세요, .gitignore에 포함되어 있음)

## 주의사항

- **`.env`는 절대 깃허브에 올리지 마세요.** `.gitignore`에 이미 포함돼 있습니다.
- Render.com에 배포할 때는 환경변수 탭에 `DATABASE_URL`을 그대로 등록하면 됩니다.
- 지금은 `/write.html`에 인증이 없어서 누구나 글을 쓸 수 있습니다. 배포 전에 간단한 비밀번호 체크라도 추가하는 걸 추천합니다.

## 다음 단계로 해볼 만한 것들

- 글쓰기 페이지 인증 추가
- 다크/라이트 모드 토글
- 글 수정/삭제 UI (API는 이미 구현됨: PUT/DELETE /api/posts/:id)
- 태그별 필터링, 검색 기능
