const { GoogleGenAI } = require("@google/genai");

// Initialize the new SDK client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ✅ Shared Prompt Function for Consistent Style
const getHinglishPrompt = (text) => {
  return `
  Task: Summarize this news in casual "Hinglish" (Hindi written in English script).
  
  Strict Rules:
  1. Script: Use ONLY the English alphabet. NO Devanagari script.
  2. Tone: Casual, layman, conversational (like talking to a friend).
  3. Style: Use simple English for technical terms, but Hindi grammar/fillers.
     - Bad: "Vartamaan mein sthiti gambhir hai." (Too formal)
     - Good: "Abhi situation thodi serious hai boss." (Perfect layman style)
  4. Length: Keep it under 60 words.
  
  News to summarize: "${text}"
  `;
};

// ✅ Convert a single article's description to Hinglish
const convertToHinglish = async (title, description) => {
  try {
    const prompt = getHinglishPrompt(`${title}. ${description}`);
    
    // ✅ New SDK Syntax
    const { text } = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return text.trim();
  } catch (error) {
    console.error(`Hinglish conversion failed: ${error.message}`);
    throw error;
  }
};

module.exports = { getHinglishPrompt, convertToHinglish };
