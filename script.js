let words = [];
let currentIndex = 0;
let showingMeaning = false;

const wordElement = document.getElementById("word");
const meaningElement = document.getElementById("meaning");
const quizElement = document.getElementById("quiz");
const fileInput = document.getElementById("fileInput");

// 이미지 잘라내기 함수 (canvas 활용)
function cropImage(image, x, y, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
  return canvas;
}

// OCR 실행 함수
async function runOCR(file) {
  const img = new Image();
  img.src = URL.createObjectURL(file);

  return new Promise((resolve) => {
    img.onload = async () => {
      const width = img.width;
      const height = img.height;

      // 세로 4등분 영역 정의
      const regions = [
        { x: 0, y: 0, w: width, h: height / 4 },        // 1번: 영어 단어
        { x: 0, y: height / 4, w: width, h: height / 4 }, // 2번: 뜻
        { x: 0, y: height / 2, w: width, h: height / 4 }, // 3번: 영어 단어
        { x: 0, y: (3 * height) / 4, w: width, h: height / 4 } // 4번: 뜻
      ];

      let wordList = [];
      let meaningList = [];

      // 각 영역 OCR 실행
      for (let i = 0; i < regions.length; i++) {
        const r = regions[i];
        const cropped = cropImage(img, r.x, r.y, r.w, r.h);

        const { data: { text } } = await Tesseract.recognize(cropped, "eng+kor");

        // 줄 단위로 나누기
        const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);

        if (i % 2 === 0) {
          // 1,3번 영역 → 영어 단어
          wordList = wordList.concat(lines);
        } else {
          // 2,4번 영역 → 뜻
          meaningList = meaningList.concat(lines);
        }
      }

      // 단어-뜻 매칭 (뜻이 없으면 "뜻 없음" 표시)
      words = wordList.map((w, idx) => {
        return { word: w, meaning: meaningList[idx] ? meaningList[idx] : "뜻 없음" };
      });

      currentIndex = 0;
      showWord();
      resolve();
    };
  });
}

// 파일 업로드 이벤트
fileInput.addEventListener("change", async () => {
  if (!fileInput.files || fileInput.files.length === 0) return;
  const file = fileInput.files[0];
  await runOCR(file);
});

// 퀴즈 표시 함수들
function showWord() {
  if (words.length === 0) {
    wordElement.textContent = "단어 없음";
    meaningElement.style.display = "none";
    return;
  }
  wordElement.textContent = words[currentIndex].word;
  meaningElement.style.display = "none";
  showingMeaning = false;
}

function showMeaning() {
  meaningElement.textContent = words[currentIndex].meaning;
  meaningElement.style.display = "block";
  showingMeaning = true;
}

function nextWord() {
  currentIndex++;
  if (currentIndex >= words.length) {
    wordElement.textContent = "끝!";
    meaningElement.style.display = "none";
    quizElement.removeEventListener("click", handleClick);
  } else {
    showWord();
  }
}

function handleClick() {
  if (!showingMeaning) {
    showMeaning();
  } else {
    nextWord();
  }
}

quizElement.addEventListener("click", handleClick);
