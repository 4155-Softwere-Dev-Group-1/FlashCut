const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function testDefinitionGeneration() {
  const term = "ameliorate";
  const sentence = "The medication helps ameliorate chronic pain.";
  
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `Define the term "${term}" as used in this sentence: "${sentence}". 
        Provide a clear, 2-3 sentence definition that explains the meaning in this specific context.`
      }]
    });
    
    const definition = response.content[0].text;
    console.log('Claude Generated Definition:');
    console.log(definition);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDefinitionGeneration();