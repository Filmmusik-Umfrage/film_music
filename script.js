import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  // Firebase-Konfiguration
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const videos = [
  // Video-URLs
];

let currentStep = 0;
let userRatings = [];

const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const startScreen = document.getElementById("start-screen");
const questionScreen = document.getElementById("question-screen");
const endScreen = document.getElementById("end-screen");
const videoPlayer = document.getElementById("video-player");
const ratingCanvas = document.getElementById("rating-canvas");
const nextButton = document.getElementById("next-button");
const tooltip = document.getElementById("tooltip");

const ctx = ratingCanvas.getContext("2d");
let userRating = null;

function updateProgress() {
  const progress = ((currentStep + 1) / videos.length) * 100;
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `${Math.round(progress)}%`;
}

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

function drawEmotionWheel() {
  const centerX = ratingCanvas.width / 2;
  const centerY = ratingCanvas.height / 2;
  const radius = Math.min(centerX, centerY) - 20;

  ctx.fillStyle = "#2c2c2c";
  ctx.fillRect(0, 0, ratingCanvas.width, ratingCanvas.height);

  ctx.strokeStyle = "#f9a602";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
}

ratingCanvas.addEventListener("click", (event) => {
  const rect = ratingCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const centerX = ratingCanvas.width / 2;
  const centerY = ratingCanvas.height / 2;
  userRating = { x: x - centerX, y: y - centerY };

  drawEmotionWheel();
  ctx.fillStyle = "#e50914";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  tooltip.textContent = "Emotion gespeichert!";
  nextButton.disabled = false;
});

nextButton.addEventListener("click", () => {
  if (userRating) {
    saveResult(currentStep, userRating);
    userRatings.push(userRating);
    userRating = null;

    if (currentStep < videos.length - 1) {
      currentStep++;
      loadQuestion();
    } else {
      incrementSurveyCount();
      showScreen(endScreen);
    }
  }
});

document.getElementById("start-button").addEventListener("click", () => {
  currentStep = 0;
  userRatings = [];
  loadQuestion();
});

function saveResult(videoIndex, rating) {
  const newResultRef = ref(database, `surveyResults/${Date.now()}`);
  set(newResultRef, {
    videoIndex: videoIndex,
    x: rating.x,
    y: rating.y,
    timestamp: new Date().toISOString(),
  });
}

function incrementSurveyCount() {
  const surveyCountRef = ref(database, "surveyCount");

  get(surveyCountRef).then((snapshot) => {
    if (snapshot.exists()) {
      const currentCount = snapshot.val();
      update(surveyCountRef, { ".value": currentCount + 1 });
    } else {
      set(surveyCountRef, 1);
    }
  });
}

function loadQuestion() {
  updateProgress();
  videoPlayer.src = videos[currentStep];
  videoPlayer.play();
  drawEmotionWheel();
  nextButton.disabled = true;
  tooltip.textContent = "Bitte wählen Sie eine Emotion.";
  showScreen(questionScreen);
}
