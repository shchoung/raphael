const form = document.getElementById('write-form');
const status = document.getElementById('write-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = '발행 중...';

  const body = {
    title: document.getElementById('f-title').value.trim(),
    excerpt: document.getElementById('f-excerpt').value.trim(),
    tags: document.getElementById('f-tags').value.trim(),
    content: document.getElementById('f-content').value.trim(),
  };

  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '발행 실패');

    status.textContent = '발행 완료! 이동 중...';
    setTimeout(() => {
      location.href = `/post.html?slug=${encodeURIComponent(data.slug)}`;
    }, 500);
  } catch (err) {
    status.textContent = `오류: ${err.message}`;
  }
});
