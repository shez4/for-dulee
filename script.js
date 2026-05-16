const panels = {
  lockScreen: document.querySelector("#lock-screen"),
  intro: document.querySelector("#intro"),
  journey: document.querySelector("#journey"),
  finale: document.querySelector("#finale"),
  datePlanner: document.querySelector("#date-planner"),
  endScreen: document.querySelector("#end-screen"),
  games: document.querySelector("#games"),
};

const startButton = document.querySelector("#start-button");
const steps = [...document.querySelectorAll(".step-card")];
const stepNumber = document.querySelector("#step-number");
const stepTotal = document.querySelector("#step-total");
const backButton = document.querySelector("#back-button");
const nextButton = document.querySelector("#next-button");
const noButton = document.querySelector("#no-button");
const yesButton = document.querySelector("#yes-button");
const answerStage = document.querySelector("#answer-stage");
const finaleCard = document.querySelector(".finale-card");
const yesReveal = document.querySelector("#yes-reveal");
const planDateButton = document.querySelector("#plan-date-button");
const dateQuestions = [...document.querySelectorAll(".date-question")];
const dateSummary = document.querySelector("#date-summary");
const summaryTitle = document.querySelector("#summary-title");
const summaryText = document.querySelector("#summary-text");
const endButton = document.querySelector("#end-button");
const copyResultButton = document.querySelector("#copy-result-button");
const restartDateButton = document.querySelector("#restart-date-button");
const resultNote = document.querySelector("#result-note");
const photoImages = [...document.querySelectorAll(".collage-slot img")];
const navToggle = document.querySelector("#nav-toggle");
const siteNav = document.querySelector("#site-nav");
const navBackdrop = document.querySelector("#nav-backdrop");
const navClose = document.querySelector("#nav-close");

let currentStep = 0;
let currentDateStep = 0;
let snake;
let memory;
let breakout;
const allGames = [];
const datePlan = {
  date: "",
  cuisine: "",
};

const lightbox = document.querySelector("#lightbox");
const lightboxImg = document.querySelector("#lightbox-img");

photoImages.forEach((image) => {
  image.addEventListener("error", () => image.classList.add("is-missing"));

  const slot = image.closest(".collage-slot");
  slot.addEventListener("mouseenter", () => {
    lightboxImg.src = image.src;
    lightboxImg.alt = image.alt;
    lightbox.classList.add("active");
    lightbox.removeAttribute("aria-hidden");
  });
  slot.addEventListener("mouseleave", () => {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
  });
});

function showPanel(panelName) {
  Object.values(panels).forEach((panel) => panel.classList.remove("active"));
  panels[panelName].classList.add("active");
  if (navToggle) navToggle.hidden = panelName === "lockScreen";
  if (panelName !== "games") allGames.forEach((g) => g && g.pause());
}

const PASS_HASH = "a772c53d4c37cc18a687078f97ba62e59e64e0550805b6c27c8c09e3f5afabcf";

async function hashInput(input) {
  const encoded = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function attemptUnlock() {
  const input = document.querySelector("#lock-input").value;
  const hash = await hashInput(input);
  if (hash === PASS_HASH) {
    sessionStorage.setItem("unlocked", "1");
    showPanel("intro");
  } else {
    document.querySelector("#lock-error").textContent = "Wrong password. Try again.";
    document.querySelector("#lock-input").value = "";
    document.querySelector("#lock-input").focus();
  }
}

if (sessionStorage.getItem("unlocked") === "1") {
  showPanel("intro");
}

document.querySelector("#lock-submit").addEventListener("click", attemptUnlock);
document.querySelector("#lock-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") attemptUnlock();
  document.querySelector("#lock-error").textContent = "";
});

function openNav() {
  siteNav.classList.add("open");
  navBackdrop.classList.add("open");
  navToggle.setAttribute("aria-expanded", "true");
  siteNav.removeAttribute("aria-hidden");
}

function closeNav() {
  siteNav.classList.remove("open");
  navBackdrop.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  siteNav.setAttribute("aria-hidden", "true");
}

navToggle.addEventListener("click", openNav);
navClose.addEventListener("click", closeNav);
navBackdrop.addEventListener("click", closeNav);

document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    closeNav();
    const panel = btn.dataset.panel;
    if (panel === "journey") { showPanel("journey"); renderStep(); return; }
    showPanel(panel);
  });
});

