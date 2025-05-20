import fetch from "node-fetch";
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
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: inputTxt,
          negative_prompt: "image with texts only",
          positive_prompt: "album cover",
          options: {
            steps: 50,
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
        "Content-Type": "image/png",
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
