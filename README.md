# 내 블로그

Node.js + Express + Neon PostgreSQL로 만든 개인 블로그입니다.

## 실행 방법

1. Neon 대시보드(https://console.neon.tech)에서 프로젝트를 만들고 Connection string을 복사합니다.
2. `.env.example`을 `.env`로 복사한 뒤, `DATABASE_URL`과 `ADMIN_USER`/`ADMIN_PASSWORD` 값을 채워 넣습니다.
   ```bash
   cp .env.example .env
   ```
3. 설치 및 실행:
   ```bash
   npm install
   npm start
   ```
4. 브라우저에서 http://localhost:3000 접속

첫 실행 시 `blog_posts` 테이블이 자동 생성되고, 예시 글 2개가 시드로 들어갑니다. (기존 `posts` 테이블과 이름이 겹치지 않도록 `blog_posts`로 분리했습니다.)

## 구조

- `server.js` — Express 서버, REST API (/api/posts)
- `db.js` — pg Pool 연결 + 테이블 초기화 (Neon은 SSL 필수라 `ssl: { rejectUnauthorized: false }` 설정됨)
- `public/` — 프론트엔드 (index.html: 목록, post.html: 상세, write.html: 글쓰기)
- `.env` — DB 연결 정보 (커밋하지 마세요, .gitignore에 포함되어 있음)

## 주의사항

- **`.env`는 절대 깃허브에 올리지 마세요.** `.gitignore`에 이미 포함돼 있습니다.
- Render.com에 배포할 때는 환경변수 탭에 `DATABASE_URL`, `ADMIN_USER`, `ADMIN_PASSWORD`를 등록하면 됩니다.
- `/write.html` 페이지와 글 작성/수정/삭제 API는 Basic Auth로 보호됩니다. 브라우저에서 처음 `/write.html`에 접속하면 아이디/비밀번호를 묻는 팝업이 뜨고, `.env`에 설정한 `ADMIN_USER`/`ADMIN_PASSWORD`를 입력해야 접근할 수 있습니다.
- 글 목록/상세 보기는 인증 없이 누구나 볼 수 있습니다 (읽기는 공개, 쓰기만 제한).
- `ADMIN_PASSWORD`는 충분히 길고 예측하기 어려운 값으로 설정하세요. Basic Auth는 HTTPS 위에서만 안전하므로 (Render는 기본적으로 HTTPS 제공), 로컬 http로 접속할 땐 크게 신경 쓰지 않아도 되지만 배포 후엔 꼭 https 주소로 접속하세요.

## Render spin-down 방지 (GitHub Actions)

`.github/workflows/keep-alive.yml`이 10분마다 아래 4개 사이트에 ping을 보내서 Render 무료 티어의 15분 spin-down 타이머를 계속 리셋합니다.

- https://raphael-54q0.onrender.com (이 블로그)
- https://apt-survival.onrender.com
- https://gismap.onrender.com
- https://portfolio-7f4l.onrender.com

- 이 저장소를 GitHub에 푸시하면 자동으로 활성화됩니다. 별도 설정 필요 없음.
- Actions 탭에서 "Keep Render app awake" 워크플로우 실행 기록을 확인할 수 있습니다.
- 참고: 이건 Render가 공식 지원하는 방법은 아니고, 어디까지나 무료 티어에서 쓸 수 있는 우회책입니다. GitHub Actions의 스케줄은 정확히 10분마다 보장되지는 않고 몇 분 정도 밀릴 수 있어서, 아주 가끔은 spin-down을 못 막을 수도 있습니다. 완전히 확실하게 하려면 Render Starter 플랜($7/월)이 정식 해결책입니다.
- URL이 바뀌면 `.github/workflows/keep-alive.yml` 안의 주소도 함께 바꿔주세요.

## 다음 단계로 해볼 만한 것들

- 다크/라이트 모드 토글
- 글 수정/삭제 UI (API는 이미 구현됨: PUT/DELETE /api/posts/:id)
- 태그별 필터링, 검색 기능
