import natural from "natural";
import { TfIdf } from "natural";

export async function handler(event) {
  const { lyrics } = JSON.parse(event.body);

  if (!lyrics) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Lyrics are required" }),
    };
  }

  try {
    const splitIntoChunks = (text, chunkSize) => {
      const chunks = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
      }
      return chunks;
    };

    const chunks = splitIntoChunks(lyrics, 100);
    const tfidf = new TfIdf();

    chunks.forEach((chunk) => tfidf.addDocument(chunk));

    const scores = chunks.map((chunk, index) => {
      let score = 0;
      tfidf.listTerms(index).forEach((item) => {
        score += item.tfidf;
      });
      return { chunk, score };
    });

    scores.sort((a, b) => b.score - a.score);
    const topChunks = scores
      .slice(0, 5)
      .map((item) => item.chunk)
      .join(" ");

    return {
      statusCode: 200,
      body: JSON.stringify({ summary: topChunks }),
    };
  } catch (error) {
    console.error("Error summarizing lyrics:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error summarizing lyrics" }),
    };
  }
}
