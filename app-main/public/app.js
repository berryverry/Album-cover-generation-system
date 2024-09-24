document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("search").addEventListener("click", function (event) {
    event.preventDefault();

    const songSearch = document.getElementById("songSearch").value;
    console.log(songSearch);

    document.getElementById("searchResult").innerHTML = "";
    document.getElementById("lyrics").innerText = "";
    document.getElementById("summary").innerText = "";
    document.getElementById("summary").classList.remove("summary-filled");

    //
    const imageElement = document.getElementById("image");
    imageElement.src = ""; // Clear previous image source
    imageElement.style.display = "none";

    //
    document.getElementById("filterSelect").style.display = "none";
    document.getElementById("downloadImage").style.display = "none";
    //

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

    // fetch(`https://api.lyrics.ovh/suggest/${songSearch}`)
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

          const col = document.createElement("div");
          col.className = "col";
          const songTitle = document.createElement("h3");
          songTitle.className = "lyrics-name";
          songTitle.innerText = songName;
          const albumInfo = document.createElement("p");
          albumInfo.className = "author lead";
          albumInfo.innerHTML = `Album by <span id="albumName">${albumBy}</span>`;
          col.appendChild(songTitle);
          col.appendChild(albumInfo);

          const col2 = document.createElement("div");
          col2.className = "col2";
          const button = document.createElement("button");
          button.className = "btn-success";
          button.innerText = "GET LYRICS";
          button.onclick = () => getLyrics(songName, albumBy);

          col2.appendChild(button);

          resultRow.appendChild(col);
          resultRow.appendChild(col2);
          searchResultContainer.appendChild(resultRow);
        });
      })
      .catch((error) => {
        // console.error("Error fetching data:", error);
        document.getElementById("noResults").innerText =
          "Sorry, no results found!";
        document.getElementById("noResults").style.display = "block";
      });
  });
});

//
// function getLyrics(title, name) {
//   // 트위터 공유 및 다운로드 버튼 숨기기
//   const overlayText = document.getElementById("overlayText");
//   overlayText.style.display = "none";

//   const twitterButton = document.getElementById("shareTwitter");
//   const downloadButton = document.getElementById("downloadImage");
//   const imageElement = document.getElementById("image");
//   const loadingSpinner = document.getElementById("loadingSpinner");

//   twitterButton.style.display = "none";
//   downloadButton.style.display = "none";
//   imageElement.src = ""; // 이미지 소스 초기화
//   imageElement.style.display = "none";
//   loadingSpinner.style.display = "none"; // 스피너도 초기화

//   // 필터 및 다운로드 버튼 숨기기
//   document.getElementById("filterSelect").style.display = "none";
//   downloadButton.style.display = "none";

//   // 요약 섹션 초기화
//   const summaryElement = document.getElementById("summary");
//   summaryElement.innerText = ""; // 요약 내용 초기화
//   summaryElement.classList.remove("summary-filled"); // summary-filled 클래스 제거
//   summaryElement.style.display = "none"; // 요약 섹션 숨기기
//   summaryElement.style.border = "none"; // 테두리 스타일 완전 제거
//   summaryElement.style.backgroundColor = "transparent"; // 배경 색상 제거
//   summaryElement.style.color = "";

//   // 가사 영역 초기화 및 기본 메시지 설정
//   const lyricsElement = document.getElementById("lyrics");

//   // Show a loading message immediately
//   // lyricsElement.innerText = "Loading lyrics..."; // 가사 로드 중 표시
//   lyricsElement.style.display = "block";

//   // Set a timeout for the fetch request (e.g., 10 seconds)
//   const timeoutDuration = 5000; // 10 seconds

//   // Fetch lyrics with a timeout
//   fetchWithTimeout(
//     `/lyrics?title=${encodeURIComponent(title)}&name=${encodeURIComponent(
//       name
//     )}`,
//     {},
//     timeoutDuration
//   )
//     .then((res) => {
//       if (!res.ok) {
//         // If the response has an error status (e.g., 500)
//         throw new Error(`Server error: ${res.status}`);
//       }
//       return res.json();
//     })
//     .then((data) => {
//       if (!data.lyrics) {
//         // If no lyrics found, display the error message early
//         document.getElementById("lyrics").innerText =
//           "Sorry, lyrics not found!";
//       } else {
//         // Show the lyrics if they are found
//         document.getElementById("lyrics").innerText = data.lyrics;
//         document.getElementById("summarize").style.display = "block";

