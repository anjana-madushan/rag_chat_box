import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";

const {
  ASTRA_DB_KEYSPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APP_TOKEN,
  OPENAI_API_KEY
} = process.env;

const openaiClient = new OpenAI({
  apiKey: OPENAI_API_KEY
});

const client = new DataAPIClient(ASTRA_DB_APP_TOKEN!);

const db = client.db(ASTRA_DB_API_ENDPOINT!, {
  keyspace: ASTRA_DB_KEYSPACE!
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const latestMessage = messages[messages.length - 1]?.content;

    // Embed query
    const embedding = await openaiClient.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
    });

    const collection = await db.collection(ASTRA_DB_COLLECTION!);

    // Vector search
    const cursor = collection.find(
      {},
      {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 10,
      }
    );

    const documents = await cursor.toArray();

    // Clean context
    const context = documents
      .map((doc) => doc.text)
      .join("\n\n");

    // AI response
    const result = streamText({
      model: openai("gpt-4.1-mini"),
      system: `
      You are an AI assistant that answers questions about Formula 1.
      Use the provided context to answer the user's question.
      If the context is relevant, prioritize it.
      If it does not contain enough information, use your general knowledge.

      Do not mention the context or retrieval process.
      Format all responses in clean Markdown.
      Do not return images.
      Keep answers clear, accurate, and concise.

        ----------------
        ${context}
        ----------------
              `,
      messages,
    });

    return result.toTextStreamResponse();

  } catch (err) {
    console.log(err);

    return new Response("Error occurred", { status: 500 });
  }
}