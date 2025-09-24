"use server"

import OpenAI from "openai";

const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

if (!AZURE_OPENAI_API_KEY) {
  throw new Error("AZURE_OPENAI_API_KEY is not set in environment variables.");
}
if (!AZURE_OPENAI_ENDPOINT) {
  throw new Error("AZURE_OPENAI_ENDPOINT is not set in environment variables.");
}
if (!AZURE_OPENAI_DEPLOYMENT_NAME) {
  throw new Error("AZURE_OPENAI_DEPLOYMENT_NAME is not set in environment variables.");
}

const openai = new OpenAI({
  apiKey: AZURE_OPENAI_API_KEY,
  baseURL: `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { "api-version": "2024-02-15-preview" }, // Adjust API version as needed
  defaultHeaders: { "api-key": AZURE_OPENAI_API_KEY },
});

export async function generateTags(
  title: string,
  description: string,
  existingTags: string[]
): Promise<string[]> {
  const prompt = `Given the video title: "${title}", description: "${description}", and existing tags: ${existingTags.join(", ")},
  generate a comma-separated list of up to 5 additional, relevant tags to improve discoverability. Only return the tags, no other text.`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: AZURE_OPENAI_DEPLOYMENT_NAME, // In Azure, model is the deployment name
      max_tokens: 100,
    });
    const text = chatCompletion.choices[0]?.message?.content;

    if (text) {
      const newTags = text.split(",").map((tag) => tag.trim()).filter(tag => tag.length > 0);
      return newTags;
    }
    return [];
  } catch (error) {
    console.error("Error generating tags:", error);
    return [];
  }
}
