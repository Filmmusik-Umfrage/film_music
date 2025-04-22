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

  // Hintergrund
  ctx.clearRect(0, 0, ratingCanvas.width, ratingCanvas.height);
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, ratingCanvas.width, ratingCanvas.height);

  // Kreis
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Achsen
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, ratingCanvas.height);
  ctx.moveTo(0, centerY);
  ctx.lineTo(ratingCanvas.width, centerY);
  ctx.stroke();

  // Achsen-Beschriftungen
  ctx.fillStyle = "#000000";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";

  ctx.fillText("aktivierend", centerX, 10);
  ctx.fillText("beruhigend", centerX, ratingCanvas.height - 10);
  ctx.fillText("angenehm", ratingCanvas.width - 10, centerY);
  ctx.fillText("unangenehm", 10, centerY);
}

// Emotion durch Klick erfassen
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

// Nächste Frage
nextButton.addEventListener("click", () => {
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
