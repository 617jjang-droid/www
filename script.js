let words = [];
let currentIndex = 0;
let showingMeaning = false;

const wordElement = document.getElementById("word");
const meaningElement = document.getElementById("meaning");
const quizElement = document.getElementById("quiz");
const fileInput = document.getElementById("fileInput");

// OCR로 이미지 읽기
fileInput.addEventListener("change", async () => {
  if (!fileInput.files || fileInput.files.length === 0) return;
  const file = fileInput.files[0];

  const { data: { text } } = await Tesseract.recognize(file, "eng");

  // OCR 결과를 줄 단위로 나누고 "단어 - 뜻" 형태로 파싱
  const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);

  words = lines.map(line => {
    let word = "";
    let meaning = "";

    // 1) 하이픈(-)으로 구분
    if (line.includes("-")) {
      const parts = line.split("-");
      word = parts[0].trim();
      meaning = parts[1]?.trim() || "";
    }
    // 2) 콜론(:)으로 구분
    else if (line.includes(":")) {
      const parts = line.split(":");
      word = parts[0].trim();
      meaning = parts[1]?.trim() || "";
    }
    // 3) 공백으로 구분 (단어 + 뜻)
    else {
      const parts = line.split(" ");
      word = parts[0].trim();
      meaning = parts.slice(1).join(" ").trim();
    }

    return { word, meaning };
  });

  currentIndex = 0;
  showWord();
});

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