function renderStep() {
  steps.forEach((step, index) => step.classList.toggle("active", index === currentStep));
  stepNumber.textContent = String(currentStep + 1);
  stepTotal.textContent = String(steps.length);
  backButton.disabled = currentStep === 0;
  nextButton.textContent = currentStep === steps.length - 1 ? "The question" : "Next";
}

function renderDateStep() {
  dateQuestions.forEach((question, index) => {
    question.classList.toggle("active", index === currentDateStep);
  });
  dateSummary.classList.remove("active");
}

function showDateSummary() {
  dateQuestions.forEach((question) => question.classList.remove("active"));
  summaryTitle.textContent = `${datePlan.date} + ${datePlan.cuisine}`;
  summaryText.textContent = getResultText();
  dateSummary.classList.add("active");
}

function getResultText() {
  return `Dulee said yes to being Chanel's girlfriend. Date plan: ${datePlan.date} with ${datePlan.cuisine} cuisine.`;
}

async function copyResult() {
  const result = getResultText();
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(result);
      resultNote.textContent = "Copied. Now she can paste it and send it to Chanel.";
      return;
    }
  } catch {
    resultNote.textContent = result;
  }
  resultNote.textContent = result;
}

function moveNoButton(pointerEvent) {
  const stageRect = answerStage.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const isMobile = window.matchMedia("(max-width: 680px)").matches;
  const padding = 14;
  const minLeft = isMobile ? padding : stageRect.width / 2 + 12;
  const maxLeft = Math.max(minLeft, stageRect.width - buttonRect.width - padding);
  const minTop = isMobile ? 104 : padding;
  const maxTop = Math.max(minTop, stageRect.height - buttonRect.height - padding);
  let left = minLeft + Math.random() * Math.max(1, maxLeft - minLeft);
  let top = minTop + Math.random() * Math.max(1, maxTop - minTop);

  if (pointerEvent) {
    const cursorX = pointerEvent.clientX - stageRect.left;
    const cursorY = pointerEvent.clientY - stageRect.top;
    const buttonCenterX = buttonRect.left - stageRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top - stageRect.top + buttonRect.height / 2;
    const distance = Math.hypot(cursorX - buttonCenterX, cursorY - buttonCenterY);

    if (distance > 150) {
      return;
    }

    const moveLeft = cursorX > buttonCenterX;
    const moveUp = cursorY > buttonCenterY;
    left = moveLeft ? minLeft : maxLeft;
    top = moveUp ? minTop : maxTop;
  }

  noButton.style.left = `${left}px`;
  noButton.style.top = `${top}px`;
}

startButton.addEventListener("click", () => {
  showPanel("journey");
  renderStep();
});

backButton.addEventListener("click", () => {
  currentStep = Math.max(0, currentStep - 1);
  renderStep();
});

nextButton.addEventListener("click", () => {
  if (currentStep === steps.length - 1) {
    showPanel("finale");
    return;
  }
  currentStep += 1;
  renderStep();
});

answerStage.addEventListener("pointermove", moveNoButton);
noButton.addEventListener("mouseenter", moveNoButton);
noButton.addEventListener("focus", () => moveNoButton());
noButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveNoButton();
});

yesButton.addEventListener("click", () => {
  finaleCard.classList.add("is-answered");
  yesReveal.classList.add("active");
  answerStage.classList.add("answered");
  noButton.style.display = "none";
  yesButton.textContent = "Yes!";

  const now = new Date();
  const formatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  document.querySelector("#anniversary-note").textContent = `Our Official Anniversary Date: ${formatted}`;
});

planDateButton.addEventListener("click", () => {
  showPanel("datePlanner");
  currentDateStep = 0;
  renderDateStep();
});

document.querySelectorAll(".choice-card").forEach((button) => {
  button.addEventListener("click", () => {
    datePlan[button.dataset.choiceType] = button.dataset.choice;
    if (currentDateStep === dateQuestions.length - 1) {
      showDateSummary();
      return;
    }
    currentDateStep += 1;
    renderDateStep();
  });
});

restartDateButton.addEventListener("click", () => {
  currentDateStep = 0;
  Object.keys(datePlan).forEach((key) => {
    datePlan[key] = "";
  });
  resultNote.textContent = "";
  renderDateStep();
});

endButton.addEventListener("click", () => {
  showPanel("endScreen");
});

copyResultButton.addEventListener("click", () => {
  copyResult();
});

