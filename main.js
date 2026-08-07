// 터미널 티커: 태그들을 타이핑 애니메이션으로 순환
const phrases = [
  'writing --about=game-dev, maps, local-llm',
  'currently: RAG + pgvector 실험 중',
  'stack: node.js, postgresql, cesiumjs',
];
let pIndex = 0, cIndex = 0, deleting = false;
const tickerEl = document.getElementById('ticker-text');

function tick() {
  const current = phrases[pIndex];
  if (!deleting) {
    cIndex++;
    tickerEl.textContent = current.slice(0, cIndex);
    if (cIndex === current.length) {
      deleting = true;
      setTimeout(tick, 1800);
      return;
    }
  } else {
    cIndex--;
    tickerEl.textContent = current.slice(0, cIndex);
    if (cIndex === 0) {
      deleting = false;
      pIndex = (pIndex + 1) % phrases.length;
    }
  }
  setTimeout(tick, deleting ? 30 : 55);
}
tick();

// 글 목록 불러오기
function timeAgo(dateStr) {
  const d = new Date(dateStr.replace(' ', 'T'));
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function loadFeed() {
  const feed = document.getElementById('feed');
  try {
    const res = await fetch('/api/posts');
    const posts = await res.json();

    if (posts.length === 0) {
      feed.innerHTML = `<div class="empty-state">아직 글이 없습니다. 첫 글을 써보세요 →</div>`;
      return;
    }

    feed.innerHTML = posts.map((p, i) => `
      <a href="/post.html?slug=${encodeURIComponent(p.slug)}" class="post-card" style="animation-delay:${i * 0.06}s">
        <span class="post-date">${timeAgo(p.created_at)}</span>
        <h2>${escapeHtml(p.title)}</h2>
        ${p.excerpt ? `<p class="post-excerpt">${escapeHtml(p.excerpt)}</p>` : ''}
        <div class="post-tags">
          ${(p.tags || '').split(',').filter(Boolean).map(t => `<span class="tag">#${escapeHtml(t.trim())}</span>`).join('')}
        </div>
      </a>
    `).join('');
  } catch (e) {
    feed.innerHTML = `<div class="empty-state">글을 불러오지 못했습니다.</div>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadFeed();
