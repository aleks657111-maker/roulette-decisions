(function () {
  var hero = document.getElementById('hero');
  var photo = document.getElementById('photo');

  var targetX = 0, targetY = 0;
  var currentX = 0, currentY = 0;
  var maxShift = 46;

  function onPointerMove(e) {
    var rect = hero.getBoundingClientRect();
    var nx = (e.clientX - rect.left) / rect.width - 0.5;
    var ny = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = -nx * maxShift;
    targetY = -ny * maxShift * 0.6;
  }

  function onPointerLeave() {
    targetX = 0;
    targetY = 0;
  }

  function animate() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    photo.style.transform = 'scale(1.08) translate(' + currentX.toFixed(2) + 'px, ' + currentY.toFixed(2) + 'px)';
    requestAnimationFrame(animate);
  }

  hero.addEventListener('mousemove', onPointerMove);
  hero.addEventListener('mouseleave', onPointerLeave);
  animate();

  var pills = document.querySelectorAll('.pill');
  pills.forEach(function (pill) {
    pill.addEventListener('click', function (e) {
      e.preventDefault();
      pills.forEach(function (p) { p.classList.remove('is-active'); });
      pill.classList.add('is-active');
    });
  });
})();
