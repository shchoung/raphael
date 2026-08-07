require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL이 설정되지 않았습니다. .env 파일을 확인하세요 (.env.example 참고).');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon은 SSL 필수
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      tags TEXT DEFAULT '',
      published BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM posts');
  if (rows[0].c === 0) {
    await pool.query(
      `INSERT INTO posts (title, slug, excerpt, content, tags) VALUES ($1,$2,$3,$4,$5)`,
      [
        '블로그를 시작하며',
        'starting-this-blog',
        '게임 서버 로그와 지도 타일 사이 어딘가에서, 기록을 남기기로 했다.',
        `## 왜 블로그를 시작했나\n\n로컬 LLM을 붙잡고 씨름하다가, 문득 이 과정을 어디에도 기록하지 않고 있다는 걸 깨달았다.\n\n이 공간은 다음을 위한 곳이다:\n\n- 삽질의 기록 (버그, 삽질, 삽질 끝의 해결)\n- 만들고 있는 것들 소개\n- 가끔은 그냥 생각 정리\n\n\`\`\`bash\n$ echo "let's build in public"\n\`\`\`\n\n천천히, 꾸준히 써보려 한다.`,
        'meta,시작',
      ]
    );
    await pool.query(
      `INSERT INTO posts (title, slug, excerpt, content, tags) VALUES ($1,$2,$3,$4,$5)`,
      [
        'RTX 3070 Ti로 로컬 LLM 굴리기',
        'local-llm-rtx-3070ti',
        '8GB VRAM으로 어디까지 갈 수 있을까 — qwen2.5:7b와 함께한 기록.',
        `## 환경\n\n- GPU: RTX 3070 Ti (8GB VRAM)\n- 모델: qwen2.5:7b (한국어 처리용)\n- 도구: Ollama\n\n## 다음 목표\n\npgvector를 활용한 RAG 파이프라인 구축. PostgreSQL에 문서를 임베딩해두고, 로컬 모델이 이를 참조해 답하도록 만드는 것이 목표다.\n\n진행 상황은 계속 업데이트할 예정.`,
        'llm,ollama,rag',
      ]
    );
  }
}

module.exports = { pool, init };
