import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

// Initialize the GoogleGenAI instance.
// It automatically picks up the GEMINI_API_KEY from your .env file
const ai = new GoogleGenAI({});

// Define the JSON structure we want the model to return
const quizSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "A single, clear multiple-choice quiz question.",
    },
    answers: {
      type: Type.ARRAY,
      description: "An array containing exactly four answer options.",
      items: {
        type: Type.OBJECT,
        properties: {
          key: {
            type: Type.INTEGER,
            description: "The unique key for the answer (1, 2, 3, or 4).",
          },
          text: {
            type: Type.STRING,
            description: "The text of the answer option.",
          },
        },
        required: ["key", "text"],
      },
    },
    rightAnswer: {
      type: Type.INTEGER,
      description:
        "The key (1, 2, 3, or 4) corresponding to the correct answer in the answers array.",
    },
  },
  required: ["question", "answers", "rightAnswer"],
};

// Next.js Route Handler for POST requests
export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const prompt = `Generate a single multiple-choice quiz question based on the topic: "${topic}". The question must have exactly four answer options.`;

    // Call the Gemini API with structured output configuration
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // A fast model for quick quiz generation
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        // A higher temperature encourages more creative and varied questions
        temperature: 0.8,
      },
    });
    if (!response.text) {
      // Handle the case where the AI didn't return any text
      console.error(
        "AI response failed to return text content.",
        response.candidates
      );
      return NextResponse.json(
        { error: "AI failed to generate a complete quiz. Response was empty." },
        { status: 500 }
      );
    }

    // The response text is a JSON string adhering to the schema
    const quizData = JSON.parse(response.text);

    // Return the structured quiz data to the frontend
    return NextResponse.json(quizData, { status: 200 });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to generate quiz from AI. Check API Key and network connection.",
      },
      { status: 500 }
    );
  }
}
