
/**
 * Converts an English sentence into a sentence structure suitable for ASL.
 *
 * This function communicates with the Gemini API using a system prompt that
 * instructs the model to simplify the sentence by removing articles,
 * auxiliary verbs, and prepositions, and to reorder it into a Topic-Comment
 * structure common in ASL.
 *
 * @param {string} englishSentence The English sentence to convert.
 * @returns {Promise<string>} A promise that resolves to the ASL-suited sentence,
 * or rejects with an error.
 */
import dotenv from 'dotenv';
dotenv.config();    
export default async function convertToASL(englishSentence) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`;
    console.log(apiUrl);

    if (!englishSentence) {
        throw new Error("Input sentence cannot be empty.");
    }

    const systemPrompt = `You are an American Sign Language (ASL) grammar expert. Your task is to take a single English sentence and convert it to a grammatically correct ASL sentence structure. ASL grammar is typically Topic-Comment. You must remove articles (a, an, the), auxiliary verbs (am, are, is, was, were), and prepositions (on, in, at, to, from).

Example 1:
Input: How are you?
Output: You how?

Example 2:
Input: I went to the store.
Output: I store went.

Example 3:
Input: My name is John.
Output: My name John.

Your response should only contain the converted sentence, with no extra explanations or text.`;

    const payload = {
        contents: [{ parts: [{ text: englishSentence }] }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        tools: [{ "google_search": {} }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API call failed with status: ${response.status}. Body: ${errorBody}`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            console.log(candidate.content.parts[0].text);
            return candidate.content.parts[0].text;
        } else {
            throw new Error('No text found in API response. Please check your input and API key.');
        }
    } catch (error) {
        console.error("An error occurred during API call:", error);
        throw error;
    }
}