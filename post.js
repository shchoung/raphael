function timeAgo(dateStr) {
  const d = new Date(dateStr.replace(' ', 'T'));
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function loadPost() {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const wrap = document.getElementById('post-wrap');

  if (!slug) {
    wrap.innerHTML = `<p class="empty-state">글을 찾을 수 없습니다.</p>`;
    return;
  }

  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('not found');
    const post = await res.json();

    document.title = `${post.title} — log()`;
    wrap.innerHTML = `
      <header class="post-header">
        <span class="post-date">${timeAgo(post.created_at)}</span>
        <h1>${escapeHtml(post.title)}</h1>
        <div class="post-tags">
          ${(post.tags || '').split(',').filter(Boolean).map(t => `<span class="tag">#${escapeHtml(t.trim())}</span>`).join('')}
        </div>
      </header>
      <article class="post-body">${post.contentHtml}</article>
    `;
  } catch (e) {
    wrap.innerHTML = `<p class="empty-state">글을 찾을 수 없습니다.</p>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadPost();
