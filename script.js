let players = JSON.parse(localStorage.getItem("players") || "[]");
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let scores = JSON.parse(localStorage.getItem("scores") || "{}");

let selectedPlayer = null;
let selectedTask = null;

// --- PLAYER ---
function addPlayer() {
  const input = document.getElementById("new-player-input");
  const name = input.value.trim();
  if (name && !players.includes(name)) {
    players.push(name);
    localStorage.setItem("players", JSON.stringify(players));
  }
  input.value = "";
}

function pickRandomPlayer() {
  if (players.length === 0) return;
  selectedPlayer = players[Math.floor(Math.random() * players.length)];
  document.getElementById("selected-player").innerText = `Selected: ${selectedPlayer}`;
}

// --- TASKS ---
function addTask() {
  const input = document.getElementById("new-task-input");
  const task = input.value.trim();
  if (task && !tasks.includes(task)) {
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
  }
  input.value = "";
}

function deleteTask(index) {
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = task + " ";
    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.onclick = () => deleteTask(index);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

// --- WHEEL ---
let angle = 0;
let spinning = false;

function spinWheel() {
  if (spinning || tasks.length === 0) return;
  spinning = true;

  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const center = canvas.width / 2;
  const arc = (2 * Math.PI) / tasks.length;

  const colors = ["#e67e22", "#3498db", "#1abc9c", "#9b59b6", "#f39c12", "#2ecc71"];

  let spinAngle = Math.random() * 360 + 720;
  let current = 0;
  const duration = 2000;

  const start = performance.now();
  function animateWheel(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);
    current = easeOut(progress) * spinAngle;
    angle = current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tasks.forEach((task, i) => {
      const startAngle = i * arc + angle * Math.PI / 180;
      const endAngle = startAngle + arc;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, center, startAngle, endAngle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + arc / 2);
      ctx.fillStyle = "#fff";
      ctx.fillText(task, 50, 0);
      ctx.restore();
    });

    if (progress < 1) {
      requestAnimationFrame(animateWheel);
    } else {
      const selectedIndex = tasks.length - Math.floor(((angle % 360) / 360) * tasks.length) - 1;
      selectedTask = tasks[selectedIndex];
      document.getElementById("selected-task").innerText = `Task: ${selectedTask}`;
      spinning = false;
    }
  }

  requestAnimationFrame(animateWheel);
}

function easeOut(t) {
  return (--t) * t * t + 1;
}

// --- SCORING ---
function markTaskComplete() {
  if (!selectedPlayer || !selectedTask) return;
  if (!scores[selectedPlayer]) scores[selectedPlayer] = [];
  scores[selectedPlayer].push(selectedTask);
  localStorage.setItem("scores", JSON.stringify(scores));
  renderScores();
}

function renderScores() {
  const list = document.getElementById("scores-list");
  list.innerHTML = "";
  for (const [player, tasks] of Object.entries(scores)) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${player}</strong> (${tasks.length}):<br> - ${tasks.join("<br> - ")}`;
    list.appendChild(li);
  }
}

// --- INIT ---
renderTasks();
renderScores();
