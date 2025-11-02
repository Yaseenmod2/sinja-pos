
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Order, Product } from "../types";

// FIX: Per coding guidelines, initialize directly and assume API_KEY is available from process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateProductDescription = async (productName: string): Promise<string> => {
  try {
    const prompt = `Generate a short, appealing, and creative product description for a cafe item named "${productName}". Keep it to one or two sentences.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error generating product description:", error);
    return "Failed to generate description.";
  }
};

export const getSalesInsights = async (orders: (Order & { total?: number })[], products: Product[]): Promise<string> => {
    if (orders.length === 0) return "Not enough sales data to generate insights.";
    
    try {
        const prompt = `
        As a business analyst for a cafe, analyze the following sales data and provide 3-4 actionable insights.
        The data includes a list of orders and a list of available products.
        Focus on identifying top-selling products, potential product pairings, and sales trends (e.g., time of day if data were available).
        Be concise and friendly.

        Product List:
        ${products.map(p => `- ${p.name} (ID: ${p.id})`).join('\n')}

        Sales Orders (last 50 orders):
        ${orders.slice(-50).map(o => {
            const amount = o.finalAmount ?? o.total ?? 0;
            const items = o.items || [];
            return `Order ID: ${o.id}, Total: ${amount.toFixed(2)} DH, Items: ${items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`
        }).join('\n')}

        Provide your insights as a bulleted list.
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating sales insights:", error);
        return "Failed to analyze sales data.";
    }
};
