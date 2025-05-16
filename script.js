import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, update, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyDXfMY9wlXRRvGGTrYLJ195LJZZhud4zDs",
  authDomain: "filmmusik-umfrage.firebaseapp.com",
  databaseURL: "https://filmmusik-umfrage-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "filmmusik-umfrage",
  storageBucket: "filmmusik-umfrage.filestorage.app",
  messagingSenderId: "933950539609",
  appId: "1:933950539609:web:c109e0d10c45d0aaffee48",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Platzhalter für Videos
const videos = [
  "https://example.com/video1.mp4",
  "https://example.com/video2.mp4",
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
const selectedEmotionText = document.getElementById("selected-emotion");
const restartButton = document.getElementById("restart-button");

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

  ctx.clearRect(0, 0, ratingCanvas.width, ratingCanvas.height);
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, ratingCanvas.width, ratingCanvas.height);

  ctx.strokeStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function saveResult(videoIndex, rating) {
  const newResultRef = ref(database, `surveyResults/${Date.now()}`);
  set(newResultRef, { videoIndex, x: rating.x, y: rating.y, timestamp: new Date().toISOString() });
}

ratingCanvas.addEventListener("click", (event) => {
  const rect = ratingCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const centerX = ratingCanvas.width / 2;
  const centerY = ratingCanvas.height / 2;
  userRating = { x: x - centerX, y: y - centerY };

  drawEmotionWheel();
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  selectedEmotionText.textContent = "Emotion gespeichert!";
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
      showScreen(endScreen);
    }
  }
});

function loadQuestion() {
  updateProgress();
  videoPlayer.src = videos[currentStep];
  videoPlayer.play();
  drawEmotionWheel();
  nextButton.disabled = true;
  selectedEmotionText.textContent = "Bitte wählen Sie eine Emotion.";
  showScreen(questionScreen);
}

document.getElementById("start-button").addEventListener("click", () => {
  currentStep = 0;
  userRatings = [];
  loadQuestion();
});

restartButton.addEventListener("click", () => {
  showScreen(startScreen);
});
