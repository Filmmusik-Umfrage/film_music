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

// Screen anzeigen
function showScreen(screen) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

// Emotion Wheel zeichnen
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

  userRating = { x: x - rect.width / 2, y: y - rect.height / 2 };
  drawEmotionWheel();
  
  ctx.fillStyle = "#FF0000";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  selectedEmotionText.textContent = "Ausgewählte Emotion gespeichert!";
  nextButton.disabled = false;
});

nextButton.addEventListener("click", () => {
  userRatings.push(userRating);
  if (currentStep < videos.length - 1) {
    currentStep++;
    loadQuestion();
  } else {
    showScreen(endScreen);
  }
});

document.getElementById("start-button").addEventListener("click", () => {
  showScreen(questionScreen);
  loadQuestion();
});

function loadQuestion() {
  updateProgress();
  videoPlayer.src = videos[currentStep];
  videoPlayer.play();
  drawEmotionWheel();
  nextButton.disabled = true;
}
