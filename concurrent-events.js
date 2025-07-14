// d3-gantt-chart.js
// This script creates a D3.js Gantt chart showing events with start and end dates

(function() {
  // Set up the SVG container
  const margin = { top: 40, right: 40, bottom: 60, left: 120 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG element with magenta background
  d3.select('#d3-container-2').style('background', '#e600ff');
  const svg = d3.select('#d3-container-2')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .style('background', '#e600ff')
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Sample event data with start and end dates (Gantt chart data)
  // Socially sensitive data about community development and social services
  const events = [
    { 
      name: 'Community Needs Assessment', 
      start: new Date('2023-01-01'), 
      end: new Date('2023-02-15'), 
      category: 'planning',
      progress: 0.9
    },
    { 
      name: 'Housing Support Program', 
      start: new Date('2023-01-15'), 
      end: new Date('2023-06-30'), 
      category: 'design',
      progress: 0.7
    },
    { 
      name: 'Food Security Initiative', 
      start: new Date('2023-03-01'), 
      end: new Date('2023-08-31'), 
      category: 'development',
      progress: 0.6
    },
    { 
      name: 'Mental Health Services', 
      start: new Date('2023-04-01'), 
      end: new Date('2023-09-30'), 
      category: 'testing',
      progress: 0.4
    },
    { 
      name: 'Youth Education Program', 
      start: new Date('2023-05-01'), 
      end: new Date('2023-10-31'), 
      category: 'documentation',
      progress: 0.8
    },
    { 
      name: 'Community Outreach', 
      start: new Date('2023-07-01'), 
      end: new Date('2023-12-31'), 
      category: 'deployment',
      progress: 0.3
    }
  ];

  // Create time scale for x-axis
  const timeScale = d3.scaleTime()
    .domain([
      d3.min(events, d => d.start),
      d3.max(events, d => d.end)
    ])
    .range([0, width]);

  // Create y scale for event positioning (one row per event)
  const yScale = d3.scaleBand()
    .domain(events.map(d => d.name))
    .range([0, height])
    .padding(0.3);

  // Create color scale for event categories
  const colorScale = d3.scaleOrdinal()
    .domain(['planning', 'design', 'development', 'testing', 'documentation', 'deployment'])
    .range(['#3264a8', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']);

  // Create x-axis (time axis)
  const xAxis = d3.axisBottom(timeScale)
    .tickFormat(d3.timeFormat('%b %Y'))
    .tickSize(-height);





  // Color palette for bars (matching image)
  const palette = ['#2196f3', '#00c9a7', '#ffc107', '#ff9800', '#fff', '#00c9a7'];
  // Assign color by event index
  function barColor(i) { return palette[i % palette.length]; }

  // Draw colored rounded bars
  const barRadius = 18;
  svg.selectAll('.event-bar')
    .data(events)
    .enter()
    .append('rect')
    .attr('class', 'event-bar')
    .attr('x', d => timeScale(d.start))
    .attr('y', (d, i) => yScale(d.name) + 8)
    .attr('width', d => timeScale(d.end) - timeScale(d.start))
    .attr('height', yScale.bandwidth() - 16)
    .attr('rx', barRadius)
    .attr('ry', barRadius)
    .attr('fill', (d, i) => barColor(i))
    .attr('stroke', 'none')
    .style('opacity', 1);

  // Draw white outlined "inactive" bars (background floats)
  svg.selectAll('.event-outline')
    .data(events)
    .enter()
    .append('rect')
    .attr('class', 'event-outline')
    .attr('x', d => timeScale.range()[0] + 10)
    .attr('y', (d, i) => yScale(d.name) + 4)
    .attr('width', width - 20)
    .attr('height', yScale.bandwidth() - 8)
    .attr('rx', barRadius)
    .attr('ry', barRadius)
    .attr('fill', 'none')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2.2)
    .attr('opacity', 0.9);

  // Bring colored bars above outlines
  svg.selectAll('.event-bar').raise();

  // Add progress bars (overlay on event bars)
  const progressBars = svg.selectAll('.progress-bar')
    .data(events)
    .enter()
    .append('rect')
    .attr('class', 'progress-bar')
    .attr('x', d => timeScale(d.start))
    .attr('y', d => yScale(d.name) + 2)
    .attr('width', d => (timeScale(d.end) - timeScale(d.start)) * d.progress)
    .attr('height', yScale.bandwidth() - 4)
    .attr('fill', 'rgba(255, 255, 255, 0.3)')
    .style('pointer-events', 'none');

  // Add event labels on the left with two-line formatting
  svg.selectAll('.event-label-group')
    .data(events)
    .enter()
    .append('g')
    .attr('class', 'event-label-group')
    .attr('transform', (d, i) => {
      // Center horizontally in bar
      const x = (timeScale(d.start) + timeScale(d.end)) / 2;
      // Center vertically in bar
      const y = yScale(d.name) + yScale.bandwidth() / 2;
      return `translate(${x}, ${y})`;
    })
    .style('pointer-events', 'none');

  // Function to split text into two lines
  function splitTextIntoTwoLines(text, maxLength = 15) {
    const words = text.split(' ');
    if (text.length <= maxLength) {
      return [text, ''];
    }
    
    let line1 = '';
    let line2 = '';
    
    for (let i = 0; i < words.length; i++) {
      if (line1.length + words[i].length <= maxLength) {
        line1 += (line1 ? ' ' : '') + words[i];
      } else {
        line2 = words.slice(i).join(' ');
        break;
      }
    }
    
    return [line1, line2];
  }

  // Add first line of text
  svg.selectAll('.event-label-group')
    .append('text')
    .attr('class', 'event-label-line1')
    .attr('x', 0)
    .attr('y', -7)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-size', '12px')
    .style('font-family', 'Inter, Montserrat, Arial, system-ui, sans-serif')
    .style('font-weight', 'bold')
    .style('fill', '#fff')
    .style('text-shadow', '1px 1px 4px #a200a2')
    .text(d => splitTextIntoTwoLines(d.name)[0]);

  // Add second line of text
  svg.selectAll('.event-label-group')
    .append('text')
    .attr('class', 'event-label-line2')
    .attr('x', 0)
    .attr('y', 9)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-size', '12px')
    .style('font-family', 'Inter, Montserrat, Arial, system-ui, sans-serif')
    .style('font-weight', 'bold')
    .style('fill', '#fff')
    .style('text-shadow', '1px 1px 4px #a200a2')
    .text(d => splitTextIntoTwoLines(d.name)[1]);

  // Create tooltip
  const tooltip = d3.select('#d3-container-2')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.92)')
    .style('color', '#fff')
    .style('padding', '12px 18px')
    .style('border-radius', '8px')
    .style('font-size', '18px')
    .style('font-family', 'Inter, Montserrat, Arial, system-ui, sans-serif')
    .style('font-weight', 'bold')
    .style('text-shadow', '1px 1px 4px #a200a2')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('transition', 'opacity 0.2s');

  function showTooltip(event, d) {
    const duration = Math.ceil((d.end - d.start) / (1000 * 60 * 60 * 24)); // Days
    
    tooltip.transition()
      .duration(200)
      .style('opacity', 1);
    
    tooltip.html(`
      <strong>${d.name}</strong><br>
      Start: ${d3.timeFormat('%B %d, %Y')(d.start)}<br>
      End: ${d3.timeFormat('%B %d, %Y')(d.end)}<br>
      Duration: ${duration} days<br>
      Progress: ${Math.round(d.progress * 100)}%<br>
      Category: ${d.category}
    `)
    .style('left', (event.pageX + 10) + 'px')
    .style('top', (event.pageY - 10) + 'px');
  }

  function hideTooltip() {
    tooltip.transition()
      .duration(200)
      .style('opacity', 0);
  }



  // Add today's line (current date indicator)
  const today = new Date();
  if (today >= timeScale.domain()[0] && today <= timeScale.domain()[1]) {
    svg.append('line')
      .attr('class', 'today-line')
      .attr('x1', timeScale(today))
      .attr('x2', timeScale(today))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#ff4757')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    svg.append('text')
      .attr('class', 'today-label')
      .attr('x', timeScale(today) + 5)
      .attr('y', 15)
      .style('font-size', '11px')
      .style('fill', '#ff4757')
      .style('font-weight', 'bold')
      .text('Today');
  }

  console.log('D3.js Gantt chart loaded successfully!');
})(); 