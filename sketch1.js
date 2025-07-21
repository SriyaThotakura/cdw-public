function sketch1(p) {
  let legoBlocks = [];
  let staticBackground;

  p.setup = function() {
    let canvas = p.createCanvas(800, 600);
  canvas.parent('sketch1-container');
    
    // Create static background
    createStaticBackground();
    
    // Create Lego-like block arrangements
    createLegoStructures();
  };

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
      p.rect(-glowWidth/2, -glowHeight/2, glowWidth, glowHeight);
      
      // Main glass rectangle
      p.fill(block.color[0], block.color[1], block.color[2], block.opacity * 255);
      p.stroke(255, 255, 255, 100);
      p.strokeWeight(2);
      p.rect(-block.width/2, -block.height/2, block.width, block.height);
      
      // Glass reflection highlight
      p.fill(255, 255, 255, 80);
      p.noStroke();
      let highlightWidth = block.width * 0.3;
      let highlightHeight = block.height * 0.4;
      p.rect(-block.width/2 + 8, -block.height/2 + 4, highlightWidth, highlightHeight);
      
      // Inner bright core
      p.fill(block.color[0], block.color[1], block.color[2], 100);
      let coreWidth = block.width * 0.6;
      let coreHeight = block.height * 0.6;
      p.rect(-coreWidth/2, -coreHeight/2, coreWidth, coreHeight);
      
      // Bright edge effect
      p.stroke(block.color[0] + 50, block.color[1] + 50, block.color[2] + 50, 150);
      p.strokeWeight(3);
      p.noFill();
      p.rect(-block.width/2, -block.height/2, block.width, block.height);
      
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

// Run first p5 instance
new p5(sketch1);