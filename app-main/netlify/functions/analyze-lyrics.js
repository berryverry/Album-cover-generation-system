import "dotenv/config";
import fetch from "node-fetch";
import Sentiment from "sentiment";

export async function handler(event) {
  const { lyrics } = JSON.parse(event.body);

  if (!lyrics) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Lyrics are required" }),
    };
  }

  try {
    const sentiment = new Sentiment();
    const sentimentResult = sentiment.analyze(lyrics);
    const score = sentimentResult.score;

    let moodColor = "black";
    let textColor = "white";
    if (score > 20) {
      moodColor = "lightgreen";
      textColor = "black";
    } else if (score > 15) {
      moodColor = "green";
      textColor = "white";
    } else if (score > 10) {
      moodColor = "darkgreen";
      textColor = "white";
    } else if (score > 5) {
      moodColor = "lightblue";
      textColor = "black";
    } else if (score > 0) {
      moodColor = "lightcoral";
      textColor = "black";
    } else if (score > -5) {
      moodColor = "palevioletred";
      textColor = "black";
    } else if (score > -10) {
      moodColor = "lightsalmon";
      textColor = "black";
    } else {
      moodColor = "salmon";
      textColor = "white";
    }

    const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
    const modelUrl =
      "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6";

    const response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: lyrics }),
    });

    const summaryData = await response.json();
    const summary = summaryData[0]?.summary_text || "Failed to analyze lyrics.";

    return {
      statusCode: 200,
      body: JSON.stringify({ summary, moodColor, textColor }),
    };
  } catch (error) {
    console.error("Error summarizing content:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error analyzing lyrics" }),
    };
  }
}
