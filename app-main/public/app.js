document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("search").addEventListener("click", function (event) {
    event.preventDefault();

    const songSearch = document.getElementById("songSearch").value;
    console.log(songSearch);

    document.getElementById("searchResult").innerHTML = "";
    document.getElementById("lyrics").innerText = "";
    document.getElementById("summary").innerText = "";
    document.getElementById("summary").classList.remove("summary-filled");

    const imageElement = document.getElementById("image");

    imageElement.src = "";
    imageElement.style.display = "none";

    document.getElementById("filterSelect").style.display = "none";
    document.getElementById("downloadImage").style.display = "none";
    document.getElementById("summarize").style.display = "none";
    document.getElementById("noResults").style.display = "none";
    document.getElementById("searchResult").style.display = "none";

    if (!songSearch.trim()) {
      document.getElementById("noResults").innerText =
        "Please enter a search term.";
      document.getElementById("noResults").style.display = "block";
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("q", songSearch);
    window.history.pushState({}, "", url);

    fetch(`/.netlify/functions/search?q=${encodeURIComponent(songSearch)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.data || data.data.length === 0) {
          document.getElementById("noResults").innerText =
            "Sorry, no results found!";
          document.getElementById("noResults").style.display = "block";
          return;
        }

        document.getElementById("noResults").style.display = "none";
        document.getElementById("searchResult").style.display = "block";

        const searchResultContainer = document.getElementById("searchResult");

        data.data.slice(0, 10).forEach((song) => {
          const songName = song.title;
          const albumBy = song.artist.name;
          const resultRow = document.createElement("div");

          resultRow.className = "single-result-row";

          const col1 = document.createElement("div");
          col1.className = "col1";
          const songTitle = document.createElement("h3");
          songTitle.className = "lyrics-name";
          songTitle.innerText = songName;
          const albumInfo = document.createElement("p");
          albumInfo.className = "author lead";
          albumInfo.innerHTML = `Album by <span id="albumName">${albumBy}</span>`;
          col1.appendChild(songTitle);
          col1.appendChild(albumInfo);

          const col2 = document.createElement("div");
          col2.className = "col2";
          const button = document.createElement("button");
          button.className = "btn-success";
          button.innerText = "GET LYRICS";
          button.onclick = () => getLyrics(songName, albumBy);

          col2.appendChild(button);

          resultRow.appendChild(col1);
          resultRow.appendChild(col2);
          searchResultContainer.appendChild(resultRow);
        });
      })
      .catch((error) => {
        document.getElementById("noResults").innerText =
          "Sorry, no results found!";
        document.getElementById("noResults").style.display = "block";
      });
  });
});

function getLyrics(title, name) {
  const overlayText = document.getElementById("overlayText");
  overlayText.style.display = "none";

  const twitterButton = document.getElementById("shareTwitter");
  const downloadButton = document.getElementById("downloadImage");
  const imageElement = document.getElementById("image");
  const loadingSpinner = document.getElementById("loadingSpinner");

  twitterButton.style.display = "none";
  downloadButton.style.display = "none";
  imageElement.src = "";
  imageElement.style.display = "none";
  loadingSpinner.style.display = "none";

  document.getElementById("filterSelect").style.display = "none";
  downloadButton.style.display = "none";

  const summaryElement = document.getElementById("summary");
  summaryElement.innerText = "";
  summaryElement.classList.remove("summary-filled");
  summaryElement.style.display = "none";
  summaryElement.style.border = "none";
  summaryElement.style.backgroundColor = "transparent";
  summaryElement.style.color = "";

  const lyricsElement = document.getElementById("lyrics");
  lyricsElement.style.display = "block";

  fetch(
    `/lyrics?title=${encodeURIComponent(title)}&name=${encodeURIComponent(
      name
    )}`
  )
    .then((res) => res.json())
    .then((data) => {
      console.log(data.lyrics);
      if (!data.lyrics) {
        document.getElementById("lyrics").innerText =
          "Sorry, lyrics not found!";
      } else {
        document.getElementById("lyrics").innerText = data.lyrics;
        document.getElementById("summarize").style.display = "block";
        document.getElementById("songTitle").innerText = title;
        document.getElementById("artistName").innerText = `by ${name}`;

        const imageElement = document.getElementById("image");
        imageElement.src = "";
        imageElement.style.display = "none";
      }
    })
    .catch((err) => {
      console.error("Error fetching lyrics:", err);
      document.getElementById("lyrics").innerText = "Sorry, lyrics not found!";
    });
}

async function summarizeLyrics(lyrics) {
  const response = await fetch("/.netlify/functions/summarize-lyrics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lyrics }),
  });

  if (!response.ok) {
    throw new Error("Failed to summarize lyrics");
  }

  const data = await response.json();
  return data.summary;
}

document
  .getElementById("summarizeButton")
  .addEventListener("click", function (event) {
    event.preventDefault();

    document.getElementById("summary").style.display = "block";

    const lyrics = document.getElementById("lyrics").innerText.trim();
    const summaryElement = document.getElementById("summary");

    if (!lyrics) {
      summaryElement.innerText = "No lyrics to summarize.";
      summaryElement.classList.remove("summary-filled");
      return;
    }

    fetch("/summarize-lyrics-short", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lyrics }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.summary) {
          summaryElement.innerText = data.summary;
          summaryElement.classList.add("summary-filled");
          summaryElement.style.backgroundColor = "";
          summaryElement.style.color = "#8fff9c";
        } else {
          summaryElement.innerText = "Failed to summarize lyrics.";
          summaryElement.classList.remove("summary-filled");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        summaryElement.innerText = "Failed to summarize lyrics.";
        summaryElement.classList.remove("summary-filled");
      });
  });

document
  .getElementById("analyzeButton")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("summary").style.display = "block";

    const lyrics = document.getElementById("lyrics").innerText.trim();
    const summaryElement = document.getElementById("summary");

    if (!lyrics) {
      summaryElement.innerText = "No lyrics to analyze.";
      summaryElement.classList.remove("summary-filled");
      return;
    }

    fetch("/analyze-lyrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lyrics }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.summary) {
          summaryElement.innerText = data.summary;
          summaryElement.style.backgroundColor = data.moodColor;
          summaryElement.style.color = data.textColor;
          summaryElement.classList.add("summary-filled");
        } else {
          summaryElement.innerText = "Failed to analyze lyrics.";
          summaryElement.classList.remove("summary-filled");
        }
        formatTextByLines("summary", 10);
      })
      .catch((error) => {
        console.error("Error:", error);
        summaryElement.innerText = "Failed to analyze lyrics.";
        summaryElement.classList.remove("summary-filled");
      });
  });

function formatTextByLines(elementId, maxWordsPerLine) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const words = element.innerText.split(/\s+/);
  let formattedText = "";

  for (let i = 0; i < words.length; i += maxWordsPerLine) {
    const line = words.slice(i, i + maxWordsPerLine).join(" ");
    formattedText += line + "<br>";
  }

  element.innerHTML = formattedText;
}

async function extractKeywordsFromText(text) {
  const response = await fetch("/.netlify/functions/extract-keywords", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Failed to extract keywords");
  }

  const data = await response.json();
  return data.keywords || [];
}

async function generateImageFromKeywords(keywords, retries = 3) {
  const twitterButton = document.getElementById("shareTwitter");
  const downloadButton = document.getElementById("downloadImage");
  const imageElement = document.getElementById("image");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const overlayText = document.getElementById("overlayText");

  twitterButton.style.display = "none";
  downloadButton.style.display = "none";
  imageElement.style.display = "none";
  overlayText.style.display = "none";
  loadingSpinner.style.display = "block";

  const maxKeywordCount = 50;
  const limitedKeywords = keywords.slice(0, maxKeywordCount);

  const timeoutDuration = 30000;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}: Generating image...`);

      const response = await fetchWithTimeout(
        "/.netlify/functions/generate-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputTxt: limitedKeywords.join(", "),
          }),
        },
        timeoutDuration
      );

      if (response.ok) {
        const result = await response.blob();
        const objectURL = URL.createObjectURL(result);

        imageElement.src = objectURL;
        imageElement.style.display = "block";

        overlayText.style.display = "block";
        twitterButton.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          objectURL
        )}&text=${encodeURIComponent("Check out this image I generated!")}`;
        twitterButton.style.display = "block";

        downloadButton.href = objectURL;
        downloadButton.download = "image.png";
        downloadButton.style.display = "block";

        console.log("Image generated successfully.");

        loadingSpinner.style.display = "none";

        return;
      } else {
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (error.message === "Request timeout") {
        console.log(
          "Request is taking longer than expected, but continuing to wait..."
        );
      } else if (attempt < retries - 1) {
        console.log(`Retrying (${attempt + 2}/${retries})...`);
      } else {
        alert(
          "Image generation failed after multiple attempts. Please try again later."
        );
        loadingSpinner.style.display = "none";
      }
    }
  }
}

document
  .getElementById("generateButton")
  .addEventListener("click", async function () {
    try {
      document.getElementById("summary").style.display = "none";
      document.getElementById("loadingSpinner").style.display = "none";
      const lyrics = document.getElementById("lyrics").innerText;

      if (!lyrics) {
        alert("No lyrics available to generate an image.");
        return;
      }

      const summary = await summarizeLyrics(lyrics);

      if (!summary) {
        alert("Failed to summarize lyrics.");
        return;
      }

      const keywords = await extractKeywordsFromText(summary);

      if (keywords.length === 0) {
        alert("No keywords extracted.");
        return;
      }

      const imageElement = document.getElementById("image");

      document.getElementById("filterSelect").style.display = "none";
      document.getElementById("downloadImage").style.display = "none";

      imageElement.style.display = "none";
      imageElement.style.filter = "none";
      imageElement.src = "";

      await generateImageFromKeywords(keywords);

      document.getElementById("filterSelect").style.display = "block";
      document.getElementById("downloadImage").style.display = "block";
      document.getElementById("filterSelect").value = "none";
    } catch (error) {
      console.error("Error:", error);
    }
  });

function fetchWithTimeout(url, options, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timeout"));
    }, timeout);

    fetch(url, options)
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

document.querySelectorAll("#filterSelect li").forEach(function (item) {
  item.addEventListener("click", function () {
    const selectedFilter = this.getAttribute("data-value");
    const imageElement = document.getElementById("image");

    switch (selectedFilter) {
      case "none":
        imageElement.style.filter = "none";
        break;
      case "grayscale":
        imageElement.style.filter = "grayscale(100%)";
        break;
      case "brightness":
        imageElement.style.filter = "brightness(150%)";
        break;
      case "contrast":
        imageElement.style.filter = "contrast(200%)";
        break;
      case "blur":
        imageElement.style.filter = "blur(5px)";
        break;
      default:
        imageElement.style.filter = "none";
    }

    document
      .querySelectorAll("#filterSelect li")
      .forEach((li) => li.classList.remove("selected"));
    this.classList.add("selected");
  });
});

document
  .getElementById("downloadImage")
  .addEventListener("click", function (event) {
    event.preventDefault();

    const imageElement = document.getElementById("image");
    const overlayText = document.getElementById("overlayText");
    const songTitleElement = document.getElementById("songTitle");
    const artistNameElement = document.getElementById("artistName");
    const songTitleStyle = window.getComputedStyle(songTitleElement);
    const artistNameStyle = window.getComputedStyle(artistNameElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;

    ctx.filter = imageElement.style.filter || "none";
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 3;
    ctx.textAlign = "center";

    const centerX = canvas.width / 2;
    const topMargin = 50;
    const titleFontSize = parseFloat(songTitleStyle.fontSize) * 1.5;
    const artistFontSize = parseFloat(artistNameStyle.fontSize) * 1.5;

    ctx.font = `${songTitleStyle.fontWeight} ${titleFontSize}px ${songTitleStyle.fontFamily}`;
    ctx.fillStyle = songTitleStyle.color;
    ctx.fillText(songTitleElement.innerText, centerX, topMargin);

    const artistTop = topMargin + titleFontSize + 10;

    ctx.font = `${artistNameStyle.fontStyle} ${artistFontSize}px ${artistNameStyle.fontFamily}`;
    ctx.fillStyle = artistNameStyle.color;
    ctx.fillText(artistNameElement.innerText, centerX, artistTop);

    canvas.toBlob(function (blob) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "image.png";
      link.click();
    });
  });
