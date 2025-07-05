const canvas = document.getElementById("puzzleCanvas");
const ctx = canvas.getContext("2d");
const shuffleBtn = document.getElementById("shuffleBtn");
const difficultySelect = document.getElementById("difficulty");
const musicBtn = document.getElementById("toggleMusic");
const bgMusic = document.getElementById("bgMusic");
const memeVideo = document.getElementById("memeVideo");

let rows = 4;
let cols = 4;
let pieces = [];
let img;
let pieceSize;
let dragging = null;
let offsetX = 0, offsetY = 0;
let imageName = "";

const imageList = ["cat1.jpeg"]; // Make sure this file exists in ../images/

function randomImage() {
  imageName = imageList[Math.floor(Math.random() * imageList.length)];
  console.log("Selected image:", imageName);
  return `../images/${imageName}`;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function loadImageAndCreatePuzzle() {
  img = new Image();
  img.src = randomImage();
  img.onload = () => {
    console.log("Image loaded successfully");
    createPieces();
    drawPuzzle();
  };
  img.onerror = () => {
    console.error("Failed to load image:", img.src);
  };
}

function createPieces() {
  pieces = [];
  pieceSize = canvas.width / cols;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      pieces.push({
        correctX: x * pieceSize,
        correctY: y * pieceSize,
        x: x * pieceSize,
        y: y * pieceSize,
        currentX: 0,
        currentY: 0
      });
    }
  }
  shuffleArray(pieces);
  let index = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      pieces[index].currentX = x * pieceSize;
      pieces[index].currentY = y * pieceSize;
      index++;
    }
  }
}

function drawPuzzle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of pieces) {
    ctx.drawImage(
      img,
      p.correctX, p.correctY, pieceSize, pieceSize,
      p.currentX, p.currentY, pieceSize, pieceSize
    );
    ctx.strokeRect(p.currentX, p.currentY, pieceSize, pieceSize);
  }
}

function getPieceAt(x, y) {
  return pieces.find(p =>
    x > p.currentX && x < p.currentX + pieceSize &&
    y > p.currentY && y < p.currentY + pieceSize
  );
}

canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const clicked = getPieceAt(x, y);
  if (clicked) {
    dragging = clicked;
    offsetX = x - dragging.currentX;
    offsetY = y - dragging.currentY;
  }
});

canvas.addEventListener("mousemove", e => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  dragging.currentX = e.clientX - rect.left - offsetX;
  dragging.currentY = e.clientY - rect.top - offsetY;
  drawPuzzle();
});

canvas.addEventListener("mouseup", () => {
  if (!dragging) return;
  const snappedX = Math.round(dragging.currentX / pieceSize) * pieceSize;
  const snappedY = Math.round(dragging.currentY / pieceSize) * pieceSize;
  dragging.currentX = snappedX;
  dragging.currentY = snappedY;
  dragging = null;
  drawPuzzle();
  checkWin();
});

function checkWin() {
  const win = pieces.every(p =>
    Math.abs(p.currentX - p.correctX) < 5 &&
    Math.abs(p.currentY - p.correctY) < 5
  );
  if (win) {
    console.log("Puzzle solved!");
    memeVideo.src = `../videos/${imageName.replace(".jpeg", ".mp4")}`;
    memeVideo.style.display = "block";
    memeVideo.play();
  }
}

shuffleBtn.onclick = () => {
  rows = cols = parseInt(difficultySelect.value);
  memeVideo.style.display = "none";
  loadImageAndCreatePuzzle();
};

musicBtn.onclick = () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicBtn.textContent = "🔈";
  } else {
    bgMusic.pause();
    musicBtn.textContent = "🔊";
  }
};

window.onload = () => {
  bgMusic.volume = 0.3;
  loadImageAndCreatePuzzle();
};
