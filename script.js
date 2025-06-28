// --- Variablen ---
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

const videos = [
  "Umfrage_Video_3.mp4",
  "Umfrage_Video_2.mp4",
  "Umfrage_Video_1_neu.mp4",
  "keinVideo.mp4"
];
const songs = [
  "Filmmusik_4_neu.wav",
  "", // <-- kein Song für das zweite Video
  "Filmmusik_2_neu.wav",
  "Filmmusik_3_neu.wav"
];

// Arrays mischen, damit Reihenfolge zufällig ist
shuffleArray(videos);
shuffleArray(songs);

let currentStep = 0;
let userRatings = [];

const startScreen = document.getElementById("start-screen");
const questionScreen = document.getElementById("question-screen");
const extraQuestionsScreen = document.getElementById("extra-questions-screen");
const endScreen = document.getElementById("end-screen");

const videoPlayer = document.getElementById("video-player");
const backgroundAudio = document.getElementById("background-audio");
const valenceArousalCanvas = document.getElementById("valenceArousalCanvas");
const vaCtx = valenceArousalCanvas.getContext("2d");
const vaCoordinates = document.getElementById("vaCoordinates");
const nextButton = document.getElementById("next-button");
const extraQuestionsForm = document.getElementById("extra-questions-form");

let userRating = null;

// --- Instrument Animation ---
const instrumentImages = [
  // "cello-1871396_1920.png", // entfernt
  "cornet-37677_1920.png",
  "cymbals-37675_1920.png",
  // "electric-guitar-154123_1920.png", // entfernt
  "harp-145302_1920.png",
  "maestro-33911_1920.png",
  "marimba-1398160_1920.png",
  "saxophone-312202_1920.png",
  "violin-35272_1920.png",
  // "violin-35275_1920.png", // entfernt
  "woman-4636377_1920.png"
];
const instrumentContainer = document.getElementById('instrument-container');
let currentInstrumentIndex = 0;

