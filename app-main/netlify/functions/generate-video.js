// import fetch from "node-fetch";

// const REST_API_KEY = process.env.REST_API_KEY;

// export async function handler(event) {
//   if (event.httpMethod !== "POST") {
//     return {
//       statusCode: 405,
//       body: JSON.stringify({ error: "Method Not Allowed" }),
//     };
//   }

//   const { prompt, negative_prompt } = JSON.parse(event.body);

//   try {
//     const response = await fetch(
//       "https://api.kakaobrain.com",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `KakaoAK ${REST_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           prompt,
//           negative_prompt,
//         }),
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }

//     const data = await response.json();

//     if (!data.images || data.images.length === 0) {
//       return {
//         statusCode: 500,
//         body: JSON.stringify({ error: "No images returned" }),
//       };
//     }

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ imageUrl: data.images[0].image }),
//     };
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: error.message }),
//     };
//   }
// }

// netlify/functions/generate-image.js

// import "dotenv/config";

// const API_KEY = process.env.API_KEY;

// export async function handler(event) {
//   if (event.httpMethod !== "POST") {
//     return {
//       statusCode: 405,
//       body: JSON.stringify({ message: "Method not allowed" }),
//     };
//   }

//   const { prompt } = JSON.parse(event.body);

//   try {
//     const response = await fetch(
//       "https://api-inference.huggingface.co/models/alvdansen/littletinies",
//       {
//         headers: {
//           Authorization: `Bearer ${API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         method: "POST",
//         body: JSON.stringify({ prompts: prompt }),
//       }
//     );

//     if (!response.ok) {
//       return {
//         statusCode: response.status,
//         body: JSON.stringify({ message: response.statusText }),
//       };
//     }

//     const result = await response.arrayBuffer();
//     return {
//       statusCode: 200,
//       headers: {
//         "Content-Type": "image/png", // Adjust based on the image format
//       },
//       body: Buffer.from(result).toString("base64"),
//       isBase64Encoded: true,
//     };
//   } catch (error) {
//     console.error("Error:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ message: "Internal Server Error" }),
//     };
//   }
// }

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
      // "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      "https://api-inference.huggingface.co/models/alvdansen/littletinies",
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
            steps: 50, // 스텝 수를 조정하여 속도 개선 가능
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
