document.getElementById("btn").addEventListener("click", async function () {
  const inputTxt = document.getElementById("input").value;
  const imageElement = document.getElementById("image");
  const loadingSpinner = document.getElementById("loadingSpinner");

  imageElement.style.display = "none";
  loadingSpinner.style.display = "block";

  const MAX_RETRIES = 3;
  const TIMEOUT = 15000;

  async function fetchWithTimeout(url, options, timeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  }

  async function tryGenerateImage(retries) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetchWithTimeout(
          "/.netlify/functions/create-image",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputTxt }),
          },
          TIMEOUT
        );

        if (response.ok) {
          const result = await response.blob();
          const objectURL = URL.createObjectURL(result);

          imageElement.src = objectURL;
          imageElement.style.display = "block";
          return;
        } else {
          throw new Error(`Failed to generate image: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        if (attempt < retries - 1) {
          console.log(`Retrying (${attempt + 2}/${retries})...`);
        } else {
          console.error("Image generation failed after multiple attempts.");
        }
      }
    }
  }

  try {
    await tryGenerateImage(MAX_RETRIES);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loadingSpinner.style.display = "none";
  }
});
