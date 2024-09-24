import fetch from "node-fetch";

export async function handler(event) {
  const songSearch = event.queryStringParameters.q;

  if (!songSearch) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Search term is required" }),
    };
  }

  try {
    const response = await fetch(
      `https://api.lyrics.ovh/suggest/${encodeURIComponent(songSearch)}`
    );
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error fetching data" }),
    };
  }
}