//         // Update song title and artist name
//         document.getElementById("songTitle").innerText = title;
//         document.getElementById("artistName").innerText = `by ${name}`;
//       }
//     })
//     .catch((err) => {
//       console.error("Error fetching lyrics or request timed out:", err);
//       // Display error message early if the request fails or times out
//       document.getElementById("lyrics").innerText = "Sorry, lyrics not found!";
//     })
//     .finally(() => {
//       // Reset the UI in case of success or failure
//       imageElement.style.display = "none"; // Make sure the image is hidden
//       loadingSpinner.style.display = "none"; // Hide the spinner
//       overlayText.style.display = "none"; // Hide overlay text
//     });
// }

// // Custom fetch with timeout helper
// function fetchWithTimeout(url, options = {}, timeout = 5000) {
//   return new Promise((resolve, reject) => {
//     const timer = setTimeout(() => {
//       reject(new Error("Request timed out"));
//     }, timeout);

//     fetch(url, options)
//       .then((response) => {
//         clearTimeout(timer); // Clear the timeout if the request completes in time
//         resolve(response);
//       })
//       .catch((err) => {
//         clearTimeout(timer); // Clear the timeout on error
//         reject(err);
//       });
//   });
// }

//
function getLyrics(title, name) {
  // 트위터 공유 및 다운로드 버튼 숨기기
  const overlayText = document.getElementById("overlayText");
  overlayText.style.display = "none";

  const twitterButton = document.getElementById("shareTwitter");
  const downloadButton = document.getElementById("downloadImage");
  const imageElement = document.getElementById("image");
  const loadingSpinner = document.getElementById("loadingSpinner");

  twitterButton.style.display = "none";
  downloadButton.style.display = "none";
  imageElement.src = ""; // 이미지 소스 초기화
  imageElement.style.display = "none";
  loadingSpinner.style.display = "none"; // 스피너도 초기화

  // 필터 및 다운로드 버튼 숨기기
  document.getElementById("filterSelect").style.display = "none";
  downloadButton.style.display = "none";

  // 요약 섹션 초기화
  const summaryElement = document.getElementById("summary");
  summaryElement.innerText = ""; // 요약 내용 초기화
  summaryElement.classList.remove("summary-filled"); // summary-filled 클래스 제거
  summaryElement.style.display = "none"; // 요약 섹션 숨기기
  summaryElement.style.border = "none"; // 테두리 스타일 완전 제거
  summaryElement.style.backgroundColor = "transparent"; // 배경 색상 제거
  summaryElement.style.color = "";

  // 가사 영역 초기화 및 기본 메시지 설정
  const lyricsElement = document.getElementById("lyrics");
  // lyricsElement.innerText = "Loading lyrics..."; // 가사 로드 중 표시
  lyricsElement.style.display = "block";

  fetch(
    `/lyrics?title=${encodeURIComponent(title)}&name=${encodeURIComponent(
      name
    )}`
  )
    .then((res) => res.json())
    .then((data) => {
      console.log(data.lyrics);
      // if (data.lyrics == undefined)
      if (!data.lyrics) {
        document.getElementById("lyrics").innerText =
          "Sorry, lyrics not found!";
      } else {
        document.getElementById("lyrics").innerText = data.lyrics;
        document.getElementById("summarize").style.display = "block";

        ////
        document.getElementById("songTitle").innerText = title;
        document.getElementById("artistName").innerText = `by ${name}`;

        // Ensure the text is visible on the image
        //
        const imageElement = document.getElementById("image");
        imageElement.src = ""; // Clear previous image source
        imageElement.style.display = "none";
      }
    })
    .catch((err) => {
      console.error("Error fetching lyrics:", err);
      document.getElementById("lyrics").innerText = "Sorry, lyrics not found!";
    });
}

//

//

