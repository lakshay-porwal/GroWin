import { AppState } from '../types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const generateChatResponse = async (userMessage: string, context: AppState): Promise<string> => {
  try {
    const u = context.currentUser;
    const prompt = `You are a helpful, professional, and friendly AI financial assistant in the 'GroWin' app. 
The user is a student or young adult learning about investments, expenses, and savings.
Here is the user's current profile context:
- Name: ${u?.name ?? 'User'}
- Role: ${u?.role ?? 'student'}
- Risk Profile: ${u?.riskProfile || 'Unknown'}
- Wallet Balance: ₹${context.walletBalance}
- Total Savings Goals: ${context.goals.length}
- Total Investments: ${context.investments.length}

The user asks: "${userMessage}"

Provide a concise, helpful, and insightful response. If they ask about SIPs (Systematic Investment Plans), suggest some based on their risk profile. Keep it under 100 words per response so it fits well in a mobile chat interface. Format with emojis where appropriate.`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }

    return "I'm sorry, I couldn't process that right now. Please try again.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Network error. Please make sure you are online.";
  }
};

export const analyzeSIPRisk = async (sipDetails: any, userProfile: any): Promise<string> => {
  try {
    const prompt = `You are an expert financial risk analyst AI. 
The user (${userProfile.name}) has a risk profile of: ${userProfile.riskProfile}.
They are considering investing in:
- Name: ${sipDetails.title}
- Type: ${sipDetails.type}
- Amount: ₹${sipDetails.amount}
- Base Risk Level of Asset: ${sipDetails.riskLevel}
- Expected Return: ${sipDetails.expectedReturn}

Analyze this specific SIP/Investment for this specific user. Is it a good match? What are the potential risks?
Provide a short, direct analysis in 2-3 sentences. Be practical and clear. Use bullet points if useful.`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }

    return "Analysis unavailable at the moment.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Could not connect to the analysis engine.";
  }
};