function showInstrumentImages(container = instrumentContainer) {
  container.innerHTML = '';
  if (instrumentImages.length === 0) return;
  const imgIndex = currentInstrumentIndex % instrumentImages.length;

  // Wrapper für Bild und Noten
  const wrapper = document.createElement('div');
  wrapper.className = 'instrument-img-wrapper';

  const img = document.createElement('img');
  img.src = instrumentImages[imgIndex];
  img.className = 'instrument-img';
  img.style.filter = "invert(1)";
  img.onerror = () => {
    img.style.display = "none";
    container.innerHTML = "<div style='color:red'>Bild nicht gefunden: " + instrumentImages[imgIndex] + "</div>";
  };
  wrapper.appendChild(img);
  container.appendChild(wrapper);

  // Nach wrapper.appendChild(img);
  setTimeout(() => {
    img.classList.add('visible');
    // Optional: kleine "Welle" beim Einblenden
    img.style.transform = "scale(1.08) rotate(2deg)";
    setTimeout(() => {
      img.style.transform = "scale(1) rotate(0deg)";
    }, 400);
  }, 80 + Math.random() * 200);

  // Musiknoten-Positionen bestimmen
  let notePositions = [];
  let showNotes = true;
  let showWaves = false;

  if (instrumentImages[imgIndex] === "harp-145302_1920.png") {
    // Noten an verschiedenen Saiten der Harfe erscheinen lassen
    notePositions.push({ left: 60, bottom: 120 });   // Saite links
    notePositions.push({ left: 90, bottom: 100 });   // Saite mittig links
    notePositions.push({ left: 120, bottom: 80 });   // Saite mittig rechts
    notePositions.push({ left: 150, bottom: 60 });   // Saite rechts
  } else if (instrumentImages[imgIndex] === "cornet-37677_1920.png") {
    // Trompete: Noten rechts, dann links
    notePositions.push({ left: -20, bottom: 120 });
    notePositions.push({ left: -35, bottom: 135 });
    notePositions.push({ left: -50, bottom: 150 });
    notePositions.push({ left: -65, bottom: 165 });
  } else if (instrumentImages[imgIndex] === "woman-4636377_1920.png") {
    // Geigenspielerin: Noten an der Geige (rechts unten) in die Luft steigen lassen
    for (let i = 0; i < 4; i++) {
      notePositions.push({
        left: 150 + i * 15,
        bottom: 160 + i * 8
      });
    }
  } else if (instrumentImages[imgIndex] === "maestro-33911_1920.png") {
    // Dirigent: Noten oben am Dirigentenstock erscheinen lassen
    for (let i = 0; i < 4; i++) {
      notePositions.push({
        left: 50 + i * 12,   // leicht nach rechts versetzt
        bottom: 210 + i * 5   // oben im Bild, leicht ansteigend
      });
    }
  } else if (instrumentImages[imgIndex] === "cymbals-37675_1920.png") {
    // Cymbal: Keine Noten, sondern Schallwellen anzeigen
    showNotes = false;
    showWaves = true;
  } else if (instrumentImages[imgIndex] === "marimba-1398160_1920.png") {
    // Marimba: Noten in einer Reihe über dem Instrument erscheinen lassen
    for (let i = 0; i < 4; i++) {
      notePositions.push({
        left: 60 + i * 45,   // gleichmäßig über dem Instrument verteilt
        bottom: 180          // über dem Instrument
      });
    }
  } else if (instrumentImages[imgIndex] === "saxophone-312202_1920.png") {
    // Saxophon: Noten aus dem Schallloch nach unten "herabsteigen" lassen
    for (let i = 0; i < 4; i++) {
      notePositions.push({
        left: 180 + i * 8,      // Position am Schallloch, ggf. anpassen
        bottom: 170 - i * 25    // Start oben, dann weiter unten
      });
    }
  } else if (instrumentImages[imgIndex] === "violin-35272_1920.png") {
    // Noten über der Geige erscheinen lassen
    for (let i = 0; i < 4; i++) {
      notePositions.push({
        left: 120 + i * 18,   // über der Geige, leicht verteilt
        bottom: 170 + i * 10  // über dem Instrument, leicht ansteigend
      });
    }
  } else {
    // Standard: Noten mittig/unten in einer Reihe
    for (let i = 0; i < 4; i++) {
      notePositions.push({
        left: 70 + i * 35,
        bottom: 20
      });
    }
  }

  // Musiknoten erzeugen
  if (showNotes) {
    setTimeout(() => {
      notePositions.forEach((pos, i) => {
        const noteImg = document.createElement('img');
        noteImg.src = "musical-note-1314941_1920.png";
        noteImg.className = 'music-note-img';
        noteImg.style.left = pos.left + "px";
        noteImg.style.bottom = pos.bottom + "px";
        noteImg.style.animationDelay = (i * 0.18) + "s";
        wrapper.appendChild(noteImg);
        setTimeout(() => noteImg.remove(), 1500 + i * 200);
      });
    }, 1000); // 1 Sekunde warten, bevor die Noten erscheinen
  }

  // Schallwellen für Cymbal erzeugen
  if (showWaves) {
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        const wave = document.createElement('div');
        wave.className = 'sound-wave';
        wave.style.left = "110px";
        wave.style.bottom = "120px";
        wave.style.animationDelay = (i * 0.22) + "s";
        wrapper.appendChild(wave);
        setTimeout(() => wave.remove(), 1400 + i * 200);
      }
    }, 1000); // Auch Schallwellen nach 1 Sekunde
  }

  currentInstrumentIndex = (currentInstrumentIndex + 1) % instrumentImages.length;
}

setInterval(showInstrumentImages, 3000);
showInstrumentImages();

// --- Reveal Bild pixelweise ---
function revealImagePixelByPixel(imgSrc, container, duration = 1200) {
  container.innerHTML = "";

  // Bild vorbereiten (unsichtbar)
  const img = new Image();
  img.src = imgSrc;
  img.style.display = "none";
  img.width = 260;
  img.height = 260;
  container.appendChild(img);

  // Canvas für Pixel-Effekt
  const canvas = document.createElement("canvas");
  canvas.width = 260;
  canvas.height = 260;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  container.appendChild(canvas);

  img.onload = () => {
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Alle Pixel-Positionen sammeln und mischen (optional: für zufällige Reihenfolge)
    let pixels = [];
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        pixels.push({ x, y });
      }
    }
    // Optional: für zufälliges Erscheinen
    // for (let i = pixels.length - 1; i > 0; i--) {
    //   const j = Math.floor(Math.random() * (i + 1));
    //   [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
    // }

    const pixelsPerFrame = 100; // Weniger = langsamer, mehr = schneller
    let revealed = 0;

    function drawStep() {
      for (let i = 0; i < pixelsPerFrame && revealed < pixels.length; i++, revealed++) {
        const { x, y } = pixels[revealed];
        const idx = (y * canvas.width + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        const a = imageData.data[idx + 3] / 255;
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fillRect(x, y, 1, 1);
      }
      if (revealed < pixels.length) {
        requestAnimationFrame(drawStep);
      } else {
        img.style.display = "block";
        canvas.remove();
      }
    }
    drawStep();
  };
}

