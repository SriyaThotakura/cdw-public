// graph-simple-01.js - Simple Force-Directed Graph with Scoped Variables
// This script creates a simple force-directed graph using D3.js

var graphSketch1 = function() {
  // Example data
  const nodes = [
    { id: 'A' },
    { id: 'B' },
    { id: 'C' },
    { id: 'D' },
    { id: 'E' }
  ];

  const links = [
    { source: 'A', target: 'B' },
    { source: 'A', target: 'C' },
    { source: 'B', target: 'D' },
    { source: 'C', target: 'D' },
    { source: 'D', target: 'E' }
  ];

  const width = 800;
  const height = 400;

  // Create SVG element
  const svg = d3.select('#d3-container-1')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#f0f0f0');

  // Create simulation
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(120))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2));

  // Draw links
  const link = svg.append('g')
    .attr('stroke', '#888')
    .attr('stroke-width', 2)
    .selectAll('line')
    .data(links)
    .enter().append('line');

  // Draw nodes
  const node = svg.append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .selectAll('circle')
    .data(nodes)
    .enter().append('circle')
    .attr('r', 20)
    .attr('fill', '#3264a8')
    .call(drag(simulation));

  // Draw labels
  const label = svg.append('g')
    .selectAll('text')
    .data(nodes)
    .enter().append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .attr('font-size', 16)
    .attr('fill', '#fff')
    .text(d => d.id);

  // Update positions on each tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    label
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  });

  // Drag behavior
  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }
};

// Execute the sketch
graphSketch1(); 