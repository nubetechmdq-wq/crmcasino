
import { GoogleGenAI, Type } from "@google/genai";
import { ValidationResult, Message, User } from "../types";
import { StorageService } from "./mockData";

// Make Gemini optional - only initialize if API key is provided
const GEMINI_API_KEY = (import.meta as unknown as { env: Record<string, string> }).env.VITE_GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

export async function validateReceipt(base64Image: string): Promise<ValidationResult> {
  // If no API key, return mock validation
  if (!ai) {
    console.warn('⚠️ Gemini API key not configured. Using mock validation.');
    return {
      isValid: true,
      amount: 1000,
      transactionId: 'MOCK-' + Date.now(),
      senderName: 'Usuario de Prueba',
      confidence: 0.5,
      date: new Date().toISOString()
    };
  }

  const waSettings = StorageService.getWhatsAppSettings();
  try {
    const response = await ai.models.generateContent({
      model: waSettings.aiModel === 'gemini-3-pro-preview' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Analyze this Mercado Pago receipt screenshot and extract the payment details. 
            Verify if it looks authentic. Return only a JSON object.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            amount: { type: Type.NUMBER },
            transactionId: { type: Type.STRING },
            senderName: { type: Type.STRING },
            date: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["isValid", "amount", "transactionId", "confidence"]
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as ValidationResult;
  } catch (error) {
    console.error("Error validating receipt:", error);
    return { isValid: false, confidence: 0 };
  }
}

export async function generateWhatsAppResponse(
  history: Message[],
  player: User,
  adminName: string
): Promise<string> {
  // If no API key, return default message
  if (!ai) {
    console.warn('⚠️ Gemini API key not configured. Using default response.');
    return `Hola ${player.name}, ¿en qué puedo ayudarte hoy? 🎰`;
  }

  try {
    const waSettings = StorageService.getWhatsAppSettings();
    const paySettings = StorageService.getPaymentSettings();

    let customPrompt = waSettings.aiPrompt
      .replace(/{{nombre_jugador}}/g, player.name)
      .replace(/{{saldo}}/g, player.balance.toLocaleString())
      .replace(/{{titular}}/g, paySettings.holderName)
      .replace(/{{alias}}/g, paySettings.alias)
      .replace(/{{cajero}}/g, adminName);

    const chatContext = history.slice(-5).map(m =>
      `${m.isIncoming ? 'Jugador' : 'Soporte'}: ${m.text}`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: waSettings.aiModel,
      contents: `INSTRUCCIONES DE PERSONALIDAD:\n${customPrompt}\n\nHISTORIAL RECIENTE DEL CHAT:\n${chatContext}\n\nResponde solo con el texto del mensaje para el jugador.`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "Hola, ¿en qué puedo ayudarte hoy? 🎰";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Lo siento, hubo un problema técnico con la IA. 🎰";
  }
}

/**
 * Función simple para testear la conexión
 */
export async function testAiConnection(): Promise<boolean> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "ping",
    });
    return !!response.text;
  } catch {
    return false;
  }
}
