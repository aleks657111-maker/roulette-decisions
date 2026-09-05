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

  let items = ["Ева", "Альмира", "Михаил", "София", "Софи", "Сергей", "Виктория", "Любовь", "Никита", "Василиса"];
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

  function wheelGeometry() {
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const radius = Math.min(cx, cy) - 4;
    return { cx, cy, radius };
  }

  function drawSector(targetCtx, index, total, isHighlight) {
    const { cx, cy, radius } = wheelGeometry();
    const segAngle = (Math.PI * 2) / total;
    const start = index * segAngle;
    const end = start + segAngle;

    targetCtx.beginPath();
    targetCtx.moveTo(cx, cy);
    targetCtx.arc(cx, cy, radius, start, end);
    targetCtx.closePath();
    targetCtx.fillStyle = isHighlight ? highlightColorFor(index) : colorFor(index);
    targetCtx.fill();

    if (isHighlight) {
      targetCtx.save();
      targetCtx.lineWidth = 4;
      targetCtx.strokeStyle = "#ffffff";
      targetCtx.beginPath();
      targetCtx.arc(cx, cy, radius - 2, start, end);
      targetCtx.stroke();
      targetCtx.restore();
    }

    targetCtx.save();
    targetCtx.translate(cx, cy);
    targetCtx.rotate(start + segAngle / 2);
    targetCtx.textAlign = "right";
    targetCtx.textBaseline = "middle";
    targetCtx.font = "700 15px 'Segoe UI', sans-serif";
    targetCtx.fillStyle = "#ffffff";
    targetCtx.shadowColor = "rgba(0, 0, 0, 0.35)";
    targetCtx.shadowBlur = 3;
    targetCtx.fillText(truncate(items[index], 15), radius - 14, 0);
    targetCtx.restore();
  }

  function drawWheel() {
    const { cx, cy, radius } = wheelGeometry();
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
      drawSector(ctx, i, n, i === highlightIndex);
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
    const extraSpins = 10;
    const delta = extraSpins * 360 + ((targetMod - currentMod + 360) % 360);
    rotation += delta;

    canvas.style.transition = "transform 7.5s cubic-bezier(0.19, 0.86, 0.24, 1)";
    canvas.style.transform = `rotate(${rotation}deg)`;

    const onEnd = () => {
      canvas.removeEventListener("transitionend", onEnd);
      spinning = false;
      highlightIndex = winningIndex;
      drawWheel();
      updateSpinAvailability();
      showResult(items[winningIndex]);
      removeWinner(winningIndex);
    };
    canvas.addEventListener("transitionend", onEnd);
  }

  const FALL_DURATION_MS = 900;

  function spawnFallingSector(index) {
    const { cx, cy, radius } = wheelGeometry();
    const n = items.length;

    // Cut the sector out of the main wheel, leaving a clean hole behind.
    const segAngle = (Math.PI * 2) / n;
    const start = index * segAngle;
    const end = start + segAngle;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Render just that sector onto its own canvas so it can fall independently.
    const clone = document.createElement("canvas");
    clone.className = "falling-sector";
    clone.width = SIZE * dpr;
    clone.height = SIZE * dpr;
    clone.style.width = `${SIZE}px`;
    clone.style.height = `${SIZE}px`;
    const cctx = clone.getContext("2d");
    cctx.scale(dpr, dpr);
    drawSector(cctx, index, n, true);

    const baseTransform = canvas.style.transform || "rotate(0deg)";
    clone.style.transform = baseTransform;
    clone.style.transition = `transform ${FALL_DURATION_MS}ms cubic-bezier(0.5, 0, 0.85, 0.35), opacity ${FALL_DURATION_MS * 0.7}ms ease-in ${FALL_DURATION_MS * 0.3}ms`;
    canvas.insertAdjacentElement("afterend", clone);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clone.style.transform = `translateY(520px) rotate(30deg) ${baseTransform}`;
        clone.style.opacity = "0";
      });
    });

    clone.addEventListener("transitionend", () => clone.remove(), { once: true });
  }

  function removeWinner(index) {
    const li = itemsList.children[index];
    if (li) li.classList.add("item-row--removing");

    spawnFallingSector(index);

    setTimeout(() => {
      items.splice(index, 1);
      highlightIndex = -1;
      renderList();
      drawWheel();
    }, FALL_DURATION_MS);
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
