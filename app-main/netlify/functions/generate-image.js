import fetch from "node-fetch"; // Ensure you have node-fetch installed
import "dotenv/config";

const API_KEY = process.env.API_KEY;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  const { inputTxt } = JSON.parse(event.body);

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/alvdansen/littletinies",
      // "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: inputTxt,
          negative_prompt: "text only",
          positive_prompt: "album cover",
          options: {
            steps: 30, // 스텝 수를 조정하여 속도 개선 가능
          },
        }),
      }
    );

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: response.statusText }),
      };
    }

    const result = await response.arrayBuffer();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png", // Adjust based on actual image format
      },
      body: Buffer.from(result).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}
