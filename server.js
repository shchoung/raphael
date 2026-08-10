const express = require('express');
const path = require('path');
const { marked } = require('marked');
const { pool, init } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD) {
  console.error('ADMIN_USER / ADMIN_PASSWORD가 설정되지 않았습니다. .env 파일을 확인하세요 (.env.example 참고).');
  process.exit(1);
}

// 글쓰기/수정/삭제 및 /write.html 접근을 제한하는 Basic Auth 미들웨어
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Basic ')) {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
    const sepIndex = decoded.indexOf(':');
    const user = decoded.slice(0, sepIndex);
    const pass = decoded.slice(sepIndex + 1);
    if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASSWORD) {
      return next();
    }
  }
  res.set('WWW-Authenticate', 'Basic realm="blog-admin"');
  return res.status(401).send('인증이 필요합니다.');
}

app.use(express.json());

// write.html은 정적 서빙보다 먼저 가로채서 인증을 건다
app.get('/write.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'write.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\u3131-\uD79D\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// 목록 (published만, 최신순)
app.get('/api/posts', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, title, slug, excerpt, tags, created_at
      FROM blog_posts WHERE published = true
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// 단일 글
app.get('/api/posts/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM blog_posts WHERE slug = $1', [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ error: 'not found' });
    const row = rows[0];
    row.contentHtml = marked.parse(row.content);
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// 새 글 작성
app.post('/api/posts', requireAuth, async (req, res) => {
  try {
    const { title, excerpt, content, tags } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title, content required' });

    let slug = slugify(title) || `post-${Date.now()}`;
    const exists = await pool.query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
    if (exists.rows.length > 0) slug = `${slug}-${Date.now()}`;

    const { rows } = await pool.query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, tags) VALUES ($1,$2,$3,$4,$5) RETURNING id, slug`,
      [title, slug, excerpt || '', content, tags || '']
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// 글 수정
app.put('/api/posts/:id', requireAuth, async (req, res) => {
  try {
    const { title, excerpt, content, tags, published } = req.body;
    await pool.query(
      `UPDATE blog_posts SET title=$1, excerpt=$2, content=$3, tags=$4, published=$5, updated_at=NOW() WHERE id=$6`,
      [title, excerpt || '', content, tags || '', !!published, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// 글 삭제
app.delete('/api/posts/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM blog_posts WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✓ 블로그 서버 실행 중: http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error('DB 초기화 실패:', e.message);
    process.exit(1);
  });