// --- Valence-Arousal Modell Zeichnen ---
function drawValenceArousalModel(selectedQuadrant = null) {
  const width = valenceArousalCanvas.width;
  const height = valenceArousalCanvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 10;
  vaCtx.clearRect(0, 0, width, height);

  // Hintergrund komplett schwarz
  vaCtx.fillStyle = "#000";
  vaCtx.fillRect(0, 0, width, height);

  // Dunklere Farben für die Quadranten (nach Tausch: 0 = Traurigkeit, 1 = Vergnügen, 2 = Freude, 3 = Wut)
  const quadrantColors = [
    [80, 40, 120],    // 0: Traurigkeit (vorher Wut)
    [30, 90, 140],    // 1: Vergnügen (vorher Freude)
    [30, 120, 60],    // 2: Freude (vorher Vergnügen)
    [220, 0, 0]       // 3: Wut (vorher Traurigkeit)
  ];

  // --- Radialer Verlauf: Mitte weiß, Rand kräftige dunkle Quadrantenfarbe ---
  const imageData = vaCtx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;

      // Korrekte Quadrantenerkennung
      let angle = Math.atan2(dy, dx);
      let q = null;
      if (angle >= Math.PI / 2 && angle <= Math.PI) q = 0; // oben links (Wut)
      else if (angle >= 0 && angle < Math.PI / 2) q = 1;   // oben rechts (Freude)
      else if (angle >= -Math.PI / 2 && angle < 0) q = 2;  // unten rechts (Vergnügen)
      else if (angle >= -Math.PI && angle < -Math.PI / 2) q = 3; // unten links (Traurigkeit)

      if (q !== null) {
        const t = dist / radius;
        const r = Math.round((1 - t) * 255 + t * quadrantColors[q][0]);
        const g = Math.round((1 - t) * 255 + t * quadrantColors[q][1]);
        const b = Math.round((1 - t) * 255 + t * quadrantColors[q][2]);
        const alpha = 1;
        const idx = (y * width + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = Math.floor(alpha * 255);
      }
    }
  }
  vaCtx.putImageData(imageData, 0, 0);

  // Entferne die Verfärbung des gesamten Kreises
  // if (selectedQuadrant !== null) {
  //   vaCtx.beginPath();
  //   vaCtx.arc(cx, cy, radius, 0, 2 * Math.PI);
  //   vaCtx.closePath();
  //   vaCtx.fillStyle = `rgba(${quadrantColors[selectedQuadrant][0]},${quadrantColors[selectedQuadrant][1]},${quadrantColors[selectedQuadrant][2]},0.45)`;
  //   vaCtx.fill();
  // }

  vaCtx.beginPath();
  vaCtx.arc(cx, cy, radius, 0, 2 * Math.PI);
  vaCtx.lineWidth = 3;
  vaCtx.strokeStyle = "#fff"; // Rahmen jetzt schwarz
  vaCtx.stroke();

  // --- Abgedunkelte Linien für Achsen mit sanfterem Farbverlauf ---
  {
    // Vertikale Linie (oben nach unten)
    let gradV = vaCtx.createLinearGradient(cx, cy - radius, cx, cy + radius);
    gradV.addColorStop(0, "#fff");    // Mitte weiß
    gradV.addColorStop(0.7, "#ccc");  // sanftes Grau
    gradV.addColorStop(1, "#888");    // Rand nur leicht grau
    vaCtx.strokeStyle = gradV;
    vaCtx.beginPath();
    vaCtx.moveTo(cx, cy - radius);
    vaCtx.lineTo(cx, cy + radius);
    vaCtx.lineWidth = 2.5;
    vaCtx.stroke();

    // Horizontale Linie (links nach rechts)
    let gradH = vaCtx.createLinearGradient(cx - radius, cy, cx + radius, cy);
    gradH.addColorStop(0, "#888");    // linker Rand leicht grau
    gradH.addColorStop(0.3, "#ccc");  // sanftes Grau
    gradH.addColorStop(0.5, "#fff");  // Mitte weiß
    gradH.addColorStop(0.7, "#ccc");  // sanftes Grau
    gradH.addColorStop(1, "#888");    // rechter Rand leicht grau
    vaCtx.strokeStyle = gradH;
    vaCtx.beginPath();
    vaCtx.moveTo(cx - radius, cy);
    vaCtx.lineTo(cx + radius, cy);
    vaCtx.lineWidth = 2.5;
    vaCtx.stroke();
  }

  vaCtx.font = "bold 15px Arial";
  vaCtx.fillStyle = "#333";
  vaCtx.textAlign = "center";
  vaCtx.fillText("AROUSAL", cx, cy - radius - 15);

  vaCtx.font = "bold 15px Arial";
  vaCtx.fillStyle = "#black";
  vaCtx.fillText("active", cx, cy - radius + 20);
  vaCtx.fillText("passive", cx, cy + radius + -15);
  vaCtx.fillText("positive", cx + radius - 40, cy + 5);
  vaCtx.fillText("negative", cx - radius + 40, cy + 5);

  vaCtx.font = "bold 20px Arial";
  vaCtx.fillStyle = "#333";
  vaCtx.fillText("Wut", cx - radius / 2.8, cy - radius / 5);
  vaCtx.fillText("Freude", cx + radius / 2.8, cy - radius / 5);
  vaCtx.fillText("Vergnügen", cx + radius / 2.8, cy + radius / 3.7);
  vaCtx.fillText("Traurigkeit", cx - radius / 2.8, cy + radius / 3.7);

  vaCtx.font = "14px Arial";
  vaCtx.fillStyle = "#333";
  vaCtx.fillText("wachsam", cx + radius / 3, cy - radius / 1.3);
  vaCtx.fillText("aufgeregt", cx + radius / 2, cy - radius / 1.6);
  vaCtx.fillText("enthusiastisch", cx + radius / 1.8, cy - radius / 2.2);
  vaCtx.fillText("begeistert", cx + radius / 1.45, cy - radius / 3.5);
  vaCtx.fillText("glückselig", cx + radius / 1.35, cy - radius / 9);

  
  vaCtx.fillText("verärgert", cx - radius / 1.3, cy - radius / 8);

  vaCtx.fillText("gestresst", cx - radius / 1.4, cy - radius / 3);
  vaCtx.fillText("nervös", cx - radius / 1.7, cy - radius / 1.85);
  vaCtx.fillText("angespannt", cx - radius / 3, cy - radius / 1.35);

  vaCtx.fillText("traurig", cx - radius / 1.3, cy + radius / 7.3);
  vaCtx.fillText("deprimiert", cx - radius / 1.5, cy + radius / 2.5);
  vaCtx.fillText("träge", cx - radius / 1.7, cy + radius / 1.65);
  vaCtx.fillText("gelangweilt", cx - radius / 3.2, cy + radius / 1.25);


  vaCtx.fillText("zufrieden", cx + radius / 1.3, cy + radius / 7.3);
  vaCtx.fillText("gelassen", cx + radius / 1.5, cy + radius / 2.5);
  vaCtx.fillText("entspannt", cx + radius / 1.9, cy + radius / 1.65);
  vaCtx.fillText("ruhig", cx + radius / 3, cy + radius / 1.25);


  // --- Neutral in die Mitte ---
  vaCtx.font = "bold 15px Arial";
  vaCtx.fillStyle = "#black";
  vaCtx.fillText("neutral", cx, cy + 5);
}

