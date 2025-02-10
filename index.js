function drawPolyline(svgElement, points, strokeColor = "", strokeWidth = 7) {
  const polyline = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polyline"
  );
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", strokeColor);
  polyline.setAttribute("stroke-width", strokeWidth);
  polyline.setAttribute("stroke-linecap", "square");
  polyline.setAttribute("stroke-linejoin", "round");
  polyline.setAttribute("points", points);
  polyline.setAttribute("class", "line"); // Add class for animation
  svgElement.appendChild(polyline);
  return polyline;
}

// Initial setup for SVG elements
const svgElement = document.getElementById("mazeSvg");

if (!svgElement) {
  console.error('SVG element with ID "mazeSvg" not found.');
} else {
  // Create the red dot (circle) character
  let character = svgElement.querySelector("circle");
  if (!character) {
    character = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    character.setAttribute("r", 6); // Set the radius of the dot
    character.setAttribute("fill", "blue"); // Color of the dot
    character.setAttribute("cx", 234); // Starting X position
    character.setAttribute("cy", 5); // Starting Y position
    svgElement.appendChild(character);
  }

  // Create the truck icon (hidden initially)
  const truckIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  truckIcon.setAttributeNS(null, "href", "Slike/truck-front.png"); // Default icon
  truckIcon.setAttribute("width", 24); // Icon width
  truckIcon.setAttribute("height", 24); // Icon height
  truckIcon.setAttribute("visibility", "hidden"); // Initially hidden
  svgElement.appendChild(truckIcon);

  // Position the truck icon at the start of the polyline (same position as the red dot)
  const startPoint = { x: 234, y: 5 };
  truckIcon.setAttribute("x", startPoint.x - 12); // Offset by half icon width
  truckIcon.setAttribute("y", startPoint.y - 12); // Offset by half icon height

  // Define the polyline points
  const polylinePoints = `
    234,2 234,10 250,10 250,26 266,26 266,10 298,10 298,42 282,42 282,58 
    266,58 266,42 250,42 250,74 218,74 218,42 202,42 202,26 170,26 170,10 
    10,10 10,42 26,42 26,26 106,26 106,42 122,42 122,26 138,26 138,58 
    58,58 58,122 42,122 42,106 26,106 26,90 10,90 10,138 26,138 26,186 
    42,186 42,202 58,202 58,170 42,170 42,138 90,138 90,170 74,170 74,202 
    90,202 90,234 106,234 106,250 122,250 122,218 106,218 106,202 154,202 
    154,266 138,266 138,298 154,298 154,314 122,314 122,298 90,298 90,282 
    74,282 74,298 58,298 58,314 106,314 106,330 90,330 90,346 58,346 58,362 
    26,362 26,410 42,410 42,426 10,426 10,458 26,458 26,474 90,474 90,458 
    58,458 58,442 106,442 106,426 90,426 90,410 74,410 74,426 58,426 58,394 
    138,394 138,378 122,378 122,362 154,362 154,378 218,378 218,394 202,394 
    202,410 186,410 186,442 250,442 250,458 234,458 234,474 250,474 250,482
  `;

  // Draw polyline
  const polyline = drawPolyline(svgElement, polylinePoints);

  const pathLength = polyline.getTotalLength();
  polyline.style.strokeDasharray = pathLength;
  polyline.style.strokeDashoffset = pathLength;

  const animateButton = document.getElementById("animateButton");
  if (animateButton) {
    animateButton.addEventListener("click", () => {
      // Hide the red dot and show the truck icon when animation starts
      character.setAttribute("visibility", "hidden");
      truckIcon.setAttribute("visibility", "visible");

      polyline.style.transition = "none"; // Disable transition for dynamic updates

      let startTime;
      function animateCharacter(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        const progress = Math.min(elapsed / 30000, 1); // Duration of 30s
        const currentLength = pathLength * progress;

        // Update the dash offset to create a disappearing trail
        polyline.style.strokeDashoffset = pathLength - currentLength;

        // Get the current position and direction on the polyline
        const point = polyline.getPointAtLength(currentLength);
        const nextPoint = polyline.getPointAtLength(currentLength + 1);

        truckIcon.setAttribute("x", point.x - 12); // Adjust icon position
        truckIcon.setAttribute("y", point.y - 12); // Adjust icon position

        // Determine direction and switch icon
        if (nextPoint) {
          const dx = nextPoint.x - point.x;
          const dy = nextPoint.y - point.y;

          if (Math.abs(dx) > Math.abs(dy)) {
            // Moving horizontally
            truckIcon.setAttributeNS(null, "href", "Slike/truck-side.png");
          } else {
            // Moving vertically
            truckIcon.setAttributeNS(null, "href", "Slike/truck-front.png");
          }
        }

        if (progress < 1) {
          requestAnimationFrame(animateCharacter);
        } else {
          // Show SweetAlert when animation completes
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
      requestAnimationFrame(animateCharacter);
    });
  } else {
    console.error('Animate button with ID "animateButton" not found.');
  }

  const eraseButton = document.getElementById("eraseButton");
  eraseButton.addEventListener("click", () => {
    polyline.style.transition = "none";
    polyline.style.strokeDashoffset = pathLength;

    // Resetiraj pozicijo tovornjaka
    truckIcon.setAttribute("x", startPoint.x - 12);
    truckIcon.setAttribute("y", startPoint.y - 12);
    truckIcon.setAttribute("visibility", "hidden");

    // Resetiraj pozicijo rdeče pike
    character.setAttribute("cx", startPoint.x);
    character.setAttribute("cy", startPoint.y);
    character.setAttribute("visibility", "visible");

    // Resetiraj koordinate igralca
    playerX = startPoint.x;
    playerY = startPoint.y;
  });
}
const info = document.getElementById("info");
if (info) {
  info.addEventListener("click", () => {
    Swal.fire({
      title: "Gasilci v Labirintu",
      text: "Gozd je zajel požar! Sirene tulijo, dim se dviga med krošnjami, a pot do ognja je zapletena – gozd je pravi labirint. Ekipa pogumnih gasilcev mora najti najhitrejšo pot skozi gosto rastje, podrta drevesa in skrivnostne poti, da pravočasno pride do požara. Spretno izbirajo smeri, premagujejo ovire in sledijo zvoku ognja. Vsaka sekunda šteje – ali jim bo uspelo rešiti gozd, preden bo prepozno?",
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
} else {
  console.error("Element z ID 'vizitka' ne obstaja.");
}
document.addEventListener("DOMContentLoaded", function () {
  const svg = document.getElementById("mazeSvg");
  if (!svg) {
    console.error('SVG element with ID "mazeSvg" not found.');
    return;
  }

  const step = 2; // Smoother movement with a smaller step
  const goalX = 250, goalY = 482; // Ciljna koordinata (zadnja točka poti)

  let character = svg.querySelector("circle");
  if (!character) {
    character = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    character.setAttribute("r", 6);
    character.setAttribute("fill", "blue");
    character.setAttribute("cx", 234);
    character.setAttribute("cy", 5);
    svg.appendChild(character);
  }

  let playerX = 234;
  let playerY = 5;
  character.setAttribute("cx", playerX);
  character.setAttribute("cy", playerY);

  let keys = {};
  let animationFrameId;

  document.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
    if (!animationFrameId) moveCharacter();
  });

  document.addEventListener("keyup", (event) => {
    delete keys[event.key.toLowerCase()];
    if (Object.keys(keys).length === 0) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  });

  function moveCharacter() {
    let newX = playerX;
    let newY = playerY;

    if (keys["w"]) newY -= step;
    if (keys["s"]) newY += step;
    if (keys["a"]) newX -= step;
    if (keys["d"]) newX += step;

    if (!isWallCollision(newX, newY)) {
      playerX = newX;
      playerY = newY;
      character.setAttribute("cx", playerX);
      character.setAttribute("cy", playerY);
    }

    if (isGoalReached(playerX, playerY)) {
      showWinAlert(); // Prikaže obvestilo, ko igralec pride do cilja
      return;
    }

    animationFrameId = requestAnimationFrame(moveCharacter);
  }

  function isWallCollision(x, y) {
    const playerRadius = parseFloat(character.getAttribute("r"));
    const walls = svg.querySelectorAll("path, rect, line");

    for (const wall of walls) {
      const bbox = wall.getBBox();
      if (
        x + playerRadius > bbox.x &&
        x - playerRadius < bbox.x + bbox.width &&
        y + playerRadius > bbox.y &&
        y - playerRadius < bbox.y + bbox.height
      ) {
        return true;
      }
    }
    return false;
  }

  function isGoalReached(x, y) {
    const threshold = 5; // Dovoljena napaka v dosegu cilja
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
});