document.querySelectorAll(".game-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".game-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const id = tab.dataset.game;
    document.querySelectorAll(".game-section").forEach((s) => s.hidden = true);
    document.querySelector(`#game-${id}`).hidden = false;
    allGames.forEach((g) => g && g.pause());
  });
});

class SnakeGame {
  constructor(canvas, scoreEl, bestEl, overlayEl, subEl, startBtn) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.scoreEl = scoreEl;
    this.bestEl = bestEl;
    this.overlayEl = overlayEl;
    this.subEl = subEl;
    this.startBtn = startBtn;
    this.best = 0;
    this.cellSize = 20;
    this.state = "idle";
    this._resize();
    this._bindInput();
  }

  _resize() {
    const stage = this.canvas.parentElement;
    const size = stage.getBoundingClientRect().width || Math.min(stage.clientWidth, 400);
    const px = Math.round(size);
    this.canvas.width = px;
    this.canvas.height = px;
    this.cols = Math.floor(px / this.cellSize);
    this.rows = Math.floor(px / this.cellSize);
  }

  reset() {
    const mid = Math.floor(this.cols / 2);
    this.snake = [{ x: mid, y: mid }];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.food = this._placeFood();
    this.score = 0;
    this.speed = 140;
    this.lastTick = 0;
    this.scoreEl.textContent = "0";
  }

  _placeFood() {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows) };
    } while (this.snake.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
  }

  _tick() {
    this.dir = this.nextDir;
    const head = {
      x: (this.snake[0].x + this.dir.x + this.cols) % this.cols,
      y: (this.snake[0].y + this.dir.y + this.rows) % this.rows,
    };
    if (this.snake.some((s) => s.x === head.x && s.y === head.y)) {
      this._die();
      return;
    }
    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.scoreEl.textContent = this.score;
      if (this.score > this.best) { this.best = this.score; this.bestEl.textContent = this.best; }
      this.food = this._placeFood();
      this.speed = Math.max(70, this.speed - 3);
    } else {
      this.snake.pop();
    }
  }

  _draw() {
    const { ctx, canvas, cellSize } = this;
    ctx.fillStyle = "#130915";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#d9a448";
    ctx.font = `${cellSize - 2}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♥", this.food.x * cellSize + cellSize / 2, this.food.y * cellSize + cellSize / 2);

    this.snake.forEach((seg, i) => {
      const alpha = Math.max(0.35, 1 - (i / this.snake.length) * 0.65);
      ctx.fillStyle = i === 0 ? "#a94f77" : `rgba(169,79,119,${alpha})`;
      const p = i === 0 ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(seg.x * cellSize + p, seg.y * cellSize + p, cellSize - p * 2, cellSize - p * 2, 4);
      ctx.fill();
    });
  }

  _die() {
    this.state = "dead";
    cancelAnimationFrame(this.animId);
    this.overlayEl.classList.add("visible");
    this.subEl.textContent = `Score: ${this.score}. Play again?`;
    this.startBtn.textContent = "Restart";
  }

  _loop(ts) {
    if (this.state !== "playing") return;
    if (ts - this.lastTick >= this.speed) { this._tick(); this.lastTick = ts; }
    this._draw();
    this.animId = requestAnimationFrame((ts) => this._loop(ts));
  }

  start() {
    this._resize();
    this.reset();
    this.state = "playing";
    this.overlayEl.classList.remove("visible");
    this.animId = requestAnimationFrame((ts) => this._loop(ts));
  }

  pause() {
    if (this.state === "playing") {
      this.state = "paused";
      cancelAnimationFrame(this.animId);
    }
  }

  _bindInput() {
    const dirMap = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
      a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
    };
    document.addEventListener("keydown", (e) => {
      if (this.state !== "playing") return;
      const d = dirMap[e.key];
      if (!d) return;
      if (d.x === -this.dir.x && d.y === -this.dir.y) return;
      e.preventDefault();
      this.nextDir = d;
    });

    let tx = 0, ty = 0;
    this.canvas.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    this.canvas.addEventListener("touchend", (e) => {
      if (this.state !== "playing") return;
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.nextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      } else {
        this.nextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      }
    }, { passive: true });
  }
}

snake = new SnakeGame(
  document.querySelector("#snake-canvas"),
  document.querySelector("#snake-score"),
  document.querySelector("#snake-best"),
  document.querySelector("#snake-overlay"),
  document.querySelector("#snake-sub"),
  document.querySelector("#snake-start"),
);
document.querySelector("#snake-start").addEventListener("click", () => snake.start());
allGames.push(snake);

class MemoryGame {
  constructor(gridEl, movesEl, pairsEl, overlayEl, subEl, startBtn) {
    this.gridEl = gridEl;
    this.movesEl = movesEl;
    this.pairsEl = pairsEl;
    this.overlayEl = overlayEl;
    this.subEl = subEl;
    this.startBtn = startBtn;
    this.emojis = ["♥", "🌸", "✨", "🎵", "🌙", "💫", "🦋", "🌹"];
    this.total = this.emojis.length;
    this.state = "idle";
    this._render();
  }

  _render() {
    const deck = [...this.emojis, ...this.emojis].sort(() => Math.random() - 0.5);
    this.cards = deck.map((emoji, i) => ({ emoji, i, matched: false }));
    this.gridEl.innerHTML = "";
    this.cards.forEach((card) => {
      const btn = document.createElement("button");
      btn.className = "memory-card";
      btn.type = "button";
      btn.dataset.index = card.i;
      btn.innerHTML = `<span class="memory-front">✦</span><span class="memory-back">${card.emoji}</span>`;
      btn.addEventListener("click", () => this._flip(card.i, btn));
      this.gridEl.appendChild(btn);
      card.el = btn;
    });
  }

  start() {
    this.moves = 0;
    this.matched = 0;
    this.flipped = [];
    this.locked = false;
    this.movesEl.textContent = "0";
    this.pairsEl.textContent = `0 / ${this.total}`;
    this.overlayEl.classList.remove("visible");
    this._render();
    this.state = "playing";
  }

  _flip(index, el) {
    if (this.locked || this.state !== "playing") return;
    if (el.classList.contains("flipped") || el.classList.contains("matched")) return;
    el.classList.add("flipped");
    this.flipped.push({ index, el });
    if (this.flipped.length === 2) {
      this.locked = true;
      this.moves++;
      this.movesEl.textContent = this.moves;
      this._check();
    }
  }

  _check() {
    const [a, b] = this.flipped;
    if (this.cards[a.index].emoji === this.cards[b.index].emoji) {
      a.el.classList.add("matched");
      b.el.classList.add("matched");
      this.matched++;
      this.pairsEl.textContent = `${this.matched} / ${this.total}`;
      this.flipped = [];
      this.locked = false;
      if (this.matched === this.total) this._win();
    } else {
      setTimeout(() => {
        a.el.classList.remove("flipped");
        b.el.classList.remove("flipped");
        this.flipped = [];
        this.locked = false;
      }, 900);
    }
  }

  _win() {
    this.state = "won";
    this.overlayEl.classList.add("visible");
    this.subEl.textContent = `Done in ${this.moves} moves!`;
    this.startBtn.textContent = "Play again";
  }

  pause() {}
}

memory = new MemoryGame(
  document.querySelector("#memory-grid"),
  document.querySelector("#memory-moves"),
  document.querySelector("#memory-pairs"),
  document.querySelector("#memory-overlay"),
  document.querySelector("#memory-sub"),
  document.querySelector("#memory-start"),
);
document.querySelector("#memory-start").addEventListener("click", () => memory.start());
allGames.push(memory);

class BreakoutGame {
  constructor(canvas, scoreEl, livesEl, overlayEl, subEl, startBtn) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.scoreEl = scoreEl;
    this.livesEl = livesEl;
    this.overlayEl = overlayEl;
    this.subEl = subEl;
    this.startBtn = startBtn;
    this.state = "idle";
    this._bindInput();
  }

  _resize() {
    const stage = this.canvas.parentElement;
    const size = Math.round(stage.getBoundingClientRect().width) || Math.min(stage.clientWidth, 400);
    this.canvas.width = size;
    this.canvas.height = size;
  }

  reset() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.score = 0;
    this.lives = 3;
    this.scoreEl.textContent = "0";
    this.livesEl.textContent = "3";

    this.paddle = { w: w * 0.22, h: 10, x: w / 2 - w * 0.11, y: h - 28 };

    const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 4);
    const spd = w * 0.007;
    this.ball = { x: w / 2, y: h - 55, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, r: Math.max(5, w * 0.016) };

    const cols = 7, rows = 5;
    const bw = (w - 20) / cols - 4;
    const bh = Math.max(12, h * 0.04);
    const palette = ["#751d46", "#a94f77", "#3b1451", "#a94f77", "#751d46"];
    this.bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.bricks.push({ x: 10 + c * (bw + 4), y: 36 + r * (bh + 5), w: bw, h: bh, color: palette[r], alive: true });
      }
    }
  }

  _bindInput() {
    this.canvas.addEventListener("mousemove", (e) => {
      if (this.state !== "playing") return;
      const rect = this.canvas.getBoundingClientRect();
      this.paddle.x = (e.clientX - rect.left) * (this.canvas.width / rect.width) - this.paddle.w / 2;
    });
    this.canvas.addEventListener("touchmove", (e) => {
      if (this.state !== "playing") return;
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      this.paddle.x = (e.touches[0].clientX - rect.left) * (this.canvas.width / rect.width) - this.paddle.w / 2;
    }, { passive: false });
  }

  _update() {
    const { canvas, ball, paddle } = this;
    const w = canvas.width, h = canvas.height;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -1; }
    if (ball.x + ball.r > w) { ball.x = w - ball.r; ball.vx *= -1; }
    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }

    paddle.x = Math.max(0, Math.min(w - paddle.w, paddle.x));

    if (ball.vy > 0 && ball.y + ball.r > paddle.y && ball.y - ball.r < paddle.y + paddle.h &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
      const hit = (ball.x - paddle.x) / paddle.w;
      const angle = -Math.PI / 2 + (hit - 0.5) * (Math.PI * 0.7);
      const spd = Math.hypot(ball.vx, ball.vy);
      ball.vx = Math.cos(angle) * spd;
      ball.vy = Math.sin(angle) * spd;
      ball.y = paddle.y - ball.r;
    }

    if (ball.y > h + ball.r) {
      this.lives--;
      this.livesEl.textContent = this.lives;
      if (this.lives <= 0) { this._end("Game over. Score: " + this.score, "Restart"); return; }
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 4);
      const spd = Math.hypot(ball.vx, ball.vy);
      ball.x = w / 2; ball.y = h - 55;
      ball.vx = Math.cos(angle) * spd; ball.vy = Math.sin(angle) * spd;
    }

    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      if (ball.x + ball.r > brick.x && ball.x - ball.r < brick.x + brick.w &&
          ball.y + ball.r > brick.y && ball.y - ball.r < brick.y + brick.h) {
        brick.alive = false;
        this.score += 10;
        this.scoreEl.textContent = this.score;
        ball.vy *= -1;
        break;
      }
    }

    const spd = Math.hypot(ball.vx, ball.vy);
    if (spd < w * 0.013) { ball.vx *= 1.0003; ball.vy *= 1.0003; }

    if (this.bricks.every((b) => !b.alive)) this._end("You cleared it! Score: " + this.score, "Play again");
  }

  _draw() {
    const { ctx, canvas, ball, paddle, bricks } = this;
    ctx.fillStyle = "#130915";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    bricks.forEach((b) => {
      if (!b.alive) return;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 3);
      ctx.fill();
    });

    ctx.fillStyle = "#a94f77";
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 5);
    ctx.fill();

    ctx.fillStyle = "#d9a448";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  }

  _end(msg, btnLabel) {
    this.state = "over";
    cancelAnimationFrame(this.animId);
    this.overlayEl.classList.add("visible");
    this.subEl.textContent = msg;
    this.startBtn.textContent = btnLabel;
  }

  _loop() {
    if (this.state !== "playing") return;
    this._update();
    this._draw();
    this.animId = requestAnimationFrame(() => this._loop());
  }

  start() {
    this._resize();
    this.reset();
    this.state = "playing";
    this.overlayEl.classList.remove("visible");
    this.animId = requestAnimationFrame(() => this._loop());
  }

  pause() {
    if (this.state === "playing") {
      this.state = "paused";
      cancelAnimationFrame(this.animId);
    }
  }
}

breakout = new BreakoutGame(
  document.querySelector("#breakout-canvas"),
  document.querySelector("#breakout-score"),
  document.querySelector("#breakout-lives"),
  document.querySelector("#breakout-overlay"),
  document.querySelector("#breakout-sub"),
  document.querySelector("#breakout-start"),
);
document.querySelector("#breakout-start").addEventListener("click", () => breakout.start());
allGames.push(breakout);
