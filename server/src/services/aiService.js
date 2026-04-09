// AI service for flashcard generation

const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function generateFlashcard(term, sentence) {
  try {
    console.log(`[AI] Generating flashcard for term: "${term}"`);
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `You are a vocabulary flashcard generator. Given a term and its context sentence, generate a flashcard.

Term: "${term}"
Context: "${sentence}"

Respond with ONLY a JSON object in this exact format:
{"question": "What does '${term}' mean?", "answer": "<clear 1-2 sentence definition based on context>"}`
      }]
    });

    const raw = response.content[0].text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
    const json = JSON.parse(raw);
    console.log(`[AI] Generated — Q: "${json.question}" | A: "${json.answer}"`);
    return { question: json.question, answer: json.answer };
  } catch (error) {
    console.error('AI generation error:', error.message);
    throw error;
  }
}

async function simplifyText(text) {
  try {
    console.log(`[AI] Simplifying passage (${text.length} chars)`);
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `You help readers understand difficult text. Rewrite the passage below in simpler, clearer English. Preserve the original meaning. Output only the simplified text—no title, quotes, or explanation.

Passage:
${text}`,
      }]
    });

    const simplified = response.content[0].text.trim();
    console.log(`[AI] Simplified (${simplified.length} chars)`);
    return { simplified };
  } catch (error) {
    console.error('AI simplify error:', error.message);
    throw error;
  }
}

module.exports = {
  generateFlashcard,
  simplifyText,
};
