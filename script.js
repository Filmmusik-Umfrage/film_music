import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXfMY9wlXRRvGGTrYLJ195LJZZhud4zDs",
  authDomain: "filmmusik-umfrage.firebaseapp.com",
  databaseURL: "https://filmmusik-umfrage-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "filmmusik-umfrage",
  storageBucket: "filmmusik-umfrage.firebasestorage.app",
  messagingSenderId: "933950539609",
  appId: "1:933950539609:web:c109e0d10c45d0aaffee48",
  measurementId: "G-Y5312Z41S9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Placeholder videos
const videos = [
  "https://player.vimeo.com/external/854232.sd.mp4?s=23d9c2beec2f93c645eed3df181e894aaf66d5c0&profile_id=164",
  "https://player.vimeo.com/external/857146.sd.mp4?s=d05933d3e9a3dc12f8e94b9de0b183ba7d84f93d&profile_id=164",
  "https://player.vimeo.com/external/856385.sd.mp4?s=6cbdcd7ad5b2ed7daff7f75969b78de546c57092&profile_id=164"
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

  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, ratingCanvas.width, ratingCanvas.height);

  ctx.strokeStyle = "#000000";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX, 20);
  ctx.lineTo(centerX, ratingCanvas.height - 20);
  ctx.moveTo(20, centerY);
  ctx.lineTo(ratingCanvas.width - 20, centerY);
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
  ctx.fillStyle = "#FF0000";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  selectedEmotionText.textContent = "Emotion gespeichert!";
  nextButton.disabled = false;
});

nextButton.addEventListener("click", () => {
  userRatings.push(userRating);
  userRating = null;

  if (currentStep < videos.length - 1) {
    currentStep++;
    loadQuestion();
  } else {
    incrementSurveyCount();
    showScreen(endScreen);
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

// Increment the survey count in Firebase Realtime Database
function incrementSurveyCount() {
  const surveyCountRef = ref(database, "surveyCount");

  get(surveyCountRef).then((snapshot) => {
    if (snapshot.exists()) {
      const currentCount = snapshot.val();
      update(surveyCountRef, { ".value": currentCount + 1 });
    } else {
      set(surveyCountRef, 1);
    }
  }).catch((error) => {
    console.error("Error updating survey count:", error);
  });
}
