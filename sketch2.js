console.log('sketch2.js: Script loaded');

let sketch2 = function(p) {
  console.log('sketch2: Initializing p5.js instance');
  let cols = 20;
  let rows = 15;
  let spacing = 40;
  let time = 0;
  let triangles = [];
  let isInteractive = false;
  let lastMouseMove = 0;
  let canvas, container, containerWidth, containerHeight;

  p.setup = function() {
    console.log('sketch2: Running setup()');
    // Get the container element
    container = document.getElementById('sketch2-container');
    
    if (!container) {
      console.error('sketch2-container not found!');
      return;
    }
    
    // Set container size to match its display size
    containerWidth = container.offsetWidth || 400;
    containerHeight = container.offsetHeight || 400;
    
    console.log('sketch2: Container dimensions:', containerWidth, 'x', containerHeight);
    
    // Create canvas that fits the container (using 2D mode for better compatibility)
    canvas = p.createCanvas(containerWidth, containerHeight);
    canvas.parent('sketch2-container');
    
    // Set color mode and pixel density
    p.colorMode(p.HSB, 360, 100, 100);
    p.pixelDensity(1);
    
    // Disable context menu on right-click
    canvas.elt.oncontextmenu = () => false;
    
    // Initialize triangle positions
    for (let i = 0; i < cols; i++) {
      triangles[i] = [];
      for (let j = 0; j < rows; j++) {
        triangles[i][j] = {
          x: i * spacing + spacing,
          y: j * spacing + spacing,
          baseY: j * spacing + spacing,
          size: 35,
          rotation: 0
        };
      }
    }
  };

  function handleResize() {
    if (container) {
      containerWidth = container.offsetWidth || 400;
      containerHeight = container.offsetHeight || 400;
      p.resizeCanvas(containerWidth, containerHeight);
    
      // Recalculate spacing based on new container size
      spacing = Math.min(containerWidth / cols, containerHeight / rows) * 0.9;
      
      // Reinitialize triangle positions
      triangles = [];
      for (let i = 0; i < cols; i++) {
        triangles[i] = [];
        for (let j = 0; j < rows; j++) {
          triangles[i][j] = {
            x: i * spacing + spacing,
            y: j * spacing + spacing,
            baseY: j * spacing + spacing,
            size: spacing * 0.8,
            rotation: 0
          };
        }
      }
    }
  }
  
  p.windowResized = handleResize;

  p.draw = function() {
    p.background(40, 20, 90); // Light cream background
    
    // Update time slower for reduced motion
    time += 0.005;
    
    // Check if mouse has moved recently
    isInteractive = (p.millis() - lastMouseMove) < 2000; // Interactive for 2 seconds after mouse movement
    
    // Get mouse influence only when interactive
    let mouseInfluence = isInteractive ? p.map(p.mouseX, 0, p.width, 0.8, 1.2) : 1.0;
    let mouseWave = isInteractive ? p.map(p.mouseY, 0, p.height, 0.05, 0.15) : 0.1;
    
    // Draw shapes
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let t = triangles[i][j];
        
        // Calculate distance from mouse
        let distToMouse = p.dist(p.mouseX, p.mouseY, i * spacing + spacing, j * spacing + spacing);
        let isNearMouse = distToMouse < 100 && isInteractive;
        let mouseEffect = isNearMouse ? p.map(distToMouse, 0, 100, 1.4, 0.9) : 1.0;
        mouseEffect = p.constrain(mouseEffect, 0.9, 1.4);
        
        // Calculate wave displacement - only for shapes near mouse
        let waveX = isNearMouse ? p.sin(time * mouseInfluence + i * 0.3) * 15 * mouseEffect : 0;
        let waveY = isNearMouse ? p.sin(time * mouseInfluence + i * 0.3 + j * mouseWave) * 10 * mouseEffect : 0;
        
        // Update position
        t.x = i * spacing + spacing + waveX;
        t.y = t.baseY + waveY;
        
        // Update rotation - only for shapes near mouse
        t.rotation = isNearMouse ? time * mouseInfluence + i * 0.05 + j * 0.025 : 0;
        
        // Color: bright red for circles near mouse, cream for squares
        let brightness, saturation, hue;
        if (isNearMouse) {
          brightness = p.map(p.sin(time * mouseInfluence + i * 0.1 + j * 0.1), -1, 1, 60, 85);
          saturation = p.map(p.cos(time * mouseInfluence + i * 0.1 + j * 0.05), -1, 1, 70, 90);
          hue = 0; // Red
        } else {
          brightness = 85; // Cream
          saturation = 20; // Light cream color
          hue = 40; // Warm cream hue
        }
        
        // Draw shape
        p.push();
        p.translate(t.x, t.y);
        p.rotate(t.rotation);
        p.fill(hue, saturation, brightness);
        p.stroke(hue, saturation * 0.8, brightness + 10);
        p.strokeWeight(1);
        
        // Shape size - larger when near mouse
        let waveSize = isNearMouse ? p.map(p.sin(time * mouseInfluence + i * 0.2 + j * 0.15), -1, 1, 1.0, 1.3) : 1.0;
        let currentSize = t.size * waveSize * mouseEffect;
        
        // Draw fluid circle when near mouse, square otherwise
        if (isNearMouse) {
          // Create fluid circle with slight oval distortion
          let fluidX = currentSize + p.sin(time * 2 + i * 0.3 + j * 0.2) * 3;
          let fluidY = currentSize + p.cos(time * 1.5 + i * 0.2 + j * 0.3) * 2;
          p.ellipse(0, 0, fluidX, fluidY);
        } else {
          p.rectMode(p.CENTER);
          p.rect(0, 0, currentSize, currentSize);
        }
        
        p.pop();
      }
    }
    
    // Add subtle glow effect only for shapes near mouse
    if (isInteractive) {
      p.push();
      p.blendMode(p.ADD);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let t = triangles[i][j];
          let distToMouse = p.dist(p.mouseX, p.mouseY, t.x, t.y);
          if (distToMouse < 80) {
            let glowIntensity = p.map(distToMouse, 0, 80, 75, 15);
            let glowSize = p.map(p.sin(time + i * 0.2 + j * 0.15), -1, 1, 4, 15);
            p.fill(0, 40, glowIntensity, 20);
            p.noStroke();
            p.ellipse(t.x, t.y, glowSize);
          }
        }
      }
      p.pop();
    }
  };

  p.keyPressed = function() {
    if (p.key === ' ') {
      time = 0; // Reset animation
    }
  };

  p.mousePressed = function() {
    // Ripple effect from mouse position
    time += 0.5; // Create a ripple jump
  };

  p.mouseMoved = function() {
    // Track mouse movement for interactivity
    lastMouseMove = p.millis();
  };
}

// Create p5 instance when the DOM is ready
let sketch2Instance = null;

function initSketch2() {
  console.log('initSketch2 called, document ready state:', document.readyState);
  const container = document.getElementById('sketch2-container');
  console.log('sketch2-container found:', !!container);
  
  if (container && !sketch2Instance) {
    console.log('Creating sketch2 p5 instance');
    sketch2Instance = new p5(sketch2, 'sketch2-container');
  } else if (!container) {
    console.warn('sketch2-container not found, retrying in 200ms...');
    setTimeout(initSketch2, 200);
  }
}

// Multiple initialization attempts
console.log('sketch2.js: Setting up initialization');

// Immediate attempt
setTimeout(initSketch2, 150);

// DOM ready attempt
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded fired for sketch2');
  setTimeout(initSketch2, 50);
});

// Window load attempt (final fallback)
window.addEventListener('load', function() {
  console.log('Window load fired for sketch2');
  setTimeout(initSketch2, 50);
});