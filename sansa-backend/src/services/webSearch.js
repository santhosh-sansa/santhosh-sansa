async function buildFreeWebAnswer(message) {
  if (process.env.FREE_WEB_SEARCH !== 'true') {
    return { ok: false, answer: '', sources: [] };
  }

  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(message)}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SANSA-AI/1.0' },
    });
    if (!response.ok) return { ok: false, answer: '', sources: [] };
    const data = await response.json();
    const topics = Array.isArray(data.RelatedTopics) ? data.RelatedTopics : [];
    const sources = topics
      .flatMap((item) => (Array.isArray(item.Topics) ? item.Topics : [item]))
      .filter((item) => item.Text && item.FirstURL)
      .slice(0, 5)
      .map((item, index) => ({
        title: item.Text.slice(0, 90),
        url: item.FirstURL,
        score: 5 - index,
      }));

    const answer = [
      data.AbstractText || '',
      ...sources.map((item, index) => `${index + 1}. ${item.title}`),
    ].filter(Boolean).join('\n');

    return {
      ok: Boolean(answer),
      answer,
      sources,
    };
  } catch (error) {
    return { ok: false, answer: '', sources: [] };
  }
}

module.exports = { buildFreeWebAnswer };
