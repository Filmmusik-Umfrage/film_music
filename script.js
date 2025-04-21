import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyDXfMY9wlXRRvGGTrYLJ195LJZZhud4zDs",
  authDomain: "filmmusik-umfrage.firebaseapp.com",
  projectId: "filmmusik-umfrage",
  storageBucket: "filmmusik-umfrage.firebasestorage.app",
  messagingSenderId: "933950539609",
  appId: "1:933950539609:web:c109e0d10c45d0aaffee48",
  measurementId: "G-Y5312Z41S9"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Videos und Fortschritt
const videos = ["video1.mp4", "video2.mp4", "video3.mp4"];
let currentStep = 0;
let userRatings = [];

// HTML-Elemente
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

// Fortschrittsbalken aktualisieren
function updateProgress() {
  const progress = ((currentStep + 1) / videos.length) * 100;
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `${Math.round(progress)}%`;
}

// Bildschirm anzeigen
function showScreen(screen) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

// Emotionen-Rad zeichnen
function drawEmotionWheel() {
  const centerX = ratingCanvas.width / 2;
  const centerY = ratingCanvas.height / 2;
  const radius = Math.min(centerX, centerY) - 20;

  ctx.clearRect(0, 0, ratingCanvas.width, ratingCanvas.height);
  
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

  ctx.fillStyle = "#000000";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("aktivierend", centerX, 10);
  ctx.fillText("beruhigend", centerX, ratingCanvas.height - 10);
  ctx.fillText("angenehm", ratingCanvas.width - 10, centerY);
  ctx.fillText("unangenehm", 10, centerY);
}

// Emotion auf Klick speichern
ratingCanvas.addEventListener("click", (event) => {
  const rect = ratingCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const centerX = ratingCanvas.width / 2;
  const centerY = ratingCanvas.height / 2;
  const relX = x - centerX;
  const relY = y - centerY;

  userRating = { x: relX, y: relY };
  drawEmotionWheel();

  ctx.fillStyle = "#FF0000";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  selectedEmotionText.textContent = "Ausgewählte Emotion gespeichert!";
  nextButton.disabled = false;
});

// Benutzerbewertung in Firestore speichern
async function saveUserRating(videoId, rating) {
  const userId = `user_${Date.now()}`; // Einfache eindeutige Benutzer-ID (für echte Apps verbessern)
  const docRef = doc(db, "userRatings", `${userId}_${videoId}`);
  await setDoc(docRef, {
    videoId: videoId,
    rating: rating,
    timestamp: new Date()
  });
  console.log("Rating gespeichert in Firestore!");
}

// Nächste Frage
nextButton.addEventListener("click", async () => {
  if (userRating) {
    await saveUserRating(videos[currentStep], userRating);
  }

  userRatings.push(userRating);
  userRating = null;

  if (currentStep < videos.length - 1) {
    currentStep++;
    loadQuestion();
  } else {
    showScreen(endScreen);
  }
});

// Frage laden
function loadQuestion() {
  updateProgress();
  videoPlayer.src = videos[currentStep];
  videoPlayer.play();
  drawEmotionWheel();
  nextButton.disabled = true;
  selectedEmotionText.textContent = "Bitte wählen Sie Ihre Emotion durch Klicken auf das Rad aus.";
  showScreen(questionScreen);
}

// Start-Button
document.getElementById("start-button").addEventListener("click", () => {
  currentStep = 0;
  userRatings = [];
  loadQuestion();
});