document
  .getElementById("generateImage")
  .addEventListener("click", async function () {
    try {
      ////
      document.getElementById("summary").style.display = "none";
      document.getElementById("loadingSpinner").style.display = "none";
      ////
      const lyrics = document.getElementById("lyrics").innerText;
      ////

      ////

      if (!lyrics) {
        alert("No lyrics available to generate an image.");
        return;
      }

      // Step 1: Summarize Lyrics
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

      // Hide the image element before generating a new image
      const imageElement = document.getElementById("image");

      //
      document.getElementById("filterSelect").style.display = "none";
      document.getElementById("downloadImage").style.display = "none";
      //

      imageElement.style.display = "none";
      //
      imageElement.style.filter = "none"; // 필터 초기화
      imageElement.src = "";
      //

      // Step 3: Generate Image using Hugging Face API
      await generateImageFromKeywords(keywords);
      //

      document.getElementById("filterSelect").style.display = "block";
      document.getElementById("downloadImage").style.display = "block";

      document.getElementById("filterSelect").value = "none";
      //
    } catch (error) {
      console.error("Error:", error);
    }
  });

// 필터 선택 부분
document.querySelectorAll("#filterSelect li").forEach(function (item) {
  item.addEventListener("click", function () {
    const selectedFilter = this.getAttribute("data-value");
    const imageElement = document.getElementById("image");

    // CSS 필터 적용
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

    // 선택된 항목 표시
    document
      .querySelectorAll("#filterSelect li")
      .forEach((li) => li.classList.remove("selected"));
    this.classList.add("selected");
  });
});

// 필터가 적용된 이미지 다운로드
// document
//   .getElementById("downloadImage")
//   .addEventListener("click", function (event) {
//     event.preventDefault();

//     const imageElement = document.getElementById("image");

//     // 필터 적용 후 캔버스에 그리기
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");

//     canvas.width = imageElement.naturalWidth;
//     canvas.height = imageElement.naturalHeight;

//     ctx.filter = imageElement.style.filter || "none";
//     ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

//     // 다운로드 링크 생성
//     canvas.toBlob(function (blob) {
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.download = "image.png";
//       link.click();
//     });
//   });

// document
//   .getElementById("downloadImage")
//   .addEventListener("click", function (event) {
//     event.preventDefault();

//     const imageElement = document.getElementById("image");
//     const overlayText = document.getElementById("overlayText");
//     const songTitleElement = document.getElementById("songTitle");
//     const artistNameElement = document.getElementById("artistName");

//     // Get computed styles for title and artist name
//     const songTitleStyle = window.getComputedStyle(songTitleElement);
//     const artistNameStyle = window.getComputedStyle(artistNameElement);

//     // Create a canvas element
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");

//     // Set canvas dimensions equal to the image dimensions
//     canvas.width = imageElement.naturalWidth;
//     canvas.height = imageElement.naturalHeight;

//     // Apply the image filter (if any)
//     ctx.filter = imageElement.style.filter || "none";

//     // Draw the image on the canvas
//     ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

//     // Set the text shadow as in your CSS
//     ctx.shadowColor = "black";
//     ctx.shadowOffsetX = 3;
//     ctx.shadowOffsetY = 3;
//     ctx.shadowBlur = 3;

//     // Center text alignment
//     ctx.textAlign = "center";

//     // Calculate the horizontal center of the canvas
//     const centerX = canvas.width / 2;

//     // Position text at the top of the image
//     const topMargin = 50; // Distance from the top of the image
//     ctx.font = `${songTitleStyle.fontWeight} ${songTitleStyle.fontSize} ${songTitleStyle.fontFamily}`; // Apply font weight, size, and family
//     ctx.fillStyle = songTitleStyle.color; // Apply color
//     ctx.fillText(songTitleElement.innerText, centerX, topMargin); // Draw the song title centered at the top

//     // Calculate the vertical position for the artist name below the song title
//     const titleFontSize = parseFloat(songTitleStyle.fontSize); // Get the song title font size in pixels
//     const artistTop = topMargin + titleFontSize + 10; // Position artist name 10px below the song title

//     // Draw the artist name with its specific font size and style
//     ctx.font = `${artistNameStyle.fontStyle} ${artistNameStyle.fontSize} ${artistNameStyle.fontFamily}`; // Apply font style, size, and family
//     ctx.fillStyle = artistNameStyle.color; // Apply color
//     ctx.fillText(artistNameElement.innerText, centerX, artistTop); // Draw artist name below the song title, centered

//     // Convert canvas to a Blob and initiate download
//     canvas.toBlob(function (blob) {
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.download = "image.png";
//       link.click();
//     });
//   });

