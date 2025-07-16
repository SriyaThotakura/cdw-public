// d3-gantt-chart-csv.js
// This script creates a D3.js Gantt chart by loading data from a CSV file

(function() {
  // Set up the SVG container
  const margin = { top: 40, right: 40, bottom: 60, left: 150 };
  const width = 900 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3.select('#d3-container-3')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Create color scale for artistic movement categories
  const colorScale = d3.scaleOrdinal()
    .domain(['Early Period', 'Classical', 'Modern', 'Avant-garde', 'Experimental', 'Contemporary'])
    .range(['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#DAA520']);

  // Load data from CSV file
  d3.csv('events.csv').then(function(data) {
    console.log('CSV data loaded:', data);

    // Parse years
    data.forEach(function(d) {
      d.start = parseInt(d.start);
      d.end = parseInt(d.end);
    });

    // Create time scale for x-axis
    const timeScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.start),
        d3.max(data, d => d.end)
      ])
      .range([0, width]);

    // Create y scale for event positioning (one row per event)
    const yScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, height])
      .padding(0.2);

    // Create x-axis (time axis)
    const xAxis = d3.axisBottom(timeScale)
      .tickFormat(d => d)
      .tickSize(-height);

    // Add x-axis to SVG
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');

    // Style the axis
    svg.select('.x-axis')
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#666');

    // Add axis title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#333')
      .text('Art History Timeline (1400-2024)');

    // Add event bars (Gantt chart bars)
    const eventBars = svg.selectAll('.event-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'event-bar')
      .attr('x', d => timeScale(d.start))
      .attr('y', d => yScale(d.name))
      .attr('width', d => timeScale(d.end) - timeScale(d.start))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.category))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1)
          .attr('stroke-width', 2);
        
        showTooltip(event, d);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 0.8)
          .attr('stroke-width', 1);
        
        hideTooltip();
      });



    // Add event labels on the left
    svg.selectAll('.event-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'event-label')
      .attr('x', -10)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '11px')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .text(d => d.name);

    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 180}, 20)`);

    const legendItems = legend.selectAll('.legend-item')
      .data(['Early Period', 'Classical', 'Modern', 'Avant-garde', 'Experimental', 'Contemporary'])
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 18})`);

    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => colorScale(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    legendItems.append('text')
      .attr('x', 18)
      .attr('y', 9)
      .attr('dominant-baseline', 'middle')
      .style('font-size', '11px')
      .style('fill', '#333')
      .text(d => d);

    // Add current year indicator
    const currentYear = new Date().getFullYear();
    if (currentYear >= timeScale.domain()[0] && currentYear <= timeScale.domain()[1]) {
      svg.append('line')
        .attr('class', 'current-year-line')
        .attr('x1', timeScale(currentYear))
        .attr('x2', timeScale(currentYear))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#ff4757')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      svg.append('text')
        .attr('class', 'current-year-label')
        .attr('x', timeScale(currentYear) + 5)
        .attr('y', 15)
        .style('font-size', '11px')
        .style('fill', '#ff4757')
        .style('font-weight', 'bold')
        .text('Current Year');
    }

    // Add data source info
    svg.append('text')
      .attr('x', 10)
      .attr('y', -10)
      .style('font-size', '11px')
      .style('fill', '#666')
      .style('font-style', 'italic')
      .text('🎨 Art History Movements Timeline');
    
    console.log('D3.js Gantt chart with CSV data loaded successfully!');
  }).catch(function(error) {
    console.error('Error loading CSV file:', error);
    
    // Show error message on the page
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2 - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#ff4757')
      .text('Error loading CSV file. Please check the file path.');
    
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2 + 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#ff4757')
      .text('Are you running a local server? - See the tutorial on how to run a local server');
  });

  // Create tooltip
  const tooltip = d3.select('#d3-container-3')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('transition', 'opacity 0.2s');

  function showTooltip(event, d) {
    const duration = d.end - d.start; // Years
    
    tooltip.transition()
      .duration(200)
      .style('opacity', 1);
    
    tooltip.html(`
      <strong>${d.name}</strong><br>
      Period: ${d.start} - ${d.end}<br>
      Duration: ${duration} years<br>
      Era: ${d.category}
    `)
    .style('left', (event.pageX + 10) + 'px')
    .style('top', (event.pageY - 10) + 'px');
  }

  function hideTooltip() {
    tooltip.transition()
      .duration(200)
      .style('opacity', 0);
  }

})(); 