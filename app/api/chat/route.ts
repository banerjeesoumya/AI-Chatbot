import { createResource } from "@/lib/actions/resources";
import { findRelevantContent } from "@/lib/ai/embedding";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToCoreMessages, streamText, tool } from "ai";
import { z } from "zod";

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
        messages: convertToCoreMessages(messages),
        tools: {
            addResource: tool({
              description: `add a resource to your knowledge base.
                If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
              parameters: z.object({
                content: z
                  .string()
                  .describe('the content or resource to add to the knowledge base'),
              }),
              execute: async ({ content }) => createResource({ content }),
            }),
            getInformation: tool({
              description: `get information from your knowledge base to answer questions.`,
              parameters: z.object({
                question: z.string().describe('the users question'),
              }),
              execute: async ({ question }) => findRelevantContent(question),
            }),
          },
    });

    return result.toDataStreamResponse();
}