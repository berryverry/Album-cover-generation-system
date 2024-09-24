// import natural from "natural";
// import Sentiment from "sentiment";

// const { TfIdf } = natural;

// export async function handler(event) {
//   const { lyrics } = JSON.parse(event.body);

//   if (!lyrics) {
//     return {
//       statusCode: 400,
//       body: JSON.stringify({ error: "Lyrics are required" }),
//     };
//   }

//   try {
//     const sentiment = new Sentiment();
//     const sentimentResult = sentiment.analyze(lyrics);
//     const score = sentimentResult.score;

//     let moodColor = "transparent";
//     let textColor = "white";
//     if (score > 20) {
//       moodColor = "darkgreen";
//       textColor = "white";
//     } else if (score > 15) {
//       moodColor = "green";
//       textColor = "white";
//     } else if (score > 10) {
//       moodColor = "lightgreen";
//       textColor = "black";
//     } else if (score > 5) {
//       moodColor = "lightblue";
//       textColor = "black";
//     } else if (score > 0) {
//       moodColor = "lightcoral";
//       textColor = "black";
//     } else if (score > -5) {
//       moodColor = "lightred";
//       textColor = "black";
//     } else if (score > -10) {
//       moodColor = "red";
//       textColor = "white";
//     } else {
//       moodColor = "darkred";
//       textColor = "white";
//     }

//     const tfidf = new TfIdf();
//     tfidf.addDocument(lyrics);
//     const keyTerms = tfidf
//       .listTerms(0)
//       .sort((a, b) => b.tfidf - a.tfidf)
//       .slice(0, 10)
//       .map((term) => term.term);

//     const summary = createSimpleSummary(keyTerms, lyrics);

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ summary, moodColor, textColor }),
//     };
//   } catch (error) {
//     console.error("Error summarizing content:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: "Error summarizing content" }),
//     };
//   }
// }

// const createSimpleSummary = (keyTerms, lyrics) => {
//   const words = lyrics.split(/\s+/);
//   const importantWords = words.filter((word) =>
//     keyTerms.some((term) => word.includes(term))
//   );
//   const summary = importantWords.slice(0, 10).join(" ");
//   return summary.charAt(0).toUpperCase() + summary.slice(1);
// };

import "dotenv/config";
import fetch from "node-fetch"; // Make sure you have node-fetch installed
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

    // if (!isReadable(textColor, moodColor)) {
    //   textColor = "white"; // Default to white if contrast is insufficient
    // }

    // Call Hugging Face API for summarization
    const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY; // Replace with your Hugging Face API key
    const modelUrl =
      "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6"; // Replace with the appropriate model endpoint

    const response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: lyrics }),
    });

    const summaryData = await response.json();
    const summary =
      summaryData[0]?.summary_text || "Failed to generate summary";

    return {
      statusCode: 200,
      body: JSON.stringify({ summary, moodColor, textColor }),
    };
  } catch (error) {
    console.error("Error summarizing content:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error summarizing content" }),
    };
  }
}

// function isReadable(textColor, backgroundColor) {
//   const [r1, g1, b1] = hexToRgb(textColor);
//   const [r2, g2, b2] = hexToRgb(backgroundColor);

//   // Calculate luminance
//   const luminance1 = (0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1) / 255;
//   const luminance2 = (0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2) / 255;

//   // Calculate contrast ratio
//   const contrastRatio =
//     (Math.max(luminance1, luminance2) + 0.05) /
//     (Math.min(luminance1, luminance2) + 0.05);

//   return contrastRatio > 4.5; // WCAG AA standard for normal text
// }

// // Convert hex color to RGB
// function hexToRgb(hex) {
//   let r = 0,
//     g = 0,
//     b = 0;

//   if (hex.length === 4) {
//     r = parseInt(hex[1] + hex[1], 16);
//     g = parseInt(hex[2] + hex[2], 16);
//     b = parseInt(hex[3] + hex[3], 16);
//   } else if (hex.length === 7) {
//     r = parseInt(hex[1] + hex[2], 16);
//     g = parseInt(hex[3] + hex[4], 16);
//     b = parseInt(hex[5] + hex[6], 16);
//   }

//   return [r, g, b];
// }