// --- Klick auf Valence-Arousal Canvas ---
valenceArousalCanvas.addEventListener("click", (event) => {
  const rect = valenceArousalCanvas.getBoundingClientRect();
  const scaleX = valenceArousalCanvas.width / rect.width; // Skalierungsfaktor X
  const scaleY = valenceArousalCanvas.height / rect.height; // Skalierungsfaktor Y

  const x = (event.clientX - rect.left) * scaleX; // Berücksichtige Skalierung
  const y = (event.clientY - rect.top) * scaleY;  // Berücksichtige Skalierung

  const width = valenceArousalCanvas.width;
  const height = valenceArousalCanvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 10;

  // Prüfen, ob der Klick innerhalb des Kreises liegt
  const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
  if (dist > radius) {
    vaCoordinates.textContent = "Bitte wählen Sie einen Punkt innerhalb des Kreises aus.";
    return;
  }

  const valence = ((x / valenceArousalCanvas.width) * 2) - 1;
  const arousal = 1 - ((y / valenceArousalCanvas.height) * 2);

  userRating = { valence: valence.toFixed(2), arousal: arousal.toFixed(2), x, y };

  // Quadrant bestimmen: 0=Wut, 1=Freude, 2=Vergnügen, 3=Traurigkeit
  let q = null;
  if (userRating.valence < 0 && userRating.arousal > 0) q = 0; // Wut
  else if (userRating.valence > 0 && userRating.arousal > 0) q = 1; // Freude
  else if (userRating.valence > 0 && userRating.arousal < 0) q = 2; // Vergnügen
  else if (userRating.valence < 0 && userRating.arousal < 0) q = 3; // Traurigkeit

  drawValenceArousalModel(q);

  vaCtx.beginPath();
  vaCtx.arc(x, y, 6, 0, Math.PI * 2); // kleinerer Pointer
  vaCtx.fillStyle = "#ff4500";
  vaCtx.shadowColor = "rgba(255, 69, 0, 0.7)";
  vaCtx.shadowBlur = 10;
  vaCtx.fill();
  vaCtx.lineWidth = 4;
  vaCtx.strokeStyle = "#fff";
  vaCtx.stroke();

  vaCoordinates.textContent = "";
  nextButton.style.display = "inline-block"; // Button anzeigen
  nextButton.disabled = false;
});

