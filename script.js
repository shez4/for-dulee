const panels = {
  lockScreen: document.querySelector("#lock-screen"),
  intro: document.querySelector("#intro"),
  journey: document.querySelector("#journey"),
  finale: document.querySelector("#finale"),
  datePlanner: document.querySelector("#date-planner"),
  endScreen: document.querySelector("#end-screen"),
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

let currentStep = 0;
let currentDateStep = 0;
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

