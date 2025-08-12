console.log('sketch1.js: Script loaded');

let sketch1 = function(p) {
  console.log('sketch1: Initializing p5.js instance');
  let legoBlocks = [];
  let staticBackground;
  let canvas;
  let container, containerWidth, containerHeight;

  p.setup = function() {
    console.log('sketch1: Running setup()');
    // Get the container element
    container = document.getElementById('sketch1-container');
    
    if (!container) {
      console.error('sketch1-container not found!');
      return;
    }
    
    // Set container size to match its display size
    containerWidth = container.offsetWidth || 400;
    containerHeight = container.offsetHeight || 400;
    
    console.log('sketch1: Container dimensions:', containerWidth, 'x', containerHeight);
    
    // Create canvas that fits the container
    canvas = p.createCanvas(containerWidth, containerHeight);
    canvas.parent('sketch1-container');
    
    // Set pixel density for better rendering
    p.pixelDensity(1);
    
    // Disable context menu on right-click
    canvas.elt.oncontextmenu = () => false;
    
    // Create static background
    createStaticBackground();
    
    // Create Lego-like block arrangements
    createLegoStructures();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
  };
  
  function handleResize() {
    if (container) {
      containerWidth = container.offsetWidth || 400;
      containerHeight = container.offsetHeight || 400;
      p.resizeCanvas(containerWidth, containerHeight);
      createStaticBackground();
    }
  }
  
  p.windowResized = handleResize;

  function createStaticBackground() {
    staticBackground = p.createGraphics(p.width, p.height);
    
    // Pure white background
    staticBackground.background(255, 255, 255);
  }

  function createLegoStructures() {
    let blockWidth = 120;
    let blockHeight = 40;
    let spacing = 5;
    
    // Create algae-like clusters spread across the canvas
    let numClusters = 15;
    
    for (let cluster = 0; cluster < numClusters; cluster++) {
      // Random position for each cluster
      let centerX = p.random(100, p.width - 100);
      let centerY = p.random(100, p.height - 100);
      
      // Random cluster size (2-6 rectangles)
      let clusterSize = p.int(p.random(2, 7));
      
      // Random cluster color (green tones like algae)
      let baseColor = [
        p.random(50, 150),  // Low red for green tones
        p.random(150, 255), // High green
        p.random(50, 150)   // Low blue for green tones
      ];
      
      // Create rectangles in organic, scattered pattern
      for (let i = 0; i < clusterSize; i++) {
        // Organic offset from center
        let offsetX = p.random(-80, 80);
        let offsetY = p.random(-60, 60);
        
        // Slight color variation within cluster
        let colorVariation = 30;
        let blockColor = [
          p.constrain(baseColor[0] + p.random(-colorVariation, colorVariation), 0, 255),
          p.constrain(baseColor[1] + p.random(-colorVariation, colorVariation), 0, 255),
          p.constrain(baseColor[2] + p.random(-colorVariation, colorVariation), 0, 255)
        ];
        
        // Random rectangle size variation - much more variation
        let w = blockWidth + p.random(-60, 80);
        let h = blockHeight + p.random(-25, 35);
        
        legoBlocks.push({
          x: centerX + offsetX,
          y: centerY + offsetY,
          width: w,
          height: h,
          color: blockColor,
          opacity: p.random(0.5, 0.8),
          glowIntensity: p.random(0.8, 1.5),
          rotation: p.random(-0.3, 0.3) // Slight random rotation
        });
      }
    }
  }

  p.draw = function() {
    // Draw static background
    p.image(staticBackground, 0, 0);
    
    // Draw Lego block structures
    drawLegoBlocks();
  };

  function drawLegoBlocks() {
    for (let block of legoBlocks) {
      p.push();
      p.translate(block.x, block.y);
      
      // Apply rotation if it exists
      if (block.rotation) {
        p.rotate(block.rotation);
      }
      
      // Glass effect with multiple layers
      let glowWidth = block.width * block.glowIntensity;
      let glowHeight = block.height * block.glowIntensity;
      
      // Outer glow
      p.fill(block.color[0], block.color[1], block.color[2], 20);
      p.noStroke();
      p.rectMode(p.CENTER);
      p.rect(0, 0, glowWidth, glowHeight);
      
      // Main glass rectangle
      p.fill(block.color[0], block.color[1], block.color[2], block.opacity * 255);
      p.stroke(255, 255, 255, 100);
      p.strokeWeight(2);
      p.rect(0, 0, block.width, block.height);
      
      // Glass reflection highlight
      p.fill(255, 255, 255, 80);
      p.noStroke();
      let highlightWidth = block.width * 0.3;
      let highlightHeight = block.height * 0.4;
      p.rectMode(p.CORNER);
      p.rect(-block.width/2 + 8, -block.height/2 + 4, highlightWidth, highlightHeight);
      
      // Inner bright core
      p.fill(block.color[0], block.color[1], block.color[2], 100);
      let coreWidth = block.width * 0.6;
      let coreHeight = block.height * 0.6;
      p.rectMode(p.CENTER);
      p.rect(0, 0, coreWidth, coreHeight);
      
      // Bright edge effect
      p.stroke(block.color[0] + 50, block.color[1] + 50, block.color[2] + 50, 150);
      p.strokeWeight(3);
      p.noFill();
      p.rect(0, 0, block.width, block.height);
      
      // Add organic spots like algae cells - fixed position
      p.fill(255, 255, 255, 120);
      p.noStroke();
      let spotSize = p.min(block.width, block.height) * 0.15;
      // Fixed position instead of random
      p.ellipse(block.width * 0.1, block.height * 0.1, spotSize, spotSize);
      
      p.pop();
    }
  }

  

  // Add new block to existing structures
  p.mousePressed = function() {
    // Add new algae-like rectangle at mouse position
    legoBlocks.push({
      x: p.mouseX,
      y: p.mouseY,
      width: p.random(60, 180),
      height: p.random(20, 70),
      color: [p.random(50, 150), p.random(150, 255), p.random(50, 150)],
      opacity: p.random(0.5, 0.8),
      glowIntensity: p.random(0.8, 1.5),
      rotation: p.random(-0.3, 0.3)
    });
  };
}

// Create p5 instance when the DOM is ready
let sketch1Instance = null;

function initSketch1() {
  console.log('initSketch1 called, document ready state:', document.readyState);
  const container = document.getElementById('sketch1-container');
  console.log('Container found:', !!container);
  
  if (container && !sketch1Instance) {
    console.log('Creating sketch1 p5 instance');
    sketch1Instance = new p5(sketch1, 'sketch1-container');
  } else if (!container) {
    console.warn('sketch1-container not found, retrying in 200ms...');
    setTimeout(initSketch1, 200);
  }
}

// Multiple initialization attempts
console.log('sketch1.js: Setting up initialization');

// Immediate attempt
setTimeout(initSketch1, 100);

// DOM ready attempt
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded fired for sketch1');
  setTimeout(initSketch1, 50);
});

// Window load attempt (final fallback)
window.addEventListener('load', function() {
  console.log('Window load fired for sketch1');
  setTimeout(initSketch1, 50);
});