// Funktion, die den nächsten gültigen Step sucht
function findNextValidStep(startIndex = 0) {
  for (let i = startIndex; i < videos.length; i++) {
    if (!(videos[i] === "keinVideo.mp4" && !songs[i])) {
      return i;
    }
  }
  return -1; // keine gültige Szene mehr
}

// --- Video und Screens Steuerung ---
document.getElementById("start-button").addEventListener("click", () => {
  startScreen.classList.remove("active");
  startScreen.style.display = "none";
  questionScreen.classList.add("active");
  questionScreen.style.display = "block";

  // Animation stoppen
  if (typeof instrumentInterval !== "undefined") clearInterval(instrumentInterval);
  instrumentContainer.innerHTML = "";

  // Suche ersten gültigen Step
  currentStep = findNextValidStep(0);
  if (currentStep === -1) {
    document.getElementById("video-question").textContent = "Keine gültige Szene verfügbar.";
    return;
  }

  // Das erste Video abspielen
  videoPlayer.src = videos[currentStep];

  // Mobil-Check und ggf. stummschalten
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (videos[currentStep] === "Umfrage_Video_1_neu.mp4" && isMobile) {
    videoPlayer.muted = true;
  } else {
    videoPlayer.muted = false;
  }

  videoPlayer.style.display = "block";
  videoPlayer.play();

  // Dynamisch den Text setzen basierend auf den Bedingungen
  const videoQuestion = document.getElementById("video-question");

  if (videos[currentStep] !== "keinVideo.mp4" && songs[currentStep]) {
    // Fall: Video mit Musik
    backgroundAudio.src = songs[currentStep];
    backgroundAudio.currentTime = 0;
    backgroundAudio.volume = 0.6;
    backgroundAudio.play();
    videoQuestion.textContent = "Wie wirkt die Szene?";
  } else if (videos[currentStep] !== "keinVideo.mp4" && !songs[currentStep]) {
    // Fall: Video ohne Musik
    backgroundAudio.pause();
    backgroundAudio.src = "";
    videoQuestion.textContent = "Wie wirkt die Szene ohne Musik?";
  } else if (videos[currentStep] === "keinVideo.mp4" && songs[currentStep]) {
    // Fall: Musik ohne Bild
    backgroundAudio.src = songs[currentStep];
    backgroundAudio.currentTime = 0;
    backgroundAudio.volume = 0.6;
    backgroundAudio.play();
    videoPlayer.style.display = "none";
    videoQuestion.textContent = "Wie wirkt die Musik ohne Bild?";

    // Button "Auswahl treffen" erstellen und anzeigen
    const selectionButton = document.createElement("button");
    selectionButton.textContent = "Auswahl treffen";
    selectionButton.style.display = "inline-block";
    selectionButton.style.marginTop = "20px";
    selectionButton.style.padding = "10px 20px";
    selectionButton.style.fontSize = "16px";
    selectionButton.style.cursor = "pointer";
    questionScreen.appendChild(selectionButton);

    // Event Listener für den Button
    selectionButton.addEventListener("click", () => {
      valenceArousalCanvas.style.display = "block";
      drawValenceArousalModel();
      nextButton.style.display = "inline-block"; // Button anzeigen
      nextButton.disabled = false;
      selectionButton.style.display = "none"; // Auswahl-Button ausblenden
    });
  } else {
    // Fallback: Falls keine der Bedingungen zutrifft
    // Sicherstellen, dass immer eine gültige Szene angezeigt wird
    if (videos[currentStep] === "keinVideo.mp4") {
      // Wenn kein Video vorhanden ist, aber keine Musik, wähle ein Video mit Musik
      videos[currentStep] = videos.find(video => video !== "keinVideo.mp4");
      songs[currentStep] = songs.find(song => song !== "");
      videoPlayer.src = videos[currentStep];
      backgroundAudio.src = songs[currentStep];
      backgroundAudio.currentTime = 0;
      backgroundAudio.volume = 0.6;
      backgroundAudio.play();
      videoQuestion.textContent = "Wie wirkt die Szene?";
    } else {
      // Standardfall: Video ohne Musik
      backgroundAudio.pause();
      backgroundAudio.src = "";
      videoQuestion.textContent = "Wie wirkt die Szene ohne Musik?";
    }
  }

  videoQuestion.style.display = "block";
});