//
document
  .getElementById("downloadImage")
  .addEventListener("click", function (event) {
    event.preventDefault();

    const imageElement = document.getElementById("image");
    const overlayText = document.getElementById("overlayText");
    const songTitleElement = document.getElementById("songTitle");
    const artistNameElement = document.getElementById("artistName");

    // Get computed styles for title and artist name
    const songTitleStyle = window.getComputedStyle(songTitleElement);
    const artistNameStyle = window.getComputedStyle(artistNameElement);

    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions equal to the image dimensions
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;

    // Apply the image filter (if any)
    ctx.filter = imageElement.style.filter || "none";

    // Draw the image on the canvas
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    // Set the text shadow as in your CSS
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 3;

    // Center text alignment
    ctx.textAlign = "center";

    // Calculate the horizontal center of the canvas
    const centerX = canvas.width / 2;

    // Position text at the top of the image
    const topMargin = 50; // Distance from the top of the image

    // Set a larger font size for the song title and artist name
    const titleFontSize = parseFloat(songTitleStyle.fontSize) * 1.5; // Adjust multiplier as needed
    const artistFontSize = parseFloat(artistNameStyle.fontSize) * 1.5; // Adjust multiplier as needed

    // Draw the song title
    ctx.font = `${songTitleStyle.fontWeight} ${titleFontSize}px ${songTitleStyle.fontFamily}`; // Apply larger font size
    ctx.fillStyle = songTitleStyle.color; // Apply color
    ctx.fillText(songTitleElement.innerText, centerX, topMargin); // Draw the song title centered at the top

    // Calculate the vertical position for the artist name below the song title
    const artistTop = topMargin + titleFontSize + 10; // Position artist name 10px below the song title

    // Draw the artist name
    ctx.font = `${artistNameStyle.fontStyle} ${artistFontSize}px ${artistNameStyle.fontFamily}`; // Apply larger font size for artist name
    ctx.fillStyle = artistNameStyle.color; // Apply color
    ctx.fillText(artistNameElement.innerText, centerX, artistTop); // Draw artist name below the song title, centered

    // Convert canvas to a Blob and initiate download
    canvas.toBlob(function (blob) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "image.png";
      link.click();
    });
  });

//

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
  return data.summary; // Return the summarized text
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
  return data.keywords || []; // Assume this contains the extracted keywords
}

//
// async function generateImageFromKeywords(keywords, retries = 3) {
//   // 이미지 생성 시작 시 공유 및 다운로드 버튼 숨기기
//   const twitterButton = document.getElementById("shareTwitter");
//   const downloadButton = document.getElementById("downloadImage");
//   const imageElement = document.getElementById("image");
//   const loadingSpinner = document.getElementById("loadingSpinner");
//   const overlayText = document.getElementById("overlayText");

//   twitterButton.style.display = "none";
//   downloadButton.style.display = "none";
//   imageElement.style.display = "none";
//   overlayText.style.display = "none";
//   loadingSpinner.style.display = "block"; // 로딩 스피너 표시

//   const maxKeywordCount = 50;
//   const limitedKeywords = keywords.slice(0, maxKeywordCount);

//   for (let attempt = 0; attempt < retries; attempt++) {
//     try {
//       console.log(`Attempt ${attempt + 1}: Generating image...`);

//       const response = await fetch("/.netlify/functions/generate-image", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         // body: JSON.stringify({ inputTxt: keywords.join(", ") }),
//         body: JSON.stringify({
//           inputTxt: limitedKeywords.join(", "), // 키워드 입력
//         }),
//       });

//       if (response.ok) {
//         const result = await response.blob();
//         const objectURL = URL.createObjectURL(result);

//         // 이미지가 성공적으로 생성된 후에만 이미지와 버튼을 표시
//         imageElement.src = objectURL;
//         imageElement.style.display = "block";

//         overlayText.style.display = "block";

//         twitterButton.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
//           objectURL
//         )}&text=${encodeURIComponent("Check out this image I generated!")}`;
//         twitterButton.style.display = "block";

//         downloadButton.href = objectURL;
//         downloadButton.download = "image.png";
//         downloadButton.style.display = "block";

//         console.log("Image generated successfully.");
//         return; // 성공 시 함수 종료
//       } else {
//         throw new Error(`Failed to generate image: ${response.statusText}`);
//       }
//     } catch (error) {
//       console.error(`Attempt ${attempt + 1} failed:`, error);

