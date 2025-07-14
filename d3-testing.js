// D3.js Foundation: Basic Setup and Axes
// This example demonstrates the fundamental concepts of D3.js:
// 1. Setting up an SVG container
// 2. Creating scales
// 3. Drawing axes
// 4. Basic data binding

// Wrap everything in an immediately invoked function expression (IIFE)
// This prevents variables from polluting the global scope
(function() {
  // Define margins around the chart area
  // These create space for axes, labels, and title
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  
  // Calculate the actual chart width by subtracting margins from total width
  const width = 800 - margin.left - margin.right;
  
  // Calculate the actual chart height by subtracting margins from total height
  const height = 400 - margin.top - margin.bottom;

  // Select the HTML element with id "d3-container-0" where we'll put our chart
  // d3.select() is like document.querySelector() but with D3's power
  const svg = d3.select("#d3-container-0")
    // Append an SVG element to the selected container
    .append("svg")
    // Set the total SVG width (chart + margins)
    .attr("width", width + margin.left + margin.right)
    // Set the total SVG height (chart + margins)
    .attr("height", height + margin.top + margin.bottom)
    // Append a group element inside the SVG
    // Groups help organize SVG elements and apply transformations
    .append("g")
    // Move the group to account for left and top margins
    // This creates the chart area within the margins
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Create scales - these are the heart of D3 data visualization
  // Scales map data values to visual properties (like pixel positions)
  
  // X scale: maps data values to pixel positions horizontally
  const xScale = d3.scaleLinear()
    // Define the input domain (data range): values from 0 to 100
    .domain([0, 100])
    // Define the output range (pixel range): from 0 to chart width
    .range([0, width]);

  // Y scale: maps data values to pixel positions vertically
  const yScale = d3.scaleLinear()
    // Define the input domain (data range): values from 0 to 50
    .domain([0, 50])
    // Define the output range (pixel range): from chart height to 0
    // Note: SVG Y-axis goes from top (0) to bottom (height), so we flip it
    .range([height, 0]);

  // Create axis generators
  // These will draw the tick marks and labels for our scales
  
  // Create an axis for the bottom of the chart (X-axis)
  const xAxis = d3.axisBottom(xScale);
  
  // Create an axis for the left side of the chart (Y-axis)
  const yAxis = d3.axisLeft(yScale);

  // Add the X-axis to our SVG
  svg.append("g")
    // Move the axis group to the bottom of the chart
    .attr("transform", `translate(0, ${height})`)
    // Call the axis generator to actually draw the axis
    .call(xAxis);

  // Add the Y-axis to our SVG
  svg.append("g")
    // No transform needed - it goes at the left edge (x=0)
    // Call the axis generator to actually draw the axis
    .call(yAxis);

  // Style the axis lines and tick marks
  
  // Select all path elements (the main axis lines) and style them
  svg.selectAll("path")
    // Set the stroke (line) color to dark gray
    .style("stroke", "#333")
    // Set the stroke width to 1 pixel
    .style("stroke-width", 1);

  // Select all line elements (the tick marks) and style them
  svg.selectAll("line")
    // Set the stroke color to light gray
    .style("stroke", "#ccc")
    // Set the stroke width to 1 pixel
    .style("stroke-width", 1);

  // Add axis labels to make the chart more informative
  
  // Add X-axis label
  svg.append("text")
    // Position horizontally at the center of the chart
    .attr("x", width / 2)
    // Position vertically below the X-axis with some padding
    .attr("y", height + margin.bottom - 10)
    // Center-align the text
    .style("text-anchor", "middle")
    // Set font size
    .style("font-size", "14px")
    // Set the actual text content
    .text("X Axis (0-100)");

  // Add Y-axis label
  svg.append("text")
    // Rotate the text 90 degrees counterclockwise
    .attr("transform", "rotate(-90)")
    // Position horizontally (after rotation, this becomes vertical position)
    .attr("x", -height / 2)
    // Position vertically (after rotation, this becomes horizontal position)
    .attr("y", -margin.left + 20)
    // Center-align the text
    .style("text-anchor", "middle")
    // Set font size
    .style("font-size", "14px")
    // Set the actual text content
    .text("Y Axis (0-50)");

  // Add a title to the chart
  
  // Create a text element for the title
  svg.append("text")
    // Position horizontally at the center of the chart
    .attr("x", width / 2)
    // Position vertically above the chart with some padding
    .attr("y", -10)
    // Center-align the text
    .style("text-anchor", "middle")
    // Set font size
    .style("font-size", "16px")
    // Make the text bold
    .style("font-weight", "bold")
    // Set the actual title text
    .text("D3.js Foundation: Basic Axes");

// Close the immediately invoked function expression
})(); 