videoPlayer.addEventListener("ended", () => {
  // Video immer ausblenden
  videoPlayer.style.display = "none";
  // Canvas immer einblenden
  valenceArousalCanvas.style.display = "block";
  drawValenceArousalModel();

  // Text anzeigen, wenn KEIN Song vorhanden ist
  const videoQuestion = document.getElementById("video-question");
  if (!songs[currentStep] && videos[currentStep] !== "keinVideo.mp4") {
    videoQuestion.textContent = "Wie wirkt die Szene ohne Musik?";
  } else if (videos[currentStep] === "keinVideo.mp4") {
    videoQuestion.textContent = "Wie wirkt die Musik ohne Bild?";
  } else {
    videoQuestion.textContent = "Wie wirkt die Szene?";
  }

  nextButton.style.display = "none"; // Button ausblenden, bis geklickt wird
  nextButton.disabled = true;

  backgroundAudio.pause();
  backgroundAudio.currentTime = 0;
});

nextButton.addEventListener("click", () => {
  if (!userRating) return alert("Bitte wählen Sie einen Punkt im Valence-Arousal Modell aus.");

  userRatings.push({
    video: videos[currentStep],
    valence: parseFloat(userRating.valence),
    arousal: parseFloat(userRating.arousal),
    song: songs[currentStep] // <--- Song hinzufügen
  });

  // Suche nächsten gültigen Step
  currentStep = findNextValidStep(currentStep + 1);

  if (currentStep !== -1) {
    valenceArousalCanvas.style.display = "none";
    videoPlayer.style.display = "block";
    videoPlayer.src = videos[currentStep];

    // Mobil-Check und ggf. stummschalten
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (videos[currentStep] === "Umfrage_Video_1_neu.mp4" && isMobile) {
      videoPlayer.muted = true;
    } else {
      videoPlayer.muted = false;
    }

    videoPlayer.play();

    // Dynamisch den Text setzen basierend auf den Bedingungen
    const videoQuestion = document.getElementById("video-question");
    if (videos[currentStep] !== "keinVideo.mp4" && songs[currentStep]) {
      // Fall: Video mit Musik
      backgroundAudio.src = songs[currentStep];
      backgroundAudio.currentTime = 0;
      backgroundAudio.volume = 0.6;
      backgroundAudio.play();
      videoQuestion.textContent = "Wie wirkt die Szene?";
    } else if (videos[currentStep] !== "keinVideo.mp4" && !songs[currentStep]) {
      // Fall: Video ohne Musik
      backgroundAudio.pause();
      backgroundAudio.src = "";
      videoQuestion.textContent = "Wie wirkt die Szene ohne Musik?";
    } else if (videos[currentStep] === "keinVideo.mp4" && songs[currentStep]) {
      // Fall: Musik ohne Bild
      backgroundAudio.src = songs[currentStep];
      backgroundAudio.currentTime = 0;
      backgroundAudio.volume = 0.6;
      backgroundAudio.play();
      videoPlayer.style.display = "none";
      videoQuestion.textContent = "Wie wirkt die Musik ohne Bild?";
      videoQuestion.style.display = "block"; // Sicherstellen, dass der Text angezeigt wird

      // Button "Auswahl treffen" erstellen und anzeigen
      const selectionButton = document.createElement("button");
      selectionButton.textContent = "Auswahl treffen";
      selectionButton.style.display = "inline-block";
      selectionButton.style.marginTop = "20px";
      selectionButton.style.padding = "10px 20px";
      selectionButton.style.fontSize = "16px";
      selectionButton.style.cursor = "pointer";
      questionScreen.appendChild(selectionButton);

      // Event Listener für den Button
      selectionButton.addEventListener("click", () => {
        valenceArousalCanvas.style.display = "block";
        drawValenceArousalModel();
        nextButton.style.display = "inline-block"; // Button anzeigen
        nextButton.disabled = false;
        selectionButton.style.display = "none"; // Auswahl-Button ausblenden
      });
    } else {
      // Fallback: Falls keine der Bedingungen zutrifft
      videoQuestion.textContent = "Keine gültige Szene verfügbar.";
    }

    userRating = null;
    nextButton.style.display = "none"; // Button wieder ausblenden
    nextButton.disabled = true;
    vaCoordinates.textContent = "";

    // Nach dem Video wieder Standardfarben anzeigen
    drawValenceArousalModel();
  } else {
    backgroundAudio.pause();
    backgroundAudio.currentTime = 0;
    // Nur die Fragen-Seite anzeigen, alles andere ausblenden
    questionScreen.classList.remove("active");
    questionScreen.style.display = "none";
    valenceArousalCanvas.style.display = "none";
    videoPlayer.style.display = "none";
    extraQuestionsScreen.classList.add("active");
    extraQuestionsScreen.style.display = "block";
  }
});

