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

    // Draw links (curved for tangle)
    svg.selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d => {
        // Use a smooth curve between source and target
        const midX = (d.source.x + d.target.x) / 2;
        return `M${d.source.x},${d.source.y} C${midX},${d.source.y} ${midX},${d.target.y} ${d.target.x},${d.target.y}`;
      })
      .attr('stroke', '#bbb')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('opacity', 0.7);

    // Draw nodes as rounded rectangles spanning the period
    svg.selectAll('.node-bar')
      .data(nodes)
      .enter()
      .append('rect')
      .attr('class', 'node-bar')
      .attr('x', d => xScale(d.start))
      .attr('y', d => d.y - 14)
      .attr('width', d => xScale(d.end) - xScale(d.start))
      .attr('height', 28)
      .attr('rx', 14)
      .attr('fill', d => colorScale(d.category))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('opacity', 0.95);

    // Draw node labels centered in bars
    svg.selectAll('.node-label')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('x', d => (xScale(d.start) + xScale(d.end)) / 2)
      .attr('y', d => d.y + 4)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '15px')
      .style('font-family', 'Inter, Montserrat, Arial, system-ui, sans-serif')
      .style('font-weight', 'bold')
      .style('fill', '#fff')
      .style('text-shadow', '1px 1px 4px #a200a2')
      .text(d => d.name);

    // Add axis for years
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height + 18})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#fff')
      .style('text-shadow', '1px 1px 4px #a200a2');

    // Add chart title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-family', 'Inter, Montserrat, Arial, system-ui, sans-serif')
      .style('font-weight', 'bold')
      .style('fill', '#fff')
      .style('text-shadow', '1px 1px 8px #a200a2')
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
      .style('font-size', '13px')
      .style('fill', '#fff')
      .style('text-shadow', '1px 1px 4px #a200a2')
      .text(d => d);

  });
})();
