// Calendar Heatmap Visualization
// Simplified version that directly uses values from -100 to 100
(function() { // Start an immediately invoked function expression (IIFE) to avoid global scope pollution
  "use strict"; // Enable strict mode for better error checking and performance

  // Get the container element where the visualization will be placed
  const container = d3.select("#d3-container-4");
  
  // Set up dimensions following the source code
  const cellSize = 16; // height of a day cell in pixels
  const height = cellSize * 7; // height of a week (7 days) in pixels
  const width = (cellSize + 1.5) * 53; // width of the chart (approximate weeks in a year) in pixels
  
  // Define formatting functions for the axes and tooltips
  const formatValue = d3.format("+.0f"); // Format values as integers with + sign
  const formatDate = d3.utcFormat("%x"); // Format dates in local format
  const formatDay = i => "SMTWTFS"[i]; // Convert day index (0-6) to day abbreviation
  const formatMonth = d3.utcFormat("%b"); // Format month names as abbreviated text

  // Helpers to compute a day's position in the week
  const timeWeek = d3.utcMonday; // Use Monday as the start of the week
  const countDay = i => (i + 6) % 7; // Convert Sunday=0 to Monday=0 format

  // Load and process the CSV data
  d3.csv("synthetic-data.csv", d => ({ // Load CSV file and transform each row
    Date: d3.utcParse("%-m/%-d/%Y")(d.Date), // Parse date string to Date object
    Value: +d.Rainfall_mm // Use rainfall amount in mm
  })).then(function(data) { // Handle successful data loading
    
    // Define a diverging and symmetric color scale for the full range -100 to +100
    const color = d3.scaleSequential()
      .domain([0, 120])
      .interpolator(d3.interpolateRgbBasis([
        "#f6fbff", // pale blue
        "#7be3e6", // aqua
        "#2196f3", // bright blue
        "#005377"  // deep sea blue
      ])); // Sea shades blue scale for rainfall

    // Group data by year, in reverse input order. (Since the dataset is chronological,
    // this will show years in reverse chronological order.)
    const years = d3.groups(data, d => d.Date.getUTCFullYear()).reverse(); // Group data by year and reverse order (newest first)

    // A function that draws a thin white line to the left of each month.
    function pathMonth(t) { // Function to create SVG path for month separator lines
      const d = Math.max(0, Math.min(5, countDay(t.getUTCDay()))); // Get day of week (0-5, Monday-Friday)
      const w = timeWeek.count(d3.utcYear(t), t); // Get week number within the year
      return `${d === 0 ? `M${w * cellSize},0` // If Monday, start at week position
          : d === 5 ? `M${(w + 1) * cellSize},0` // If Friday, start at next week position
          : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`}V${5 * cellSize}`; // Otherwise, create L-shaped path
    }

    // Create the main SVG container
    const svg = d3.create("svg") // Create SVG element
        .attr("width", width) // Set width attribute
        .attr("height", height * years.length) // Set height to accommodate all years
        .attr("viewBox", [0, 0, width, height * years.length]) // Set viewBox for responsive scaling
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;"); // Set CSS styles

    // Create groups for each year
    const year = svg.selectAll("g") // Select all groups (initially empty)
      .data(years) // Bind year data
      .join("g") // Create/update groups
        .attr("transform", (d, i) => `translate(40.5,${height * i + cellSize * 1.5})`); // Position each year group

    // Add year labels
    year.append("text") // Add text element for year label
        .attr("x", -5) // Position text to the left
        .attr("y", -5) // Position text above the calendar
        .attr("font-weight", "bold") // Make text bold
        .attr("text-anchor", "end") // Right-align text
        .text(([key]) => key); // Set text to year number

    // Add day-of-week labels
    year.append("g") // Add group for day labels
        .attr("text-anchor", "end") // Right-align all text in this group
      .selectAll() // Select all elements (initially empty)
      .data(d3.range(1, 6)) // Bind data for Monday through Friday (1-5)
      .join("text") // Create/update text elements
        .attr("x", -5) // Position text to the left
        .attr("y", i => (countDay(i) + 0.5) * cellSize) // Position vertically for each day
        .attr("dy", "0.31em") // Adjust vertical alignment
        .text(formatDay); // Set text to day abbreviation

    // Function to create a drop shape path centered at (cx, cy)
    function dropPath(cx, cy, size) {
      const w = size * 0.8, h = size * 1.1;
      return `M ${cx} ${cy - h/2}
        C ${cx + w/2} ${cy - h/4}, ${cx + w/2} ${cy + h/3}, ${cx} ${cy + h/2}
        C ${cx - w/2} ${cy + h/3}, ${cx - w/2} ${cy - h/4}, ${cx} ${cy - h/2}
        Z`;
    }

    // Add calendar cells (drop shapes for each day)
    year.append("g")
      .selectAll("path")
      .data(d => d[1])
      .join("path")
        .attr("d", d => {
          const x = d3.utcMonday.count(d3.utcYear(d.Date), d.Date) * cellSize + cellSize/2 + 1;
          const y = d.Date.getUTCDay() * cellSize + cellSize/2 + 1;
          return dropPath(x, y, cellSize - 2);
        })
        .attr("fill", d => color(d.Value))
      .append("title")
        .text(d => `${formatDate(d.Date)}\nRainfall: ${formatValue(d.Value)} mm`);

    // Add month separators and labels
    const month = year.append("g") // Add group for month elements
      .selectAll() // Select all elements (initially empty)
      .data(([, values]) => d3.utcMonths(d3.utcMonth(values[0].Date), values.at(-1).Date)) // Get all months in the year's data
      .join("g"); // Create/update groups

    // Add white separator lines between months
    month.filter((d, i) => i).append("path") // Add path for all months except the first
        .attr("fill", "none") // No fill
        .attr("stroke", "#fff") // White stroke
        .attr("stroke-width", 3) // Thick stroke
        .attr("d", pathMonth); // Use pathMonth function to create the path

    // Add month labels
    month.append("text") // Add text element for month name
        .attr("x", d => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2) // Position horizontally at start of month
        .attr("y", -5) // Position above the calendar
        .text(formatMonth); // Set text to abbreviated month name

    // Append the SVG to the container
    container.node().appendChild(svg.node()); // Add the SVG to the DOM
    
    // Add a legend
    const legendWidth = 200; // Width of legend in pixels
    const legendHeight = 40; // Height of legend in pixels
    const legendSvg = container.append("svg") // Create new SVG for legend
      .attr("width", legendWidth) // Set legend width
      .attr("height", legendHeight) // Set legend height
      .style("margin-top", "10px"); // Add top margin

    // Create scale for legend axis
    const legendScale = d3.scaleLinear() // Create linear scale
      .domain([0, 120]) // Scale from 0 to 120 mm
      .range([0, legendWidth - 20]); // Map to legend width

    // Create axis for legend
    const legendAxis = d3.axisBottom(legendScale) // Create bottom-oriented axis
      .tickSize(6) // Set tick mark size
      .tickFormat(formatValue) // Format ticks as integers
      .tickValues([0, 30, 60, 90, 120]); // Set specific tick values to show the full range clearly

    // Add axis to legend
    legendSvg.append("g") // Add group for axis
      .attr("transform", `translate(10,${legendHeight - 15})`) // Position axis at bottom of legend
      .call(legendAxis); // Apply the axis

    // Add legend gradient
    const defs = legendSvg.append("defs"); // Add definitions section for gradients
    const gradient = defs.append("linearGradient") // Create linear gradient
      .attr("id", "legend-gradient") // Give gradient an ID
      .attr("x1", "0%") // Start point x
      .attr("y1", "0%") // Start point y
      .attr("x2", "100%") // End point x
      .attr("y2", "0%"); // End point y (horizontal gradient)

    // Add gradient stops
    gradient.selectAll("stop") // Select all stops (initially empty)
      .data(d3.ticks(0, 1, 10)) // Bind data for 10 evenly spaced values
      .enter().append("stop") // Create stop elements
      .attr("offset", d => `${d * 100}%`) // Set offset as percentage
      .attr("stop-color", d => color(d3.scaleLinear().domain([0, 1]).range([0, 120])(d))); // Set color using rainfall scale

    // Add gradient rectangle to legend
    legendSvg.append("rect") // Add rectangle element
      .attr("x", 10) // Position x
      .attr("y", 0) // Position y
      .attr("width", legendWidth - 20) // Set width
      .attr("height", legendHeight - 25) // Set height
      .style("fill", "url(#legend-gradient)"); // Fill with gradient

    // Add legend label
    legendSvg.append("text") // Add text element for legend title
      .attr("x", legendWidth / 2) // Center horizontally
      .attr("y", legendHeight - 25) // Position above gradient
      .attr("text-anchor", "middle") // Center-align text
      .style("font-size", "12px") // Set font size
      .text("Rainfall (mm)"); // Set text content

  }).catch(function(error) { // Handle errors in data loading
    console.error("Error loading the CSV file:", error); // Log error to console
    container.append("p") // Add paragraph element
      .style("color", "red") // Make text red
      .text("Error loading data. Please check the console for details."); // Display error message
  });

})(); // End the immediately invoked function expression 