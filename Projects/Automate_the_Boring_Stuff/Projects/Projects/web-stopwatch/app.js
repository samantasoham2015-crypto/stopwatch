"use strict";

const display = document.querySelector("#display");
const startStopButton = document.querySelector("#start-stop");
const lapButton = document.querySelector("#lap");
const resetButton = document.querySelector("#reset");
const saveButton = document.querySelector("#save");
const lapList = document.querySelector("#laps");
const emptyLaps = document.querySelector("#empty-laps");

let elapsed = 0;
let startedAt = 0;
let running = false;
let animationFrameId = 0;
let laps = [];

function currentElapsed() {
  return running ? elapsed + performance.now() - startedAt : elapsed;
}

function formatTime(milliseconds) {
  const totalHundredths = Math.floor(milliseconds / 10);
  const hundredths = totalHundredths % 100;
  const totalSeconds = Math.floor(totalHundredths / 100);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

function updateDisplay() {
  display.textContent = formatTime(currentElapsed());

  if (running) {
    animationFrameId = requestAnimationFrame(updateDisplay);
  }
}

function updateControls() {
  startStopButton.textContent = running ? "Stop" : "Start";
  lapButton.disabled = !running;
  resetButton.disabled = elapsed === 0 && !running && laps.length === 0;
  saveButton.disabled = laps.length === 0;
  emptyLaps.hidden = laps.length > 0;
}

function startStopwatch() {
  if (running) {
    elapsed = currentElapsed();
    running = false;
    cancelAnimationFrame(animationFrameId);
  } else {
    startedAt = performance.now();
    running = true;
    updateDisplay();
  }

  updateDisplay();
  updateControls();
}

function renderLaps() {
  lapList.replaceChildren();
  let previousLap = 0;

  laps.forEach((lapTime, index) => {
    const item = document.createElement("li");
    const number = document.createElement("span");
    const total = document.createElement("span");
    const split = document.createElement("span");

    number.textContent = `Lap ${String(index + 1).padStart(2, "0")}`;
    total.textContent = formatTime(lapTime);
    split.textContent = `+${formatTime(lapTime - previousLap)}`;
    item.append(number, total, split);
    lapList.append(item);
    previousLap = lapTime;
  });
}

function addLap() {
  if (!running) {
    return;
  }

  laps.push(currentElapsed());
  renderLaps();
  updateControls();
}

function resetStopwatch() {
  elapsed = 0;
  startedAt = 0;
  running = false;
  laps = [];
  cancelAnimationFrame(animationFrameId);
  renderLaps();
  updateDisplay();
  updateControls();
}

function saveLaps() {
  const rows = [["Lap", "Total time", "Split time"]];
  let previousLap = 0;

  laps.forEach((lapTime, index) => {
    rows.push([index + 1, formatTime(lapTime), formatTime(lapTime - previousLap)]);
    previousLap = lapTime;
  });

  const csv = rows.map((row) => row.join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "stopwatch-laps.csv";
  link.click();
  URL.revokeObjectURL(url);
}

startStopButton.addEventListener("click", startStopwatch);
lapButton.addEventListener("click", addLap);
resetButton.addEventListener("click", resetStopwatch);
saveButton.addEventListener("click", saveLaps);

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.target.matches("button")) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    startStopwatch();
  } else if (event.key.toLowerCase() === "l") {
    addLap();
  } else if (event.key.toLowerCase() === "r") {
    resetStopwatch();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}

updateControls();