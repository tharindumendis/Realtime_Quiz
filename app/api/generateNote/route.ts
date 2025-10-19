import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Initialize the GoogleGenAI instance.
const ai = new GoogleGenAI({});

// Next.js Route Handler for POST requests
export async function POST(request: Request) {
    try {
        const { topic } = await request.json();

        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }

        const prompt = `Generate a concise, informative short note about the topic: "${topic}". Structure the response clearly using bullet points or short paragraphs. The note should be educational and directly relevant to the topic.`;

        // Call the Gemini API for content generation
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Fast and capable model
            contents: prompt,
            config: {
                // Keep temperature low for informative responses
                temperature: 0.3, 
            },
        });
        
        // Ensure text content exists before returning
        if (!response.text) {
            return NextResponse.json(
                { error: "AI failed to generate content." }, 
                { status: 500 }
            );
        }

        // Return the generated text directly
        return NextResponse.json({ note: response.text }, { status: 200 });

    } catch (error) {
        console.error("AI Generation Error:", error);
        return NextResponse.json(
            { error: "Failed to generate note from AI." }, 
            { status: 500 }
        );
    }
}