(() => {
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const highScoreEl = document.getElementById("highScore");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayMsg = document.getElementById("overlayMsg");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const speedSelect = document.getElementById("speed");
  const dpadButtons = document.querySelectorAll(".dpad-btn");

  const GRID_SIZE = 20;
  const CELL = canvas.width / GRID_SIZE;
  const HIGH_SCORE_KEY = "nava-snake-high-score";

  let snake, direction, nextDirection, food, score, running, paused, loopId, tickMs;

  function loadHighScore() {
    return Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
  }

  function saveHighScore(value) {
    localStorage.setItem(HIGH_SCORE_KEY, String(value));
  }

  function resetState() {
    const mid = Math.floor(GRID_SIZE / 2);
    snake = [
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
      { x: mid - 3, y: mid },
    ];
    direction = "right";
    nextDirection = "right";
    score = 0;
    tickMs = Number(speedSelect.value);
    placeFood();
    updateScore();
  }

  function placeFood() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some((seg) => seg.x === pos.x && seg.y === pos.y));
    food = pos;
  }

  function updateScore() {
    scoreEl.textContent = score;
    highScoreEl.textContent = loadHighScore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(148,163,184,0.08)";
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(i * CELL, j * CELL, CELL, CELL);
        }
      }
    }

    ctx.fillStyle = "#f97316";
    roundRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4, 6);
    ctx.fill();

    snake.forEach((seg, idx) => {
      const isHead = idx === 0;
      ctx.fillStyle = isHead ? "#22c55e" : "rgba(34,197,94,0.75)";
      roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 6);
      ctx.fill();
    });
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function step() {
    if (!running || paused) return;

    direction = nextDirection;
    const head = { ...snake[0] };

    if (direction === "up") head.y -= 1;
    if (direction === "down") head.y += 1;
    if (direction === "left") head.x -= 1;
    if (direction === "right") head.x += 1;

    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE ||
      snake.some((seg) => seg.x === head.x && seg.y === head.y)
    ) {
      return gameOver();
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      updateScore();
      placeFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function gameLoop() {
    step();
    loopId = setTimeout(gameLoop, tickMs);
  }

  function startGame() {
    resetState();
    running = true;
    paused = false;
    pauseBtn.textContent = "일시정지";
    hideOverlay();
    clearTimeout(loopId);
    draw();
    loopId = setTimeout(gameLoop, tickMs);
  }

  function gameOver() {
    running = false;
    clearTimeout(loopId);
    const best = loadHighScore();
    if (score > best) {
      saveHighScore(score);
    }
    updateScore();
    overlayTitle.textContent = "게임 오버 💀";
    overlayMsg.innerHTML = `점수: <strong>${score}</strong><br>최고점수: <strong>${loadHighScore()}</strong>`;
    startBtn.textContent = "다시 시작";
    showOverlay();
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    pauseBtn.textContent = paused ? "재개" : "일시정지";
    if (!paused) draw();
  }

  function showOverlay() {
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function setDirection(dir) {
    const opposite = { up: "down", down: "up", left: "right", right: "left" };
    if (opposite[dir] === direction) return;
    nextDirection = dir;
  }

  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
  };

  document.addEventListener("keydown", (e) => {
    if (keyMap[e.key]) {
      e.preventDefault();
      if (!running) {
        startGame();
      }
      setDirection(keyMap[e.key]);
    } else if (e.key === " ") {
      e.preventDefault();
      togglePause();
    }
  });

  startBtn.addEventListener("click", startGame);
  pauseBtn.addEventListener("click", togglePause);

  dpadButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!running) startGame();
      setDirection(btn.dataset.dir);
    });
  });

  speedSelect.addEventListener("change", () => {
    tickMs = Number(speedSelect.value);
  });

  let touchStart = null;
  canvas.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });

  canvas.addEventListener("touchend", (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      setDirection(dx > 0 ? "right" : "left");
    } else {
      setDirection(dy > 0 ? "down" : "up");
    }
    if (!running) startGame();
    touchStart = null;
  }, { passive: true });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) startGame();
  });

  resetState();
  draw();
  updateScore();
})();
