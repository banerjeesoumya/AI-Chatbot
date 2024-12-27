import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToCoreMessages, streamText } from "ai";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY
})

export const maxDuration = 60;

export async function POST(req: Request) {
    const { messages } = await req.json();
    console.log(messages);

    const result = streamText({
        model: google("gemini-1.5-pro-latest"),
        system: `You are a helpful assistant. Check your knowledge base before answering any questions.
        Only respond to questions using information from tool calls.
        if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
        messages: convertToCoreMessages(messages)
    });

    return result.toDataStreamResponse();
}