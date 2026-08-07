const express = require('express');
const path = require('path');
const { marked } = require('marked');
const { pool, init } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
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
      FROM posts WHERE published = true
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
    const { rows } = await pool.query('SELECT * FROM posts WHERE slug = $1', [req.params.slug]);
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
app.post('/api/posts', async (req, res) => {
  try {
    const { title, excerpt, content, tags } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title, content required' });

    let slug = slugify(title) || `post-${Date.now()}`;
    const exists = await pool.query('SELECT id FROM posts WHERE slug = $1', [slug]);
    if (exists.rows.length > 0) slug = `${slug}-${Date.now()}`;

    const { rows } = await pool.query(
      `INSERT INTO posts (title, slug, excerpt, content, tags) VALUES ($1,$2,$3,$4,$5) RETURNING id, slug`,
      [title, slug, excerpt || '', content, tags || '']
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// 글 수정
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { title, excerpt, content, tags, published } = req.body;
    await pool.query(
      `UPDATE posts SET title=$1, excerpt=$2, content=$3, tags=$4, published=$5, updated_at=NOW() WHERE id=$6`,
      [title, excerpt || '', content, tags || '', !!published, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// 글 삭제
app.delete('/api/posts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
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
