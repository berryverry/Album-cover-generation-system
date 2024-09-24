import "dotenv/config";

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  const { text } = JSON.parse(event.body);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      "Extract three keywords from this text:",
      {
        inlineData: {
          data: Buffer.from(text).toString("base64"),
          mimeType: "text/plain",
        },
      },
    ]);

    const keywords = result.response.text().split("\n").slice(0, 3); // Adjust parsing if needed
    return {
      statusCode: 200,
      body: JSON.stringify({ keywords }),
    };
  } catch (error) {
    console.error("Error extracting keywords:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}