//       if (attempt < retries - 1) {
//         console.log(`Retrying (${attempt + 2}/${retries})...`);
//       } else {
//         alert(
//           "Image generation failed after multiple attempts. Please try again later."
//         );
//       }
//     } finally {
//       loadingSpinner.style.display = "none"; // 모든 시도 후 스피너 숨기기
//     }
//   }
// }

//
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
  loadingSpinner.style.display = "block"; // Ensure spinner is shown at the start

  const maxKeywordCount = 50;
  const limitedKeywords = keywords.slice(0, maxKeywordCount);

  // Fetch with a timeout of 30 seconds
  const timeoutDuration = 30000; // 30 seconds

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
      ); // Timeout in 30 seconds

      if (response.ok) {
        const result = await response.blob();
        const objectURL = URL.createObjectURL(result);

        // Display the generated image
        imageElement.src = objectURL;
        imageElement.style.display = "block";

        overlayText.style.display = "block"; // Show overlay text
        twitterButton.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          objectURL
        )}&text=${encodeURIComponent("Check out this image I generated!")}`;
        twitterButton.style.display = "block";

        downloadButton.href = objectURL;
        downloadButton.download = "image.png";
        downloadButton.style.display = "block";

        console.log("Image generated successfully.");

        // Stop the spinner after success
        loadingSpinner.style.display = "none";

        return; // Exit the function after success
      } else {
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (error.message === "Request timeout") {
        // If it's a timeout, show a message that it's taking longer
        console.log(
          "Request is taking longer than expected, but continuing to wait..."
        );
        // Keep spinner active as the image may still load later
      } else if (attempt < retries - 1) {
        console.log(`Retrying (${attempt + 2}/${retries})...`);
        // Keep the spinner active during retries
      } else {
        // After the last retry fails, show an error message and stop the spinner
        alert(
          "Image generation failed after multiple attempts. Please try again later."
        );
        loadingSpinner.style.display = "none"; // Hide spinner after all retries fail
      }
    }
  }
}

// Custom fetch with timeout helper
function fetchWithTimeout(url, options, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timeout"));
    }, timeout);

    fetch(url, options)
      .then((response) => {
        clearTimeout(timer); // Clear the timeout if the request completes
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(timer); // Clear the timeout on error
        reject(err);
      });
  });
}

//

document
  .getElementById("summarizebutton")
  .addEventListener("click", function (event) {
    event.preventDefault();
    ////
    document.getElementById("summary").style.display = "block";
    ////

    // Get the lyrics from the text area or input field
    const lyrics = document.getElementById("lyrics").innerText.trim();
    const summaryElement = document.getElementById("summary");

    if (!lyrics) {
      summaryElement.innerText = "No lyrics to summarize.";
      summaryElement.classList.remove("summary-filled");
      return;
    }

    fetch("/summarize", {
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
          summaryElement.style.backgroundColor = ""; // Reset background color
          summaryElement.style.color = "#8fff9c";
        } else {
          summaryElement.innerText = "Failed to summarize.";
          summaryElement.classList.remove("summary-filled");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        summaryElement.innerText = "Failed to summarize.";
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
    formattedText += line + "<br>"; // 줄 바꿈을 위해 <br> 추가
  }

  element.innerHTML = formattedText; // innerText 대신 innerHTML 사용
}

document
  .getElementById("analyzebutton")
  .addEventListener("click", function (event) {
    event.preventDefault();
    ////
    document.getElementById("summary").style.display = "block";
    ////

    const lyrics = document.getElementById("lyrics").innerText.trim();
    const summaryElement = document.getElementById("summary");

    if (!lyrics) {
      summaryElement.innerText = "No lyrics to analyze.";
      summaryElement.classList.remove("summary-filled");
      return;
    }

    fetch("/summarize-content", {
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
          summaryElement.style.backgroundColor = data.moodColor; // Set background color based on mood
          summaryElement.style.color = data.textColor;
          summaryElement.classList.add("summary-filled");
        } else {
          summaryElement.innerText = "Failed to summarize content.";
          summaryElement.classList.remove("summary-filled");
        }
        formatTextByLines("summary", 10);
      })
      .catch((error) => {
        console.error("Error:", error);
        summaryElement.innerText = "Failed to summarize content.";
        summaryElement.classList.remove("summary-filled");
      });
  });
