function drawPolyline(svgElement, points, strokeColor = "", strokeWidth = 7) {
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", strokeColor);
  polyline.setAttribute("stroke-width", strokeWidth);
  polyline.setAttribute("stroke-linecap", "square");
  polyline.setAttribute("stroke-linejoin", "round");
  polyline.setAttribute("points", points);
  polyline.setAttribute("class", "line");
  svgElement.appendChild(polyline);
  return polyline;
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.setAttribute("tabindex", "0");
  document.body.focus();

  const svg = document.getElementById("mazeSvg");
  if (!svg) {
    console.error('SVG element with ID "mazeSvg" not found.');
    return;
  }

  const startPoint = { x: 234, y: 5 };
  let playerX = startPoint.x;
  let playerY = startPoint.y;
  const step = 2; // hitrost
  const goalX = 250, goalY = 482;

  // Ustvari igralca - krogec
  let character = svg.querySelector("circle#playerIcon");
  if (!character) {
    character = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    character.setAttribute("id", "playerIcon");
    character.setAttribute("r", 6);
    character.setAttribute("fill", "blue");
    character.setAttribute("cx", playerX);
    character.setAttribute("cy", playerY);
    svg.appendChild(character);
  }

  // Nariši pot
  const polylinePoints = `234,2 234,10 250,10 250,26 266,26 266,10 298,10 298,42 282,42 282,58 266,58 266,42 250,42 250,74 218,74 218,42 202,42 202,26 170,26 170,10 10,10 10,42 26,42 26,26 106,26 106,42 122,42 122,26 138,26 138,58 58,58 58,122 42,122 42,106 26,106 26,90 10,90 10,138 26,138 26,186 42,186 42,202 58,202 58,170 42,170 42,138 90,138 90,170 74,170 74,202 90,202 90,234 106,234 106,250 122,250 122,218 106,218 106,202 154,202 154,266 138,266 138,298 154,298 154,314 122,314 122,298 90,298 90,282 74,282 74,298 58,298 58,314 106,314 106,330 90,330 90,346 58,346 58,362 26,362 26,410 42,410 42,426 10,426 10,458 26,458 26,474 90,474 90,458 58,458 58,442 106,442 106,426 90,426 90,410 74,410 74,426 58,426 58,394 138,394 138,378 122,378 122,362 154,362 154,378 218,378 218,394 202,394 202,410 186,410 186,442 250,442 250,458 234,458 234,474 250,474 250,482`;
  const polyline = drawPolyline(svg, polylinePoints);
  const pathLength = polyline.getTotalLength();
  polyline.style.strokeDasharray = pathLength;
  polyline.style.strokeDashoffset = pathLength;

  // Animirani tovornjak za animacijo poti
  const truckIcon = document.createElementNS("http://www.w3.org/2000/svg", "image");
  truckIcon.setAttributeNS(null, "href", "Slike/truck-front.png");
  truckIcon.setAttribute("width", 24);
  truckIcon.setAttribute("height", 24);
  truckIcon.setAttribute("visibility", "hidden");
  truckIcon.setAttribute("x", playerX - 12);
  truckIcon.setAttribute("y", playerY - 12);
  svg.appendChild(truckIcon);

  const animateButton = document.getElementById("animateButton");
  if (animateButton) {
    animateButton.addEventListener("click", () => {
      character.setAttribute("visibility", "hidden");
      truckIcon.setAttribute("visibility", "visible");

      let startTime;
      function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / 30000, 1);
        const currentLength = pathLength * progress;

        polyline.style.strokeDashoffset = pathLength - currentLength;

        const point = polyline.getPointAtLength(currentLength);
        const nextPoint = polyline.getPointAtLength(currentLength + 1);

        truckIcon.setAttribute("x", point.x - 12);
        truckIcon.setAttribute("y", point.y - 12);

        if (nextPoint) {
          const dx = nextPoint.x - point.x;
          const dy = nextPoint.y - point.y;
          truckIcon.setAttributeNS(
            null,
            "href",
            Math.abs(dx) > Math.abs(dy)
              ? "Slike/truck-side.png"
              : "Slike/truck-front.png"
          );
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          Swal.fire({
            title: "Čestitke",
            html: "<img src='Slike/firefighters.gif' style='width:350px;'>",
            icon: "info",
            confirmButtonText: "OK",
            didOpen: () => {
              document.body.classList.remove("swal2-height-auto");
            },
          });
        }
      }
      requestAnimationFrame(animate);
    });
  }

  const eraseButton = document.getElementById("eraseButton");
  if (eraseButton) {
    eraseButton.addEventListener("click", () => {
      polyline.style.strokeDashoffset = pathLength;
      truckIcon.setAttribute("visibility", "hidden");
      playerX = startPoint.x;
      playerY = startPoint.y;
      character.setAttribute("cx", playerX);
      character.setAttribute("cy", playerY);
      character.setAttribute("visibility", "visible");
    });
  }

  // Premikanje z WASD s smooth animacijo
  const keys = {};
  let animationFrameId;
  let lastTime = null;

  document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (!animationFrameId) {
      lastTime = null;
      animationFrameId = requestAnimationFrame(moveCharacter);
    }
  });

  document.addEventListener("keyup", (e) => {
    delete keys[e.key.toLowerCase()];
    if (Object.keys(keys).length === 0) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  });

  function moveCharacter(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = (timestamp - lastTime) / 16.67; // okvirno za 60 fps
    lastTime = timestamp;

    let newX = playerX;
    let newY = playerY;

    if (keys["w"]) newY -= step * delta;
    if (keys["s"]) newY += step * delta;
    if (keys["a"]) newX -= step * delta;
    if (keys["d"]) newX += step * delta;

    if (!isWallCollision(newX, newY)) {
      playerX = newX;
      playerY = newY;
      character.setAttribute("cx", playerX);
      character.setAttribute("cy", playerY);
    }

    if (isGoalReached(playerX, playerY)) {
      showWinAlert();
      return;
    }

    animationFrameId = requestAnimationFrame(moveCharacter);
  }

  function isWallCollision(x, y) {
    const playerRadius = parseFloat(character.getAttribute("r"));
    const walls = svg.querySelectorAll("path, rect, line");
    for (const wall of walls) {
      const box = wall.getBBox();
      if (
        x + playerRadius > box.x &&
        x - playerRadius < box.x + box.width &&
        y + playerRadius > box.y &&
        y - playerRadius < box.y + box.height
      ) {
        return true;
      }
    }
    return false;
  }

  function isGoalReached(x, y) {
    const threshold = 5;
    return Math.abs(x - goalX) < threshold && Math.abs(y - goalY) < threshold;
  }

  function showWinAlert() {
    Swal.fire({
      title: "Čestitke",
      html: "<img src='Slike/firefighters.gif' style='width:350px;'>",
      icon: "info",
      confirmButtonText: "OK",
      didOpen: () => {
        document.body.classList.remove("swal2-height-auto");
      },
    });
  }

  const info = document.getElementById("info");
  if (info) {
    info.addEventListener("click", () => {
      Swal.fire({
        title: "Gasilci v Labirintu",
        text: "Gozd je zajel požar! Sirene tulijo, dim se dviga med krošnjami...",
        icon: "warning",
        confirmButtonText: "OK",
        didOpen: () => {
          document.body.classList.remove("swal2-height-auto");
        },
      });
    });
  }

  const vizitka = document.getElementById("vizitka");
  if (vizitka) {
    vizitka.addEventListener("click", () => {
      Swal.fire({
        title: "Vizitka",
        html: `
          <p><strong>Razvijalec:</strong> Jan Tavčar Kukanja</p>
          <p><strong>Razred:</strong> 4.RB</p>
          <p><strong>Mentor:</strong> Alen Andrlič</p>
        `,
        icon: "info",
        confirmButtonText: "OK",
        didOpen: () => {
          document.body.classList.remove("swal2-height-auto");
        },
      });
    });
  }
});