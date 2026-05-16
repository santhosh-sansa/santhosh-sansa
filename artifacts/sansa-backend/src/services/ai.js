function hasOpenAIKey() {
  return false;
}

async function embedText(text) {
  return null;
}

async function answerWithContext(question, contexts) {
  return {
    ok: false,
    answer: '',
    error: 'Free search mode uses local knowledge and public web sources without OpenAI.',
  };
}

module.exports = { embedText, answerWithContext, hasOpenAIKey };
