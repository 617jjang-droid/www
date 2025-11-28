let vocab = {}; // { day1: [{word:"apple", meaning:"사과"}, ...], day2: [...] }
let currentDay = null;
let quizWords = [];
let currentIndex = 0;
let showingMeaning = false;

const daySelect = document.getElementById("daySelect");
const wordInput = document.getElementById("wordInput");
const meaningInput = document.getElementById("meaningInput");
const addBtn = document.getElementById("addBtn");
const startQuizBtn = document.getElementById("startQuizBtn");
const quizElement = document.getElementById("quiz");
const wordElement = document.getElementById("word");
const meaningElement = document.getElementById("meaning");
const newDayInput = document.getElementById("newDayInput");
const addDayBtn = document.getElementById("addDayBtn");
const removeDayBtn = document.getElementById("removeDayBtn");

// 🔑 LocalStorage 저장/불러오기
function saveData() {
  localStorage.setItem("vocabData", JSON.stringify(vocab));
}

function loadData() {
  const data = localStorage.getItem("vocabData");
  if (data) {
    vocab = JSON.parse(data);
    updateDaySelect();
  } else {
    // 기본 Day 초기화
    ["day1", "day2", "day3"].forEach(day => {
      vocab[day] = [];
    });
    updateDaySelect();
  }
}

// Day 선택 박스 업데이트
function updateDaySelect() {
  daySelect.innerHTML = "";
  Object.keys(vocab).forEach(day => {
    const option = document.createElement("option");
    option.value = day;
    option.textContent = day;
    daySelect.appendChild(option);
  });
}

// Day 추가
addDayBtn.addEventListener("click", () => {
  const newDay = newDayInput.value.trim();
  if (!newDay) return alert("Day 이름을 입력하세요!");
  if (vocab[newDay]) return alert("이미 존재하는 Day입니다!");

  vocab[newDay] = [];
  updateDaySelect();
  saveData();
  newDayInput.value = "";
  alert(`${newDay} 추가 완료!`);
});

// Day 삭제
removeDayBtn.addEventListener("click", () => {
  const day = daySelect.value;
  if (!day) return alert("삭제할 Day를 선택하세요!");
  delete vocab[day];
  updateDaySelect();
  saveData();
  alert(`${day} 삭제 완료!`);
});

// 단어 추가
addBtn.addEventListener("click", () => {
  const day = daySelect.value;
  const word = wordInput.value.trim();
  const meaning = meaningInput.value.trim();

  if (!day || !word) return alert("Day와 단어를 입력하세요!");

  vocab[day].push({ word, meaning });
  saveData();
  wordInput.value = "";
  meaningInput.value = "";
  alert(`${day}에 단어 추가 완료!`);
});

// 퀴즈 시작
startQuizBtn.addEventListener("click", () => {
  currentDay = daySelect.value;
  if (!vocab[currentDay] || vocab[currentDay].length === 0) {
    alert("해당 Day에 단어가 없습니다!");
    return;
  }

  // 랜덤 섞기
  quizWords = [...vocab[currentDay]].sort(() => Math.random() - 0.5);
  currentIndex = 0;
  showWord();
  quizElement.addEventListener("click", handleClick);
});

// 단어 표시
function showWord() {
  wordElement.textContent = quizWords[currentIndex].word;
  meaningElement.style.display = "none";
  showingMeaning = false;
}

// 뜻 표시
function showMeaning() {
  meaningElement.textContent = quizWords[currentIndex].meaning || "뜻 없음";
  meaningElement.style.display = "block";
  showingMeaning = true;
}

// 다음 단어
function nextWord() {
  currentIndex++;
  if (currentIndex >= quizWords.length) {
    wordElement.textContent = "끝!";
    meaningElement.style.display = "none";
    quizElement.removeEventListener("click", handleClick);
  } else {
    showWord();
  }
}

// 클릭 이벤트
function handleClick() {
  if (!showingMeaning) {
    showMeaning();
  } else {
    nextWord();
  }
}

// 페이지 로드 시 데이터 불러오기
loadData();
