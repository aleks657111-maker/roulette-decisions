(() => {
  const SIZE = 330;
  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  canvas.style.width = `${SIZE}px`;
  canvas.style.height = `${SIZE}px`;
  ctx.scale(dpr, dpr);
  const spinBtn = document.getElementById("spinBtn");
  const hint = document.getElementById("hint");
  const itemsList = document.getElementById("itemsList");
  const resultOverlay = document.getElementById("resultOverlay");
  const resultText = document.getElementById("resultText");
  const spinAgainBtn = document.getElementById("spinAgainBtn");
  const closeResultBtn = document.getElementById("closeResultBtn");

  let items = ["Штанга", "Гантели", "Турник", "Скамья", "Гиря", "Эспандер"];
  let rotation = 0;
  let spinning = false;
  let highlightIndex = -1;

  function hueFor(index, total) {
    return (index * (360 / Math.max(total, 1))) % 360;
  }

  function colorFor(index) {
    return `hsl(${hueFor(index, items.length)}, 82%, 56%)`;
  }

  function highlightColorFor(index) {
    return `hsl(${hueFor(index, items.length)}, 90%, 78%)`;
  }

  function drawWheel() {
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const radius = Math.min(cx, cy) - 4;
    const n = items.length;

    ctx.clearRect(0, 0, SIZE, SIZE);

    if (n === 0) {
      ctx.fillStyle = "#eceef5";
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const segAngle = (Math.PI * 2) / n;

    for (let i = 0; i < n; i++) {
      const start = i * segAngle;
      const end = start + segAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = i === highlightIndex ? highlightColorFor(i) : colorFor(i);
      ctx.fill();

      if (i === highlightIndex) {
        ctx.save();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 2, start, end);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + segAngle / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.font = "700 15px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 3;
      ctx.fillText(truncate(items[i], 15), radius - 14, 0);
      ctx.restore();
    }

    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    for (let i = 0; i < n; i++) {
      const angle = i * segAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      ctx.stroke();
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  }

  function truncate(str, max) {
    return str.length > max ? str.slice(0, max - 1) + "…" : str;
  }

  function renderList() {
    itemsList.innerHTML = "";

    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "item-row";

      const dot = document.createElement("span");
      dot.className = "item-color";
      dot.style.background = colorFor(index);
      li.appendChild(dot);

      const label = document.createElement("span");
      label.className = "item-label";
      label.textContent = item;
      li.appendChild(label);

      itemsList.appendChild(li);
    });

    updateSpinAvailability();
  }

  function updateSpinAvailability() {
    const canSpin = items.length >= 2 && !spinning;
    spinBtn.disabled = !canSpin;
    hint.hidden = items.length >= 2;
  }

  function spin() {
    if (spinning || items.length < 2) return;
    spinning = true;
    highlightIndex = -1;
    drawWheel();
    updateSpinAvailability();

    const n = items.length;
    const segAngleDeg = 360 / n;
    const winningIndex = Math.floor(Math.random() * n);
    const sectorCenterDeg = winningIndex * segAngleDeg + segAngleDeg / 2;

    const pointerAngleDeg = 270;
    const targetMod = ((pointerAngleDeg - sectorCenterDeg) % 360 + 360) % 360;

    const currentMod = ((rotation % 360) + 360) % 360;
    const extraSpins = 6;
    const delta = extraSpins * 360 + ((targetMod - currentMod + 360) % 360);
    rotation += delta;

    canvas.style.transition = "transform 6s cubic-bezier(0.22, 0.68, 0.1, 1)";
    canvas.style.transform = `rotate(${rotation}deg)`;

    const onEnd = () => {
      canvas.removeEventListener("transitionend", onEnd);
      spinning = false;
      highlightIndex = winningIndex;
      drawWheel();
      updateSpinAvailability();
      showResult(items[winningIndex]);
    };
    canvas.addEventListener("transitionend", onEnd);
  }

  function showResult(name) {
    resultText.textContent = name;
    resultOverlay.hidden = false;
    launchConfetti();
  }

  function launchConfetti(count = 320) {
    const layer = document.createElement("div");
    layer.className = "confetti-layer";
    document.body.appendChild(layer);

    for (let i = 0; i < count; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";

      const left = Math.random() * 100;
      const startDelayOffset = -(Math.random() * 1.5);
      const fallDistance = window.innerHeight + 60 + Math.random() * 200;
      const drift = (Math.random() - 0.5) * 400;
      const spin = (Math.random() - 0.5) * 900;
      const duration = 3 + Math.random() * 2.5;
      const delay = Math.random() * 1.2 + startDelayOffset;
      const size = 6 + Math.random() * 8;
      const color = `hsl(${Math.floor(Math.random() * 360)}, 85%, 60%)`;
      const isCircle = Math.random() > 0.5;

      piece.style.left = `${left}vw`;
      piece.style.top = `${-20 - Math.random() * 30}vh`;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * 1.6}px`;
      piece.style.background = color;
      piece.style.setProperty("--fall-distance", `${fallDistance}px`);
      piece.style.setProperty("--drift", `${drift}px`);
      piece.style.setProperty("--spin", `${spin}deg`);
      piece.style.animationDuration = `${duration}s`;
      piece.style.animationDelay = `${delay}s`;
      if (isCircle) piece.style.borderRadius = "50%";

      layer.appendChild(piece);
    }

    setTimeout(() => layer.remove(), 6800);
  }

  function hideResult() {
    resultOverlay.hidden = true;
  }

  spinBtn.addEventListener("click", spin);
  closeResultBtn.addEventListener("click", hideResult);
  spinAgainBtn.addEventListener("click", () => {
    hideResult();
    spin();
  });

  renderList();
  drawWheel();
})();
