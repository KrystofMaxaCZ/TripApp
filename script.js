let players = [];
let tasks = [];
let scores = {};
let selectedPlayer = null;

// === LOCAL STORAGE ===
function saveState() {
  localStorage.setItem("players", JSON.stringify(players));
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("scores", JSON.stringify(scores));
}

function loadState() {
  players = JSON.parse(localStorage.getItem("players")) || [];
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  scores = JSON.parse(localStorage.getItem("scores")) || {};
  renderPlayers();
  renderTasks();
  renderScores();
}

// === PLAYERS ===
function addPlayer() {
  const input = document.getElementById("new-player-input");
  const name = input.value.trim();
  if (name && !players.includes(name)) {
    players.push(name);
    scores[name] = [];
    input.value = "";
    saveState();
    renderPlayers();
    renderScores();
  }
}

function deletePlayer(name) {
  players = players.filter(p => p !== name);
  delete scores[name];
  if (selectedPlayer === name) selectedPlayer = null;
  document.getElementById("selected-player").textContent = "Selected: -";
  saveState();
  renderPlayers();
  renderScores();
}

function pickRandomPlayer() {
  if (players.length === 0) return;
  selectedPlayer = players[Math.floor(Math.random() * players.length)];
  document.getElementById("selected-player").textContent = "Selected: " + selectedPlayer;
  renderPlayers();
}

function renderPlayers() {
  const list = document.getElementById("player-list");
  list.innerHTML = "";
  players.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    if (name === selectedPlayer) li.classList.add("selected");

    // delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "×";
    delBtn.className = "delete-btn";
    delBtn.title = "Delete player";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deletePlayer(name);
    };

    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// === TASKS ===
function addTask() {
  const input = document.getElementById("new-task-input");
  const task = input.value.trim();
  if (task) {
    tasks.push(task);
    input.value = "";
    saveState();
    renderTasks();
    drawWheel();
  }
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveState();
  renderTasks();
  drawWheel();
}

function renderTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";
  tasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.textContent = task;

    const delBtn = document.createElement("button");
    delBtn.textContent = "×";
    delBtn.className = "delete-btn";
    delBtn.title = "Delete task";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteTask(i);
    };

    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// === SCORES ===
function renderScores() {
  const list = document.getElementById("scores-list");
  list.innerHTML = "";
  players.forEach(name => {
    const completedTasks = scores[name] || [];
    const li = document.createElement("li");
    li.textContent = `${name}: ${completedTasks.length} completed tasks`;
    list.appendChild(li);
  });
}

// === WHEEL ===
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
let startAngle = 0;
let arc = 0;
let spinTimeout = null;
let spinArcStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;
let selectedTaskIndex = null;

function drawWheel() {
  if (tasks.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#999";
    ctx.textAlign = "center";
    ctx.fillText("No tasks available", canvas.width / 2, canvas.height / 2);
    return;
  }

  arc = (2 * Math.PI) / tasks.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < tasks.length; i++) {
    const angle = startAngle + i * arc;
    ctx.fillStyle = i % 2 === 0 ? "#3b82f6" : "#60a5fa"; // alternating blue shades

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2 - 10,
      angle,
      angle + arc,
      false
    );
    ctx.lineTo(canvas.width / 2, canvas.height / 2);
    ctx.fill();

    ctx.save();
    ctx.fillStyle = "white";
    ctx.translate(
      canvas.width / 2 + Math.cos(angle + arc / 2) * (canvas.width / 2 - 70),
      canvas.height / 2 + Math.sin(angle + arc / 2) * (canvas.height / 2 - 70)
    );
    ctx.rotate(angle + arc / 2 + Math.PI / 2);
    ctx.fillText(tasks[i], 0, 0);
    ctx.restore();
  }

  // Draw arrow
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 10, 10);
  ctx.lineTo(canvas.width / 2 + 10, 10);
  ctx.lineTo(canvas.width / 2, 30);
  ctx.closePath();
  ctx.fill();
}

function spinWheel() {
  if (tasks.length === 0) return;
  spinArcStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3000 + 4000;
  rotateWheel();
}

function rotateWheel() {
  spinTime += 30;
  if (spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  const spinAngle =
    spinArcStart - easeOut(spinTime, 0, spinArcStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI) / 180;
  drawWheel();
  spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  const degrees = (startAngle * 180) / Math.PI + 90;
  const arcd = (arc * 180) / Math.PI;
  const index = Math.floor(
    (360 - (degrees % 360)) / arcd
  );
  selectedTaskIndex = index % tasks.length;
  document.getElementById("selected-task").textContent =
    "Task: " + tasks[selectedTaskIndex];
}

function easeOut(t, b, c, d) {
  const ts = (t /= d) * t;
  const tc = ts * t;
  return b + c * (tc + -3 * ts + 3 * t);
}

// === MARK TASK COMPLETE ===
function markTaskComplete() {
  if (!selectedPlayer || selectedTaskIndex === null) return;
  const completed = scores[selectedPlayer] || [];
  const taskName = tasks[selectedTaskIndex];
  if (!completed.includes(taskName)) {
    completed.push(taskName);
    scores[selectedPlayer] = completed;
    saveState();
    renderScores();
  }
}

// === BURGER MENU TOGGLE ===
document.getElementById("toggle-tasks").addEventListener("click", () => {
  const taskSection = document.getElementById("task-section");
  if (taskSection.style.maxHeight && taskSection.style.maxHeight !== "0px") {
    taskSection.style.maxHeight = "0";
  } else {
    taskSection.style.maxHeight = "1000px";
  }
});

// === DARK MODE TOGGLE ===
document.getElementById("toggle-dark-mode").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  updateDarkModeButton();
});

function updateDarkModeButton() {
  const btn = document.getElementById("toggle-dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    btn.textContent = "☀️ Light Mode";
  } else {
    btn.textContent = "🌙 Dark Mode";
  }
}

// === INIT ===
loadState();
drawWheel();
updateDarkModeButton();
