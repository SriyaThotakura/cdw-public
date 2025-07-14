// art-history-tangled-tree.js
// This script creates a tangled tree visualization from a CSV file with columns:
// name, start, end, category

(function() {
  // Set up the SVG container
  const margin = { top: 40, right: 40, bottom: 60, left: 150 };
  const width = 900 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3.select('#d3-container-3')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Color scale for artistic movement categories
  const colorScale = d3.scaleOrdinal()
    .domain(['Early Period', 'Classical', 'Modern', 'Avant-garde', 'Experimental', 'Contemporary'])
    .range(['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#DAA520']);

  // Load CSV data
  d3.csv('events.csv').then(function(data) {
    // Parse years
    data.forEach(function(d) {
      d.start = +d.start;
      d.end = +d.end;
    });

    // Sort by start year
    data.sort((a, b) => a.start - b.start);

    // Build a flat hierarchy (for tangled tree, each event is a node)
    // Optionally, you could infer parent/child based on overlapping years or category
    // Here, we just show a tangled tree by connecting overlapping periods

    // Create nodes
    const nodes = data.map((d, i) => ({
      id: i,
      name: d.name,
      start: d.start,
      end: d.end,
      category: d.category,
      x: 0, // to be set
      y: 0  // to be set
    }));

    // Layout: x by start year, y by index/category
    const xScale = d3.scaleLinear()
      .domain([d3.min(nodes, d => d.start), d3.max(nodes, d => d.end)])
      .range([0, width]);
    const yScale = d3.scalePoint()
      .domain(nodes.map(d => d.name))
      .range([0, height])
      .padding(0.5);

    nodes.forEach((d, i) => {
      d.x = xScale(d.start);
      d.y = yScale(d.name);
    });

    // Create links for overlapping periods (tangled tree)
    // Link from each node to all nodes whose period overlaps and start after this node
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[j].start <= nodes[i].end && nodes[j].start > nodes[i].start) {
          links.push({ source: nodes[i], target: nodes[j] });
        }
      }
    }

    // --- Tube map style ---
    // --- Poppy-flower style ---
    // Set SVG background to cream
    d3.select('#d3-container-3 svg')
      .style('background', '#fdf6e3');

    // Node color palette (reds, pinks, oranges)
    const poppyColors = [
      '#e63946','#f28482','#ff595e','#ffca3a','#f48c06','#ffb4a2',
      '#d90429','#f94144','#f3722c','#f9844a','#f9c74f','#f8961e',
      '#f72585','#b5179e','#720026','#ce4257','#ffb997','#f67e7d'
    ];
    // Assign color by index for variety

    // Node size by duration (or fixed for now)
    nodes.forEach((d,i) => {
      d.radius = Math.max(7, Math.sqrt(d.end-d.start)*2.5);
      d.poppyColor = poppyColors[i % poppyColors.length];
    });

    // Layout nodes: spread out horizontally by start year, vertically by index
    const ySpread = height * 0.98;
    nodes.forEach((d, i) => {
      d.x = xScale(d.start) + 10 + Math.random()*15;
      d.y = (i/(nodes.length-1)) * ySpread + 18 + Math.random()*10;
    });

    // Draw flowing links (thin, smooth, upward curves)
    svg.selectAll('.poppy-link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'poppy-link')
      .attr('d', d => {
        // Upward cubic curve from source to target
        const x1 = d.source.x, y1 = d.source.y;
        const x2 = d.target.x, y2 = d.target.y;
        const mx = (x1 + x2) / 2;
        return `M${x1},${y1} C${mx},${y1-40} ${mx},${y2-40} ${x2},${y2}`;
      })
      .attr('stroke', '#e63946')
      .attr('stroke-width', 1.2)
      .attr('fill', 'none')
      .attr('opacity', 0.32);

    // Image mapping for each movement (use placeholder for now)
    const imageMap = {
      'Neoclassicism': '/cdw-public/images/Neoclassicism.jpeg',
      'Romanticism': '/cdw-public/images/Romanticism.jpeg',
      'Realism': '/cdw-public/images/Realism.jpeg',
      'Impressionism': '/cdw-public/images/Impressionism.jpeg',
      'Post-Impressionism': '/cdw-public/images/Post-Impressionism.jpg',
      'Art Nouveau': '/cdw-public/images/Art Nouveau.jpg',
      'Fauvism': '/cdw-public/images/Fauvism.jpg',
      'Cubism': '/cdw-public/images/Cubism.jpg',
      'Expressionism': '/cdw-public/images/Expressionism.jpg',
      'Dada': '/cdw-public/images/Dada.jpg',
      'Surrealism': '/cdw-public/images/Surrealism.jpg',
      'Abstract Expressionism': '/cdw-public/images/Abstract Expressionism.jpg',
      'Pop Art': '/cdw-public/images/Pop Art.jpeg',
      'Minimalism': '/cdw-public/images/Minimalism.jpeg',
      'Conceptual Art': '/cdw-public/images/Conceptual Art.jpg',
      'Postmodernism': '/cdw-public/images/Postmodernism.jpg',
      'Contemporary Art': '/cdw-public/images/Contemporary Art.jpg',
    };

    // Draw poppy nodes (main circle)
    svg.selectAll('.poppy-node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'poppy-node')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.radius)
      .attr('fill', d => d.poppyColor)
      .attr('opacity', 0.82)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        // Remove any existing modal
        d3.select('#image-modal').remove();
        // Create modal overlay
        const modal = d3.select('body').append('div')
          .attr('id', 'image-modal')
          .style('position', 'fixed')
          .style('top', 0)
          .style('left', 0)
          .style('width', '100vw')
          .style('height', '100vh')
          .style('background', 'rgba(0,0,0,0.72)')
          .style('display', 'flex')
          .style('align-items', 'center')
          .style('justify-content', 'center')
          .style('z-index', 9999)
          .on('click', function() { d3.select('#image-modal').remove(); });
        // Add large image
        modal.append('img')
          .attr('src', imageMap[d.name] || '../../images/placeholder.png')
          .attr('alt', d.name)
          .style('max-width', '80vw')
          .style('max-height', '80vh')
          .style('border-radius', '16px')
          .style('box-shadow', `0 8px 40px ${d.poppyColor}bb`)
          .style('background', '#fff')
          .style('display', 'block')
          .on('click', function(event) { event.stopPropagation(); });
        // Close modal on Escape key
        d3.select('body').on('keydown.modal', function(event) {
          if (event.key === 'Escape') d3.select('#image-modal').remove();
        });
      });
    // Draw interactive images on top of circles
    // Tooltip div for image hover
    let imgTooltip = d3.select('body').select('.img-tooltip');
    if (imgTooltip.empty()) {
      imgTooltip = d3.select('body').append('div')
        .attr('class', 'img-tooltip')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('padding', '8px 14px')
        .style('background', 'rgba(255,255,255,0.97)')
        .style('border-radius', '8px')
        .style('font-family', 'DM Sans, Arial, sans-serif')
        .style('font-size', '13px')
        .style('font-weight', 700)
        .style('color', '#222')
        .style('box-shadow', '0 3px 16px #2222')
        .style('opacity', 0)
        .style('z-index', 10001);
    }

    // Animate entrance
    svg.selectAll('.poppy-img')
      .data(nodes)
      .enter()
      .append('image')
      .attr('class', 'poppy-img')
      .attr('x', d => d.x - d.radius * 0.7)
      .attr('y', d => d.y - d.radius - (d.radius * 0.7 * 2) - 8 + 32) // Start 32px lower
      .attr('width', d => d.radius * 0.7 * 2)
      .attr('height', d => d.radius * 0.7 * 2)
      .attr('href', d => imageMap[d.name] || '../../images/placeholder.png')
      .style('cursor', 'pointer')
      .style('opacity', 0)
      .transition()
      .delay((d, i) => i * 70)
      .duration(600)
      .attr('y', d => d.y - d.radius - (d.radius * 0.7 * 2) - 8)
      .style('opacity', 1);

    // Re-select for interactivity (needed after transition)
    svg.selectAll('.poppy-img')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .raise()
          .transition().duration(180)
          .attr('width', function() { return +d3.select(this).attr('width') * 1.23; })
          .attr('height', function() { return +d3.select(this).attr('height') * 1.23; })
          .attr('x', function() { return +d3.select(this).attr('x') - (+d3.select(this).attr('width') * 0.115); })
          .attr('y', function() { return +d3.select(this).attr('y') - (+d3.select(this).attr('height') * 0.115); })
          .style('filter', `drop-shadow(0 0 0 0 ${d.poppyColor}), drop-shadow(0 6px 24px ${d.poppyColor}CC), drop-shadow(0 2px 10px #2225)`)
          .attr('transform', 'rotate(-10)');
        imgTooltip
          .text(d.name)
          .style('left', (event.pageX + 14) + 'px')
          .style('top', (event.pageY - 22) + 'px')
          .transition().duration(120)
          .style('opacity', 1);
      })
      .on('mousemove', function(event, d) {
        imgTooltip
          .style('left', (event.pageX + 14) + 'px')
          .style('top', (event.pageY - 22) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition().duration(180)
          .attr('width', function() { return +d3.select(this).attr('width') / 1.23; })
          .attr('height', function() { return +d3.select(this).attr('height') / 1.23; })
          .attr('x', function() { return +d3.select(this).attr('x') + (+d3.select(this).attr('width') * 0.115 / 1.23); })
          .attr('y', function() { return +d3.select(this).attr('y') + (+d3.select(this).attr('height') * 0.115 / 1.23); })
          .style('filter', 'none')
          .attr('transform', null);
        imgTooltip.transition().duration(120).style('opacity', 0);
      })
      .on('click', function(event, d) {
        // Remove any existing modal
        d3.select('#image-modal').remove();
        // Create modal overlay
        const modal = d3.select('body').append('div')
          .attr('id', 'image-modal')
          .style('position', 'fixed')
          .style('top', 0)
          .style('left', 0)
          .style('width', '100vw')
          .style('height', '100vh')
          .style('background', 'rgba(0,0,0,0.72)')
          .style('display', 'flex')
          .style('align-items', 'center')
          .style('justify-content', 'center')
          .style('z-index', 9999)
          .on('click', function() { d3.select('#image-modal').remove(); });
        // Add large image
        modal.append('img')
          .attr('src', imageMap[d.name] || '../../images/placeholder.png')
          .attr('alt', d.name)
          .style('max-width', '80vw')
          .style('max-height', '80vh')
          .style('border-radius', '16px')
          .style('box-shadow', `0 8px 40px ${d.poppyColor}bb`)
          .style('background', '#fff')
          .style('display', 'block')
          .on('click', function(event) { event.stopPropagation(); });
        // Close modal on Escape key
        d3.select('body').on('keydown.modal', function(event) {
          if (event.key === 'Escape') d3.select('#image-modal').remove();
        });
      });
    // Draw black center dot
    svg.selectAll('.poppy-center')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'poppy-center')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.radius*0.28)
      .attr('fill', '#222');
    // Draw aligned movement labels below each image
    svg.selectAll('.poppy-label')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'poppy-label')
      // Position to the left of the poppy circle, vertically centered
      .attr('x', d => d.x - d.radius * 0.95)
      .attr('y', d => d.y + 2) // small tweak for vertical centering
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .attr('font-family', 'DM Sans, Arial, sans-serif')
      .attr('font-size', '13px')
      .attr('fill', '#111')
      .attr('font-weight', 600)
      .text(d => d.name);
    // --- End poppy-flower style ---


    // Add axis for years
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height + 18})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#111')
      .style('text-shadow', 'none');

    // Add chart title in poppy-label style
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('class', 'poppy-title')
      .style('font-size', '22px')
      .style('font-family', 'DM Sans, Arial, sans-serif')
      .style('font-weight', 700)
      .style('fill', '#111')
      .style('text-shadow', 'none')
      .text('Historic Timeline: Tangled Tree of Art Movements');

    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 180}, 20)`);
    const legendItems = legend.selectAll('.legend-item')
      .data(colorScale.domain())
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 22})`);
    legendItems.append('rect')
      .attr('width', 16)
      .attr('height', 16)
      .attr('fill', d => colorScale(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);
    legendItems.append('text')
      .attr('x', 22)
      .attr('y', 10)
      .attr('dominant-baseline', 'middle')
      .attr('class', 'poppy-label')
      .style('font-size', '13px')
      .style('font-family', 'DM Sans, Arial, sans-serif')
      .style('font-weight', 600)
      .style('fill', '#111')
      .style('text-shadow', 'none')
      .text(d => d);

  });
})();
