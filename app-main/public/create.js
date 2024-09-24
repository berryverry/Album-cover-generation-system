// document.getElementById("btn").addEventListener("click", async function () {
//   const inputTxt = document.getElementById("input").value;
//   //
//   const imageElement = document.getElementById("image");
//   const loadingSpinner = document.getElementById("loadingSpinner");

//   imageElement.style.display = "none";
//   loadingSpinner.style.display = "block"; // 로딩 스피너 표시

//   try {
//     const response = await fetch("/.netlify/functions/generate-video", {
//       // Ensure this matches the Netlify function name
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ inputTxt }),
//     });

//     if (response.ok) {
//       const result = await response.blob();
//       const objectURL = URL.createObjectURL(result);
//       imageElement.src = objectURL;
//       imageElement.style.display = "block";
//     } else {
//       console.error("Error:", response.statusText);
//     }
//   } catch (error) {
//     console.error("Error:", error);
//   } finally {
//     // 로딩 스피너 숨기기
//     loadingSpinner.style.display = "none";
//   }
// });

document.getElementById("btn").addEventListener("click", async function () {
  const inputTxt = document.getElementById("input").value;
  const imageElement = document.getElementById("image");
  const loadingSpinner = document.getElementById("loadingSpinner");

  imageElement.style.display = "none";
  loadingSpinner.style.display = "block"; // 로딩 스피너 표시

  const MAX_RETRIES = 3; // 최대 재시도 횟수
  const TIMEOUT = 15000; // 15초 타임아웃 설정

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
          "/.netlify/functions/generate-video",
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
          return; // 성공 시 함수 종료
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
    await tryGenerateImage(MAX_RETRIES); // 재시도 로직 실행
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loadingSpinner.style.display = "none"; // 로딩 스피너 숨기기
  }
});
