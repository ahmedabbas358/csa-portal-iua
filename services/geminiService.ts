import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// Note: In a real production app, ensure the API key is handled securely. 
// For this frontend-only demo, we assume the environment variable is injected.

const ai = new GoogleGenAI({ apiKey });

export const generateContentHelper = async (
  prompt: string, 
  language: 'en' | 'ar'
): Promise<string> => {
  try {
    const systemInstruction = language === 'ar' 
      ? 'أنت مساعد ذكي لجمعية طلابية للحاسوب. ساعد في كتابة محتوى احترافي وجذاب للإعلانات والفعاليات.'
      : 'You are an AI assistant for a Computer Science Student Association. Help write professional and engaging content for announcements and events.';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
