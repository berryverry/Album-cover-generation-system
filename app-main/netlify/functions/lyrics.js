import fetch from "node-fetch";

export async function handler(event) {
  const { title, name } = event.queryStringParameters;

  if (!title || !name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Title and name are required" }),
    };
  }

  try {
    const response = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(
        name
      )}/${encodeURIComponent(title)}`
    );
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error fetching lyrics" }),
    };
  }
}
