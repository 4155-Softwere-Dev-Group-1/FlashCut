// OpenAI configuration (compatible with OpenAI Node SDK v4+)

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openai;
