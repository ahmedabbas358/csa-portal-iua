import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
};

// Lazy initialization to prevent app crash if key is missing
let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (ai) return ai;

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }

  try {
    ai = new GoogleGenAI({ apiKey });
    return ai;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
    return null;
  }
};

export const generateContentHelper = async (
  prompt: string,
  language: 'en' | 'ar'
): Promise<string> => {
  try {
    const client = getAIClient();

    if (!client) {
      return language === 'ar'
        ? 'يرجى تكوين مفتاح API للذكاء الاصطناعي (GEMINI_API_KEY) لتفعيل هذه الميزة.'
        : 'Please configure the AI API Key (GEMINI_API_KEY) to enable this feature.';
    }

    const systemInstruction = language === 'ar'
      ? 'أنت مساعد ذكي لجمعية طلابية للحاسوب. ساعد في كتابة محتوى احترافي وجذاب للإعلانات والفعاليات.'
      : 'You are an AI assistant for a Computer Science Student Association. Help write professional and engaging content for announcements and events.';

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || '';
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'ar'
      ? 'عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.'
      : 'Sorry, an error occurred while connecting to the AI.';
  }
};
