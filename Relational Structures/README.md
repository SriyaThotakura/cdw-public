# Relational Structures
## Graphs in D3.js - From Basic to Advanced
---

This tutorial explains how to create and customize graph visualizations in D3.js, progressing from basic concepts to advanced features including CSV data integration. We'll explore three examples that demonstrate increasing complexity: basic graphs, enhanced interactive graphs, and CSV-based data management.

## Table of Contents
1. [Understanding Graphs](#1-understanding-graphs)
2. [Basic Graph Implementation](#2-basic-graph-implementation)
3. [Enhanced Graph with Properties](#3-enhanced-graph-with-properties)
4. [CSV Data Integration](#4-csv-data-integration)
5. [Advanced Customization](#5-advanced-customization)

---

## 1. Understanding Graphs

### Core Concepts
A graph consists of two fundamental components:
- **Nodes (Vertices)**: Points in the network that can represent entities
- **Edges (Links)**: Connections between nodes that represent relationships

### Graph Types
- **Undirected**: Relationships go both ways (friendship)
- **Directed**: Relationships have direction (student-teacher)
- **Weighted**: Relationships have strength values
- **Attributed**: Nodes and edges have additional properties

---

## 2. Basic Graph Implementation

### 2.1 Simple Data Structure
```javascript
// Define the nodes (vertices) of our graph - each represents an entity
const nodes = [
  { id: 'A' },  // Node A with unique identifier
  { id: 'B' },  // Node B with unique identifier
  { id: 'C' },  // Node C with unique identifier
  { id: 'D' },  // Node D with unique identifier
  { id: 'E' }   // Node E with unique identifier
];

// Define the links (edges) that connect nodes - each represents a relationship
const links = [
  { source: 'A', target: 'B' },  // Link from node A to node B
  { source: 'A', target: 'C' },  // Link from node A to node C
  { source: 'B', target: 'D' },  // Link from node B to node D
  { source: 'C', target: 'D' },  // Link from node C to node D
  { source: 'D', target: 'E' }   // Link from node D to node E
];
```

### 2.2 Core D3.js Setup
```javascript
// Set the dimensions of our visualization canvas
const width = 800;   // Width in pixels
const height = 400;  // Height in pixels

// Create the main SVG container that will hold our graph
const svg = d3.select('#d3-container-1')  // Select the HTML element with id 'd3-container-1'
  .append('svg')                          // Create a new SVG element inside that container
  .attr('width', width)                   // Set the width attribute of the SVG
  .attr('height', height)                 // Set the height attribute of the SVG
  .style('background', '#f0f0f0');        // Set a light gray background color

// Create the force simulation that will automatically position our nodes
const simulation = d3.forceSimulation(nodes)  // Initialize simulation with our nodes array
  .force('link', d3.forceLink(links)          // Add link force to pull connected nodes together
    .id(d => d.id)                            // Tell D3 how to identify each node (using the id property)
    .distance(120))                           // Set the ideal distance between connected nodes (120 pixels)
  .force('charge', d3.forceManyBody()         // Add charge force to make nodes repel each other
    .strength(-300))                          // Negative value = repulsion, positive = attraction
  .force('center', d3.forceCenter(width / 2, height / 2));  // Pull all nodes toward the center of the canvas
```

### 2.3 Visual Elements
```javascript
// Create the visual links (lines) that connect nodes
const link = svg.append('g')              // Create a group to hold all link elements
  .attr('stroke', '#888')                 // Set the color of the lines (dark gray)
  .attr('stroke-width', 2)                // Set the thickness of the lines (2 pixels)
  .selectAll('line')                      // Select all line elements (none exist yet)
  .data(links)                            // Bind our links data to the selection
  .enter().append('line');                // Create a new line element for each link

// Create the visual nodes (circles) representing entities
const node = svg.append('g')              // Create a group to hold all node elements
  .attr('stroke', '#fff')                 // Set the border color of nodes (white)
  .attr('stroke-width', 2)                // Set the border thickness of nodes (2 pixels)
  .selectAll('circle')                    // Select all circle elements (none exist yet)
  .data(nodes)                            // Bind our nodes data to the selection
  .enter().append('circle')               // Create a new circle element for each node
  .attr('r', 20)                          // Set the radius of all circles (20 pixels)
  .attr('fill', '#3264a8')                // Set the fill color of circles (blue)
  .call(drag(simulation));                // Add drag behavior to make nodes movable

// Create text labels for each node showing the node identifier
const label = svg.append('g')             // Create a group to hold all label elements
  .selectAll('text')                      // Select all text elements (none exist yet)
  .data(nodes)                            // Bind our nodes data to the selection
  .enter().append('text')                 // Create a new text element for each node
  .attr('text-anchor', 'middle')          // Center the text horizontally on the node
  .attr('dy', '.35em')                    // Adjust vertical position to center text on the node
  .attr('font-size', 16)                  // Set the font size of the labels (16 pixels)
  .attr('fill', '#fff')                   // Set the text color (white)
  .text(d => d.id);                       // Set the text content to the node's ID
```

### 2.4 Animation and Interaction
```javascript
// This function runs every frame during the force simulation
// It updates the positions of all visual elements based on the simulation
simulation.on('tick', () => {
  // Update link positions - connect the start and end points of each line
  link
    .attr('x1', d => d.source.x)  // Set the x-coordinate of the line's start point
    .attr('y1', d => d.source.y)  // Set the y-coordinate of the line's start point
    .attr('x2', d => d.target.x)  // Set the x-coordinate of the line's end point
    .attr('y2', d => d.target.y); // Set the y-coordinate of the line's end point

  // Update node positions - move circles to their calculated positions
  node
    .attr('cx', d => d.x)  // Set the x-coordinate of the circle's center
    .attr('cy', d => d.y); // Set the y-coordinate of the circle's center

  // Update label positions - move text labels to follow their nodes
  label
    .attr('x', d => d.x)  // Set the x-coordinate of the text
    .attr('y', d => d.y); // Set the y-coordinate of the text
});

// Define the drag behavior that allows users to move nodes with their mouse
function drag(simulation) {
  // Called when the user starts dragging a node
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();  // Restart simulation with higher energy
    d.fx = d.x;  // Fix the node's x position to current position
    d.fy = d.y;  // Fix the node's y position to current position
  }

  // Called while the user is dragging a node
  function dragged(event, d) {
    d.fx = event.x;  // Update the fixed x position to mouse position
    d.fy = event.y;  // Update the fixed y position to mouse position
  }

  // Called when the user stops dragging a node
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);  // Stop the simulation
    d.fx = null;  // Release the fixed x position (let simulation take over)
    d.fy = null;  // Release the fixed y position (let simulation take over)
  }

  // Return the drag behavior with our custom event handlers
  return d3.drag()
    .on('start', dragstarted)  // Handle drag start event
    .on('drag', dragged)       // Handle drag move event
    .on('end', dragended);     // Handle drag end event
}
```

---

## 3. Enhanced Graph with Properties

### 3.1 Rich Node Data Structure
```javascript
// Enhanced nodes with additional properties - each node represents a person in the network
const nodes = [
  { 
    id: 'Alice',                    // Unique identifier for the node
    name: 'Alice Johnson',          // Full name for display purposes
    role: 'student',                // Role in the academic system
    age: 22,                        // Age of the person
    department: 'Computer Science', // Academic department
    friends: 15,                    // Number of friends (for potential future use)
    size: 25,                       // Visual size of the node circle (in pixels)
    color: '#ff6b6b'                // Color of the node (red for students)
  },
  { 
    id: 'Bob',                      // Unique identifier for the node
    name: 'Bob Smith',              // Full name for display purposes
    role: 'professor',              // Role in the academic system
    age: 45,                        // Age of the person
    department: 'Mathematics',      // Academic department
    friends: 8,                     // Number of friends (for potential future use)
    size: 35,                       // Visual size of the node circle (larger for professors)
    color: '#4ecdc4'                // Color of the node (teal for professors)
  }
  // ... more nodes with similar structure
];
```

### 3.2 Enhanced Edge Properties
```javascript
// Enhanced links with relationship data - each link represents a connection between two people
const links = [
  { 
    source: 'Alice',                // ID of the source node (who the connection starts from)
    target: 'Bob',                  // ID of the target node (who the connection goes to)
    relationship: 'student-teacher', // Type of relationship between the two people
    course: 'CS101',                // Course name (for student-teacher relationships)
    since: 2023,                    // Year when this relationship started
    strength: 0.8,                  // Strength of the relationship (0-1, affects line thickness)
    type: 'directed'                // Whether the relationship has direction (arrow) or is bidirectional
  },
  { 
    source: 'Alice',                // ID of the source node
    target: 'Carol',                // ID of the target node
    relationship: 'friends',        // Type of relationship
    since: 2022,                    // Year when this relationship started
    strength: 0.9,                  // Strength of the relationship
    type: 'bidirectional'           // No direction - friendship goes both ways
  }
  // ... more links with similar structure
];
```

### 3.3 Advanced Force Simulation
```javascript
// Create the force simulation that will position the nodes automatically
const simulation = d3.forceSimulation(nodes)  // Initialize simulation with our nodes array
  .force('link', d3.forceLink(links)          // Add link force to pull connected nodes together
    .id(d => d.id)                            // Tell D3 how to identify each node (using the id property)
    .distance(d => {                          // Set the ideal distance between connected nodes
      // Different distances based on relationship type
      switch(d.relationship) {
        case 'friends': return 80;            // Friends are closer together (80 pixels)
        case 'colleagues': return 100;        // Colleagues are medium distance (100 pixels)
        case 'student-teacher': return 120;   // Student-teacher pairs are further apart (120 pixels)
        default: return 100;                  // Default distance for unknown relationships
      }
    }))
  .force('charge', d3.forceManyBody()         // Add charge force to make nodes repel each other
    .strength(d => d.role === 'professor' ? -400 : -200))  // Professors repel more than students
  .force('center', d3.forceCenter(width / 2, height / 2))  // Pull all nodes toward the center
  .force('collision', d3.forceCollide().radius(d => d.size + 5));  // Prevent nodes from overlapping
```

### 3.4 Directed Edges with Arrows
```javascript
// Add arrow marker definition - this creates the arrow shape that will appear at the end of directed links
svg.append('defs').append('marker')  // Create a marker definition in the SVG defs section
  .attr('id', 'arrowhead-2')         // Give the marker a unique ID so we can reference it later
  .attr('viewBox', '-0 -5 10 10')    // Define the coordinate system for the marker (x, y, width, height)
  .attr('refX', 50)                  // X position where the arrow should be placed relative to the end of the line
  .attr('refY', 0)                   // Y position where the arrow should be placed (centered)
  .attr('orient', 'auto')            // Automatically orient the arrow to follow the line direction
  .attr('markerWidth', 4)            // Width of the arrow marker
  .attr('markerHeight', 4)           // Height of the arrow marker
  .append('path')                    // Create the actual arrow shape using a path element
  .attr('d', 'M 0,-4 L 8,0 L 0,4')  // Path data: move to (0,-4), line to (8,0), line to (0,4) - creates a triangle
  .attr('fill', '#666');             // Fill color of the arrow (dark gray)

// Apply arrows to directed links
const link = svg.append('g')         // Create a group to hold all the link elements
  .attr('stroke', '#888')            // Set the color of the lines (dark gray)
  .attr('stroke-width', 2)           // Set the thickness of the lines (2 pixels)
  .selectAll('line')                 // Select all line elements (none exist yet)
  .data(links)                       // Bind our links data to the selection
  .enter().append('line')            // Create a new line element for each link
  .attr('marker-end', d => d.type === 'directed' ? 'url(#arrowhead-2)' : null);  // Add arrow only to directed relationships
```

### 3.5 Interactive Features
```javascript
// Enhanced node visualization with custom properties
const node = svg.append('g')              // Create a group to hold all the node elements
  .attr('stroke', '#fff')                 // Set the border color of nodes (white)
  .attr('stroke-width', 2)                // Set the border thickness of nodes (2 pixels)
  .selectAll('circle')                    // Select all circle elements (none exist yet)
  .data(nodes)                            // Bind our nodes data to the selection
  .enter().append('circle')               // Create a new circle element for each node
  .attr('r', d => d.size || 20)           // Use size from data or default to 20 pixels
  .attr('fill', d => d.color || '#3264a8') // Use color from data or default to blue
  .call(drag(simulation));                // Add drag behavior to make nodes movable

// Add hover effects and tooltips to make the graph interactive
node.on('mouseover', function(event, d) {  // When mouse hovers over a node
  // Highlight connected links by making them more opaque
  link.style('stroke-opacity', l => 
    l.source.id === d.id || l.target.id === d.id ? 1 : 0.1  // Full opacity for connected links, low opacity for others
  );
  showTooltip(event, d);  // Display tooltip with node information
})
.on('mouseout', function(event, d) {  // When mouse leaves a node
  link.style('stroke-opacity', 0.6);  // Reset link opacity back to normal
  hideTooltip();  // Hide the tooltip
})
.on('click', function(event, d) {  // When node is clicked
  console.log('Clicked on:', d.name, 'Role:', d.role);  // Log node info to console
});
```

---

## 4. CSV Data Integration

### 4.1 CSV File Structure

**nodes.csv:**
```csv
id,name,role,age,department,friends,size,color
Alice,Alice Johnson,student,22,Computer Science,15,25,#ff6b6b
Bob,Bob Smith,professor,45,Mathematics,8,35,#4ecdc4
Carol,Carol Davis,student,20,Physics,12,22,#ff6b6b
David,David Wilson,professor,38,Computer Science,10,32,#4ecdc4
Eve,Eve Brown,student,21,Mathematics,18,28,#ff6b6b
```

**edges.csv:**
```csv
source,target,relationship,course,since,strength,type,department
Alice,Bob,student-teacher,CS101,2023,0.8,directed,
Alice,Carol,friends,,2022,0.9,bidirectional,
Bob,David,colleagues,,2020,0.7,bidirectional,Computer Science
Carol,David,student-teacher,CS201,2023,0.6,directed,
Eve,Bob,student-teacher,MATH101,2023,0.8,directed,
Alice,Eve,friends,,2021,0.7,bidirectional,
```

### 4.2 Loading CSV Data
```javascript
// Load both CSV files simultaneously using Promise.all for better error handling
Promise.all([
  d3.csv('nodes.csv'),  // Load the nodes data from CSV file
  d3.csv('edges.csv')   // Load the edges data from CSV file
]).then(function([nodesData, edgesData]) {  // When both files are loaded successfully
  console.log('Loaded nodes:', nodesData);  // Log the loaded nodes data for debugging
  console.log('Loaded edges:', edgesData);  // Log the loaded edges data for debugging

  // Process nodes data - convert string values from CSV to appropriate JavaScript types
  const nodes = nodesData.map(d => ({
    id: d.id,                           // Keep as string (unique identifier)
    name: d.name,                       // Keep as string (display name)
    role: d.role,                       // Keep as string (role category)
    age: +d.age,                        // Convert to number using unary plus operator
    department: d.department,           // Keep as string (department name)
    friends: +d.friends,                // Convert to number (friend count)
    size: +d.size,                      // Convert to number (visual size in pixels)
    color: d.color                      // Keep as string (hex color code)
  }));

  // Process edges data - convert string values from CSV to appropriate JavaScript types
  const links = edgesData.map(d => ({
    source: d.source,                   // Keep as string (source node ID)
    target: d.target,                   // Keep as string (target node ID)
    relationship: d.relationship,       // Keep as string (relationship type)
    course: d.course || '',             // Handle empty values with default empty string
    since: d.since ? +d.since : null,   // Convert to number if exists, otherwise null
    strength: +d.strength,              // Convert to number (relationship strength 0-1)
    type: d.type,                       // Keep as string (directed/bidirectional)
    department: d.department || ''      // Handle empty values with default empty string
  }));

  createGraph(nodes, links);  // Create the graph with the processed data
}).catch(function(error) {  // If there's an error loading the CSV files
  console.error('Error loading CSV files:', error);  // Log the error for debugging
  // Create fallback graph with sample data if CSV loading fails
  const fallbackNodes = [
    { id: 'Error', name: 'CSV Load Error', role: 'error', age: 0, department: 'Error', friends: 0, size: 20, color: '#ff0000' }
  ];
  const fallbackLinks = [];
  createGraph(fallbackNodes, fallbackLinks);  // Create a basic error graph
});
```

### 4.3 Benefits of CSV Integration
- **Separation of Concerns**: Data is separate from visualization logic
- **Easy Updates**: Modify data without touching code
- **Scalability**: Handle larger datasets efficiently
- **Collaboration**: Non-programmers can update data
- **Version Control**: Track data changes separately from code

---

## 5. Advanced Customization

### 5.1 Dynamic Visual Encoding
```javascript
// Node size based on role - professors get larger circles to show importance
.attr('r', d => d.role === 'professor' ? 35 : 25)  // 35px for professors, 25px for others

// Node color based on department - different colors for different academic departments
.attr('fill', d => {
  switch(d.department) {
    case 'Computer Science': return '#ff6b6b';  // Red for Computer Science
    case 'Mathematics': return '#4ecdc4';       // Teal for Mathematics
    case 'Physics': return '#45b7d1';           // Blue for Physics
    default: return '#3264a8';                  // Default blue for other departments
  }
})

// Link thickness based on relationship strength - stronger relationships have thicker lines
.attr('stroke-width', d => d.strength * 5)  // Multiply strength (0-1) by 5 for pixel width
```

### 5.2 Interactive Tooltips
```javascript
// Create tooltip div that will show detailed information when hovering over nodes
const tooltip = d3.select('body').append('div')  // Create a new div element in the body
  .attr('class', 'tooltip')                      // Give it a CSS class for styling
  .style('position', 'absolute')                 // Position it absolutely so we can place it anywhere
  .style('background', 'rgba(0, 0, 0, 0.8)')    // Semi-transparent black background
  .style('color', 'white')                       // White text color
  .style('padding', '8px')                       // Add some padding inside the tooltip
  .style('border-radius', '4px')                 // Rounded corners
  .style('font-size', '12px')                    // Small font size
  .style('pointer-events', 'none')               // Don't let the tooltip interfere with mouse events
  .style('opacity', 0);                          // Start invisible

// Function to display the tooltip when hovering over a node
function showTooltip(event, d) {
  tooltip.transition()                           // Start a smooth transition animation
    .duration(200)                               // Animation takes 200 milliseconds
    .style('opacity', 1);                        // Make the tooltip fully visible
  
  // Set the tooltip content with HTML formatting
  tooltip.html(`
    <strong>${d.name}</strong><br/>              <!-- Person's name in bold -->
    Role: ${d.role}<br/>                         <!-- Their role -->
    Age: ${d.age}<br/>                           <!-- Their age -->
    Department: ${d.department}<br/>             <!-- Their department -->
    Friends: ${d.friends}                        <!-- Number of friends -->
  `)
  .style('left', (event.pageX + 10) + 'px')     // Position tooltip 10px to the right of mouse
  .style('top', (event.pageY - 10) + 'px');     // Position tooltip 10px above mouse
}

// Function to hide the tooltip when mouse leaves a node
function hideTooltip() {
  tooltip.transition()                           // Start a smooth transition animation
    .duration(500)                               // Animation takes 500 milliseconds
    .style('opacity', 0);                        // Make the tooltip invisible
}
```

### 5.3 Graph Manipulation Functions
```javascript
// Function to add a new node to the graph
function addNode(newNode) {
  nodes.push(newNode);        // Add the new node to our nodes array
  updateGraph();              // Redraw the entire graph to show the new node
}

// Function to add a new link between existing nodes
function addLink(newLink) {
  links.push(newLink);        // Add the new link to our links array
  updateGraph();              // Redraw the entire graph to show the new connection
}

// Function to remove a node and all its connections
function removeNode(nodeId) {
  nodes = nodes.filter(n => n.id !== nodeId);  // Remove the node from nodes array
  links = links.filter(l => l.source.id !== nodeId && l.target.id !== nodeId);  // Remove all links connected to this node
  updateGraph();              // Redraw the entire graph
}

// Function to completely update the graph visualization
function updateGraph() {
  // Remove all existing visual elements from the SVG
  svg.selectAll('*').remove();
  
  // Update the force simulation with new data
  simulation.nodes(nodes);                    // Set the new nodes array
  simulation.force('link').links(links);      // Set the new links array
  
  // Redraw all visual elements (links, nodes, labels)
  // ... (repeat the drawing code from sections 2.3 and 3.5)
  
  simulation.alpha(1).restart();              // Restart the simulation with full energy
}
```

