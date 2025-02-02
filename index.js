function drawPolyline(
  svgElement,
  points,
  strokeColor = "",
  strokeWidth = 7
) {
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

// Get the SVG element
const svgElement = document.getElementById("mazeSvg");

// Check if the SVG element exists
if (!svgElement) {
  console.error('SVG element with ID "mazeSvg" not found.');
} else {
  const polyline = drawPolyline(svgElement, polylinePoints);

  const pathLength = polyline.getTotalLength();
  polyline.style.strokeDasharray = pathLength;
  polyline.style.strokeDashoffset = pathLength;

  // Create an <image> element to replace the circle
  const character = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  character.setAttributeNS(null, "href", "Slike/truck-front.png"); // Default icon
  character.setAttribute("width", 24); // Adjust icon size
  character.setAttribute("height", 24); // Adjust icon size
  svgElement.appendChild(character);

  // Position the icon at the start of the polyline
  const startPoint = polyline.getPointAtLength(0);
  character.setAttribute("x", startPoint.x - 12); // Offset by half icon width
  character.setAttribute("y", startPoint.y - 12); // Offset by half icon height

  const animateButton = document.getElementById("animateButton");
  if (animateButton) {
    animateButton.addEventListener("click", () => {
      polyline.style.transition = "none"; // Disable transition for dynamic updates

      let startTime;
      function animateCharacter(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        const progress = Math.min(elapsed / 30000, 1); // Duration of 20s
        const currentLength = pathLength * progress;

        // Update the dash offset to create a disappearing trail
        polyline.style.strokeDashoffset = pathLength - currentLength;

        // Get the current position and direction on the polyline
        const point = polyline.getPointAtLength(currentLength);
        const nextPoint = polyline.getPointAtLength(currentLength + 1);

        character.setAttribute("x", point.x - 12); // Adjust icon position
        character.setAttribute("y", point.y - 12); // Adjust icon position

        // Determine direction and switch icon
        if (nextPoint) {
          const dx = nextPoint.x - point.x;
          const dy = nextPoint.y - point.y;

          if (Math.abs(dx) > Math.abs(dy)) {
            // Moving horizontally
            character.setAttributeNS(null, "href", "Slike/truck-side.png");
          } else {
            // Moving vertically
            character.setAttributeNS(null, "href", "Slike/truck-front.png");
          }
        }

        if (progress < 1) {
          requestAnimationFrame(animateCharacter);
        } else {
          // Show SweetAlert when animation completes
          Swal.fire({
            title: 'Čestitke',
            html: "<img src='Slike/firefighters.gif' style='width:350px;'>",
            icon: 'info',
            confirmButtonText: 'OK',
            didOpen: () => {
              document.body.classList.remove('swal2-height-auto');
            }
          });
        }
      }
      requestAnimationFrame(animateCharacter);
    });
  } else {
    console.error('Animate button with ID "animateButton" not found.');
  }

  const eraseButton = document.getElementById("eraseButton");
  if (eraseButton) {
    eraseButton.addEventListener("click", () => {
      polyline.style.transition = "none";
      polyline.style.strokeDashoffset = pathLength;

      character.setAttribute("x", startPoint.x - 12);
      character.setAttribute("y", startPoint.y - 12);
      character.setAttributeNS(null, "href", "Slike/truck-front.png"); // Reset to default icon
    });
  } else {
    console.error('Erase button with ID "eraseButton" not found.');
  }
}
const info = document.getElementById("info");
if (info) {
  info.addEventListener("click", () => {
    Swal.fire({
      title: 'Gasilci v Labirintu',
      text: "Gozd je zajel požar! Sirene tulijo, dim se dviga med krošnjami, a pot do ognja je zapletena – gozd je pravi labirint. Ekipa pogumnih gasilcev mora najti najhitrejšo pot skozi gosto rastje, podrta drevesa in skrivnostne poti, da pravočasno pride do požara. Spretno izbirajo smeri, premagujejo ovire in sledijo zvoku ognja. Vsaka sekunda šteje – ali jim bo uspelo rešiti gozd, preden bo prepozno?",
      icon: 'warning',
      confirmButtonText: 'OK',
      didOpen: () => {
        document.body.classList.remove('swal2-height-auto');
      }
    });
  });
}

const vizitka = document.getElementById("vizitka");
if (vizitka) {
  vizitka.addEventListener("click", () => {
    Swal.fire({
      title: 'Vizitka',
      html: `
        <p><strong>Razvijalec:</strong> Jan Tavčar Kukanja</p>
        <p><strong>Razred:</strong> 4.RB</p>
        <p><strong>Mentor:</strong> Alen Andrlič</p>
      `,
      icon: 'info',
      confirmButtonText: 'OK',
      didOpen: () => {
        document.body.classList.remove('swal2-height-auto');
      }
    });
  });
} else {
  console.error("Element z ID 'vizitka' ne obstaja.");
}