// --- Cookie-Prüfung: Teilnahme nur einmal pro Browser ---
function hasCompletedSurvey() {
  return document.cookie.split(';').some(c => c.trim().startsWith('umfrageAbgeschlossen='));
}

// Wenn Cookie gesetzt, Umfrage blockieren
if (hasCompletedSurvey()) {
  document.getElementById("app").innerHTML = `
    <div style="text-align:center; margin-top:100px;">
      <h2>Sie haben bereits an der Umfrage teilgenommen.</h2>
    </div>
  `;
}

// Animation starten, wenn die Endseite angezeigt wird
extraQuestionsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(extraQuestionsForm);
  const extraAnswers = Object.fromEntries(formData.entries());

  // Daten an Firestore senden
  try {
    await db.collection("umfrageAntworten").add({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      ratings: userRatings,
      extra: extraAnswers
    });
    console.log("Daten erfolgreich gespeichert!");
    // Cookie setzen: 1 Jahr gültig
    document.cookie = "umfrageAbgeschlossen=true; max-age=31536000; path=/";
  } catch (err) {
    console.error("Fehler beim Speichern in Firebase:", err);
  }

  extraQuestionsScreen.classList.remove("active");
  extraQuestionsScreen.style.display = "none";
  endScreen.classList.add("active");
  endScreen.style.display = "flex";
  endScreen.innerHTML = `
    <div style="margin:auto; text-align:center;">
      <h1 style="color:#fff; font-size:2.2rem; margin-bottom:1rem;">Vielen Dank!</h1>
      <p style="font-size:1.2rem; color:#fff;">Sie haben die Umfrage erfolgreich abgeschlossen.</p>
      <div id="end-instrument-container"></div>
    </div>
  `;

  startEndScreenAnimation(); // Animation direkt starten
});

// Funktion zur Animation auf der Endseite
function startEndScreenAnimation() {
  const endInstrumentContainer = document.getElementById('end-instrument-container');
  endInstrumentContainer.innerHTML = '';
  showInstrumentImages(endInstrumentContainer); // Erste Animation direkt starten
  setInterval(() => {
    showInstrumentImages(endInstrumentContainer);
  }, 3000); // Wiederholende Animation alle 3 Sekunden
}

