"use strict";

const minutesInput = document.querySelector("#minutes");
const secondsInput = document.querySelector("#seconds");
const display = document.querySelector("#display");
const status = document.querySelector("#status");
const startPauseButton = document.querySelector("#start-pause");
const resetButton = document.querySelector("#reset");

let configuredDuration = durationFromInputs();
let remaining = configuredDuration;
let startedAt = 0;
let running = false;
let animationFrameId = 0;

function durationFromInputs() {
  const minutes = Math.max(0, Number(minutesInput.value) || 0);
  const seconds = Math.min(59, Math.max(0, Number(secondsInput.value) || 0));
  return (Math.floor(minutes) * 60 + Math.floor(seconds)) * 1000;
}

function formatTime(milliseconds) {
  const safeMilliseconds = Math.max(0, milliseconds);
  const totalHundredths = Math.ceil(safeMilliseconds / 10);
  const hundredths = totalHundredths % 100;
  const totalSeconds = Math.floor(totalHundredths / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

function currentRemaining() {
  return running ? Math.max(0, remaining - (performance.now() - startedAt)) : remaining;
}

function updateDisplay() {
  const timeLeft = currentRemaining();
  display.textContent = formatTime(timeLeft);

  if (running && timeLeft > 0) {
    animationFrameId = requestAnimationFrame(updateDisplay);
  } else if (running) {
    running = false;
    remaining = 0;
    startPauseButton.textContent = "Start";
    status.textContent = "Time is up";
  }
}

function toggleTimer() {
  if (running) {
    remaining = currentRemaining();
    running = false;
    cancelAnimationFrame(animationFrameId);
    startPauseButton.textContent = "Resume";
    status.textContent = "Paused";
  } else {
    if (remaining === 0) {
      configuredDuration = durationFromInputs();
      remaining = configuredDuration;
    }

    if (remaining === 0) {
      status.textContent = "Choose a duration first";
      return;
    }

    startedAt = performance.now();
    running = true;
    startPauseButton.textContent = "Pause";
    status.textContent = "Running";
    updateDisplay();
  }
}

function resetTimer() {
  running = false;
  cancelAnimationFrame(animationFrameId);
  configuredDuration = durationFromInputs();
  remaining = configuredDuration;
  startPauseButton.textContent = "Start";
  status.textContent = "Ready";
  updateDisplay();
}

function updateDuration() {
  if (!running) {
    resetTimer();
  }
}

startPauseButton.addEventListener("click", toggleTimer);
resetButton.addEventListener("click", resetTimer);
minutesInput.addEventListener("input", updateDuration);
secondsInput.addEventListener("input", updateDuration);

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.target.matches("input")) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    toggleTimer();
  } else if (event.key.toLowerCase() === "r") {
    resetTimer();
  }
});

updateDisplay();