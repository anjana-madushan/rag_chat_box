import { DataAPIClient } from '@datastax/astra-db-ts';
import OpenAI from 'openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PuppeteerWebBaseLoader } from '@langchain/community/document_loaders/web/puppeteer';

import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const {
  ASTRA_DB_KEYSPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APP_TOKEN,
  OPENAI_API_KEY
} = process.env;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

const f1Data = [
  "https://en.wikipedia.org/wiki/Formula_One",
  "https://www.britannica.com/sports/Formula-One-automobile-racing",
  "https://www.skysports.com/f1",
  "https://www.bbc.com/sport/formula1"
];

const client = new DataAPIClient(ASTRA_DB_APP_TOKEN!);

const db = client.db(ASTRA_DB_API_ENDPOINT!, {
  keyspace: ASTRA_DB_KEYSPACE!
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100
});

const createCollection = async (sm: SimilarityMetric = 'dot_product') => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536,
      metric: sm
    }
  })

  console.log(res);
}

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);

  for await (const url of f1Data) {
    const content = await scrapePage(url)
    const chunks = await splitter.splitText(content)

    for await (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float"
      })

      const vector = embedding.data[0].embedding

      const res = await collection.insertOne({
        $vector: vector,
        text: chunk
      })
      console.log(res);
    }
  }
}

async function scrapePage(url: string) {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true
    },
    gotoOptions: {
      waitUntil: "domcontentloaded"
    },
    evaluate: async (pageXOffset, browser) => {
      const result = await pageXOffset.evaluate(() => document.body.innerHTML);
      await browser.close();
      return result;
    }
  })
  return (await loader.scrape())?.replace(/<[^>]*>?/gm, '');
}

createCollection().then(() => loadSampleData());