// --- Reveal Bild mit Partikeln ---
function revealImageWithParticles(imgSrc, container, duration = 1200, particleCount = 900) {
  container.innerHTML = "";

  // Bild vorbereiten (unsichtbar)
  const img = new Image();
  img.src = imgSrc;
  img.style.display = "none";
  img.width = 260;
  img.height = 260;
  container.appendChild(img);

  // Canvas für Partikel
  const canvas = document.createElement("canvas");
  canvas.width = 260;
  canvas.height = 260;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  container.appendChild(canvas);

  img.onload = () => {
    // Bild auf Canvas zeichnen, um Pixel zu lesen
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Partikel erzeugen
    let particles = [];
    let tries = 0;
    while (particles.length < particleCount && tries < particleCount * 3) {
      tries++;
      let x = Math.floor(Math.random() * canvas.width);
      let y = Math.floor(Math.random() * canvas.height);
      let idx = (y * canvas.width + x) * 4;
      if (imageData[idx + 3] > 40) { // nur sichtbare Pixel
        particles.push({
          sx: Math.random() * canvas.width, // Startpunkt: zufällig
          sy: canvas.height + 40 + Math.random() * 40, // Start unterhalb
          tx: x,
          ty: y,
          color: `rgba(${imageData[idx]},${imageData[idx+1]},${imageData[idx+2]},${imageData[idx+3]/255})`,
          progress: 0
        });
      }
    }

    // Animation
    let start = null;
    function animate(ts) {
      if (!start) start = ts;
      let elapsed = ts - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let done = true;
      for (let p of particles) {
        p.progress = Math.min(1, elapsed / duration + Math.random() * 0.12);
        // Ease-out
        let ease = 1 - Math.pow(1 - p.progress, 2.5);
        let px = p.sx + (p.tx - p.sx) * ease;
        let py = p.sy + (p.ty - p.sy) * ease;
        ctx.globalAlpha = Math.min(1, p.progress * 1.2);
        ctx.beginPath();
        ctx.arc(px, py, 1.2 + Math.random() * 1.1, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8 * (1 - p.progress);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (p.progress < 1) done = false;
      }
      ctx.globalAlpha = 1;

      if (!done) {
        requestAnimationFrame(animate);
      } else {
        img.style.display = "block";
        canvas.remove();
      }
    }
    animate();
  };
}

// --- Reveal Bild Puzzle-Effekt ---
function revealImagePixelPuzzle(imgSrc, container, duration = 1200, blockSize = 4) {
  container.innerHTML = "";

  // Bild vorbereiten (unsichtbar)
  const img = new Image();
  img.src = imgSrc;
  img.style.display = "none";
  img.width = 260;
  img.height = 260;
  container.appendChild(img);

  // Canvas für Puzzle-Effekt
  const canvas = document.createElement("canvas");
  canvas.width = 260;
  canvas.height = 260;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  container.appendChild(canvas);

  img.onload = () => {
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Blöcke vorbereiten
    let blocks = [];
    for (let y = 0; y < canvas.height; y += blockSize) {
      for (let x = 0; x < canvas.width; x += blockSize) {
        blocks.push({ x, y });
      }
    }
    // Reihenfolge mischen für Puzzle-Effekt
    for (let i = blocks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    }

    const blocksPerFrame = Math.ceil(blocks.length / (duration / 16));
    let revealed = 0;

    function drawStep() {
      for (let i = 0; i < blocksPerFrame && revealed < blocks.length; i++, revealed++) {
        const { x, y } = blocks[revealed];
        const w = Math.min(blockSize, canvas.width - x);
        const h = Math.min(blockSize, canvas.height - y);
        // Block aus Bilddaten holen und zeichnen
        ctx.putImageData(
          ctx.getImageData(x, y, w, h),
          x, y
        );
      }
      if (revealed < blocks.length) {
        requestAnimationFrame(drawStep);
      } else {
        img.style.display = "block";
        canvas.remove();
      }
    }
    // Canvas leeren und Animation starten
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStep();
  };
}

// --- Firebase Konfiguration ---
const firebaseConfig = {
  apiKey: "AIzaSyDXfMY9wlXRRvGGTrYLJ195LJZZhud4zDs",
  authDomain: "filmmusik-umfrage.firebaseapp.com",
  databaseURL: "https://filmmusik-umfrage-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "filmmusik-umfrage",
  storageBucket: "filmmusik-umfrage.appspot.com",
  messagingSenderId: "933950539609",
  appId: "1:933950539609:web:c109e0d10c45d0aaffee48",
  measurementId: "G-Y5312Z41S9"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Nach videoPlayer.src = videos[currentStep];
videoPlayer.src = videos[currentStep];

// Mobil-Check
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (videos[currentStep] === "Umfrage_Video_1_neu.mp4" && isMobile) {
  videoPlayer.muted = true;
} else {
  videoPlayer.muted = false;
}

videoPlayer.play();

// --- Datenschutz-Modal ---
document.getElementById("privacy-link")?.addEventListener("click", function(e) {
  e.preventDefault();
  document.getElementById("privacy-modal").style.display = "flex";
});
document.getElementById("close-privacy-modal")?.addEventListener("click", function() {
  document.getElementById("privacy-modal").style.display = "none";
});

