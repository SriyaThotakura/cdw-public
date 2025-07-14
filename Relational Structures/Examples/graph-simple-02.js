// graph-simple-02.js - Enhanced Network Graph with Scoped Variables
// This script demonstrates how to customize the graph with additional data properties

var graphSketch2 = function() {  // Define the main function that contains all graph logic
  // ============================================================================
  // ENHANCED DATA SETUP WITH CUSTOM PROPERTIES
  // ============================================================================

  // Enhanced nodes with additional properties - each node represents a person in the network
  const nodes = [  // Array containing all the people/nodes in our network
    { 
      id: 'Alice',  // Unique identifier for the node
      name: 'Alice Johnson',  // Full name for display
      role: 'student',  // Role in the academic system
      age: 22,  // Age of the person
      department: 'Computer Science',  // Academic department
      friends: 15,  // Number of friends (for potential future use)
      size: 25,  // Visual size of the node circle
      color: '#ff6b6b'  // Color of the node (red for students)
    },
    { 
      id: 'Bob',  // Unique identifier for the node
      name: 'Bob Smith',  // Full name for display
      role: 'professor',  // Role in the academic system
      age: 45,  // Age of the person
      department: 'Mathematics',  // Academic department
      friends: 8,  // Number of friends (for potential future use)
      size: 35,  // Visual size of the node circle (larger for professors)
      color: '#4ecdc4'  // Color of the node (teal for professors)
    },
    { 
      id: 'Carol',  // Unique identifier for the node
      name: 'Carol Davis',  // Full name for display
      role: 'student',  // Role in the academic system
      age: 20,  // Age of the person
      department: 'Physics',  // Academic department
      friends: 12,  // Number of friends (for potential future use)
      size: 22,  // Visual size of the node circle
      color: '#ff6b6b'  // Color of the node (red for students)
    },
    { 
      id: 'David',  // Unique identifier for the node
      name: 'David Wilson',  // Full name for display
      role: 'professor',  // Role in the academic system
      age: 38,  // Age of the person
      department: 'Computer Science',  // Academic department
      friends: 10,  // Number of friends (for potential future use)
      size: 32,  // Visual size of the node circle (larger for professors)
      color: '#4ecdc4'  // Color of the node (teal for professors)
    },
    { 
      id: 'Eve',  // Unique identifier for the node
      name: 'Eve Brown',  // Full name for display
      role: 'student',  // Role in the academic system
      age: 21,  // Age of the person
      department: 'Mathematics',  // Academic department
      friends: 18,  // Number of friends (for potential future use)
      size: 28,  // Visual size of the node circle
      color: '#ff6b6b'  // Color of the node (red for students)
    }
  ];

  // Enhanced links with relationship data - each link represents a connection between two people
  const links = [  // Array containing all the connections/relationships in our network
    { 
      source: 'Alice',  // ID of the source node (who the connection starts from)
      target: 'Bob',  // ID of the target node (who the connection goes to)
      relationship: 'student-teacher',  // Type of relationship between the two people
      course: 'CS101',  // Course name (for student-teacher relationships)
      since: 2023,  // Year when this relationship started
      strength: 0.8,  // Strength of the relationship (0-1, affects line thickness)
      type: 'directed'  // Whether the relationship has direction (arrow) or is bidirectional
    },
    { 
      source: 'Alice',  // ID of the source node
      target: 'Carol',  // ID of the target node
      relationship: 'friends',  // Type of relationship
      since: 2022,  // Year when this relationship started
      strength: 0.9,  // Strength of the relationship
      type: 'bidirectional'  // No direction - friendship goes both ways
    },
    { 
      source: 'Bob',  // ID of the source node
      target: 'David',  // ID of the target node
      relationship: 'colleagues',  // Type of relationship
      department: 'Computer Science',  // Department they work in together
      since: 2020,  // Year when this relationship started
      strength: 0.7,  // Strength of the relationship
      type: 'bidirectional'  // No direction - colleague relationship is mutual
    },
    { 
      source: 'Carol',  // ID of the source node
      target: 'David',  // ID of the target node
      relationship: 'student-teacher',  // Type of relationship
      course: 'CS201',  // Course name
      since: 2023,  // Year when this relationship started
      strength: 0.6,  // Strength of the relationship
      type: 'directed'  // Has direction - arrow points from student to teacher
    },
    { 
      source: 'Eve',  // ID of the source node
      target: 'Bob',  // ID of the target node
      relationship: 'student-teacher',  // Type of relationship
      course: 'MATH101',  // Course name
      since: 2023,  // Year when this relationship started
      strength: 0.8,  // Strength of the relationship
      type: 'directed'  // Has direction - arrow points from student to teacher
    },
    { 
      source: 'Alice',  // ID of the source node
      target: 'Eve',  // ID of the target node
      relationship: 'friends',  // Type of relationship
      since: 2021,  // Year when this relationship started
      strength: 0.7,  // Strength of the relationship
      type: 'bidirectional'  // No direction - friendship goes both ways
    }
  ];

  // Canvas dimensions - set the size of our visualization area
  const width = 800;  // Width of the SVG canvas in pixels
  const height = 400;  // Height of the SVG canvas in pixels

  // ============================================================================
  // SVG SETUP WITH ARROW MARKERS
  // ============================================================================

  // Create the main SVG container for our graph
  const svg = d3.select('#d3-container-2')  // Select the HTML element with id 'd3-container-2'
    .append('svg')  // Create a new SVG element inside that container
    .attr('width', width)  // Set the width of the SVG to our defined width
    .attr('height', height)  // Set the height of the SVG to our defined height
    .style('background', '#f0f0f0');  // Set a light gray background color to match graph-simple-01.js

  // Add arrow marker for directed edges - this creates the arrow shape that will appear at the end of directed links
  svg.append('defs').append('marker')  // Create a marker definition in the SVG defs section
    .attr('id', 'arrowhead-2')  // Give the marker a unique ID so we can reference it later
    .attr('viewBox', '-0 -5 10 10')  // Define the coordinate system for the marker (x, y, width, height)
    .attr('refX', 50)  // X position where the arrow should be placed relative to the end of the line
    .attr('refY', 0)  // Y position where the arrow should be placed (centered)
    .attr('orient', 'auto')  // Automatically orient the arrow to follow the line direction
    .attr('markerWidth', 4)  // Width of the arrow marker
    .attr('markerHeight', 4)  // Height of the arrow marker
    .append('path')  // Create the actual arrow shape using a path element
    .attr('d', 'M 0,-4 L 8,0 L 0,4')  // Path data: move to (0,-4), line to (8,0), line to (0,4) - creates a triangle
    .attr('fill', '#666');  // Fill color of the arrow (dark gray)

  // ============================================================================
  // ENHANCED FORCE SIMULATION
  // ============================================================================

  // Create the force simulation that will position the nodes automatically
  const simulation = d3.forceSimulation(nodes)  // Create a new force simulation with our nodes
    .force('link', d3.forceLink(links)  // Add a force that pulls connected nodes together
      .id(d => d.id)  // Tell D3 how to identify each node (using the id property)
      .distance(d => {  // Set the ideal distance between connected nodes
        // Different distances based on relationship type
        switch(d.relationship) {
          case 'friends': return 80;  // Friends are closer together
          case 'colleagues': return 100;  // Colleagues are medium distance
          case 'student-teacher': return 120;  // Student-teacher pairs are further apart
          default: return 100;  // Default distance for unknown relationships
        }
      }))
    .force('charge', d3.forceManyBody()  // Add a force that makes nodes repel each other
      .strength(d => {  // Set the strength of the repulsion
        // Professors repel more than students (they're more important, so they get more space)
        return d.role === 'professor' ? -400 : -200;
      }))
    .force('center', d3.forceCenter(width / 2, height / 2))  // Add a force that pulls all nodes toward the center
    .force('collision', d3.forceCollide().radius(d => d.size + 5));  // Add a force that prevents nodes from overlapping

  // ============================================================================
  // ENHANCED LINK VISUALIZATION
  // ============================================================================

  // Create the visual links (lines) between nodes
  const link = svg.append('g')  // Create a group to hold all the link elements
    .attr('stroke', '#888')  // Set default stroke color for links (matching graph-simple-01.js)
    .attr('stroke-width', 2)  // Set uniform stroke width (matching graph-simple-01.js)
    .selectAll('line')  // Select all line elements (none exist yet)
    .data(links)  // Bind our links data to the selection
    .enter().append('line')  // Create a new line element for each link
    .attr('marker-end', d => d.type === 'directed' ? 'url(#arrowhead-2)' : null);  // Add arrow only to directed relationships

  // ============================================================================
  // ENHANCED NODE VISUALIZATION
  // ============================================================================

  // Create the visual nodes (circles) representing people
  const node = svg.append('g')  // Create a group to hold all the node elements
    .attr('stroke', '#fff')  // Set the border color of nodes to white (matching graph-simple-01.js)
    .attr('stroke-width', 2)  // Set the border thickness of nodes (matching graph-simple-01.js)
    .selectAll('circle')  // Select all circle elements (none exist yet)
    .data(nodes)  // Bind our nodes data to the selection
    .enter().append('circle')  // Create a new circle element for each node
    .attr('r', 20)  // Set uniform radius for all nodes (matching graph-simple-01.js)
    .attr('fill', '#3264a8')  // Set uniform blue color for all nodes (matching graph-simple-01.js)
    .call(drag(simulation));  // Add drag behavior to the nodes so users can move them around

  // Add hover effects to make the graph interactive
  node.on('mouseover', function(event, d) {  // When mouse hovers over a node
    // Highlight connected links by making them more opaque
    link.style('stroke-opacity', l => 
      l.source.id === d.id || l.target.id === d.id ? 1 : 0.1  // Full opacity for connected links, low opacity for others
    );
    
    // Show tooltip with node information
    showTooltip(event, d);
  })
  .on('mouseout', function(event, d) {  // When mouse leaves a node
    // Reset link opacity back to normal
    link.style('stroke-opacity', 0.6);
    
    // Hide tooltip
    hideTooltip();
  })
  .on('click', function(event, d) {  // When node is clicked
    console.log('Clicked on:', d.name, 'Role:', d.role, 'Department:', d.department);  // Log node info to console
  });

  // ============================================================================
  // ENHANCED LABELS
  // ============================================================================

  // Create text labels for each node showing the person's name
  const label = svg.append('g')  // Create a group to hold all the label elements
    .selectAll('text')  // Select all text elements (none exist yet)
    .data(nodes)  // Bind our nodes data to the selection
    .enter().append('text')  // Create a new text element for each node
    .attr('text-anchor', 'middle')  // Center the text horizontally on the node
    .attr('dy', '.35em')  // Adjust vertical position to center text on the node
    .attr('font-size', 16)  // Set the font size of the labels (matching graph-simple-01.js)
    .attr('fill', '#fff')  // Set the text color to white (matching graph-simple-01.js)
    .text(d => d.id);  // Set the text content to the node ID (matching graph-simple-01.js)

  // ============================================================================
  // TOOLTIP FUNCTIONALITY
  // ============================================================================

  // Create tooltip div that will show detailed information when hovering over nodes
  const tooltip = d3.select('body').append('div')  // Create a new div element in the body
    .attr('class', 'tooltip')  // Give it a CSS class for styling
    .style('position', 'absolute')  // Position it absolutely so we can place it anywhere
    .style('background', 'rgba(0, 0, 0, 0.8)')  // Semi-transparent black background
    .style('color', 'white')  // White text color
    .style('padding', '8px')  // Add some padding inside the tooltip
    .style('border-radius', '4px')  // Rounded corners
    .style('font-size', '12px')  // Small font size
    .style('pointer-events', 'none')  // Don't let the tooltip interfere with mouse events
    .style('opacity', 0);  // Start invisible

  function showTooltip(event, d) {  // Function to display the tooltip when hovering over a node
    tooltip.transition()  // Start a smooth transition animation
      .duration(200)  // Animation takes 200 milliseconds
      .style('opacity', 1);  // Make the tooltip fully visible
    
    tooltip.html(`
      <strong>${d.name}</strong><br/>
      Role: ${d.role}<br/> 
      Department: ${d.department}<br/> 
      Age: ${d.age}<br/> 
      Friends: ${d.friends}  
    `)
      .style('left', (event.pageX + 10) + 'px')  // Position tooltip 10px to the right of mouse
      .style('top', (event.pageY - 10) + 'px');  // Position tooltip 10px above mouse
  }

  function hideTooltip() {  // Function to hide the tooltip when mouse leaves a node
    tooltip.transition()  // Start a smooth transition animation
      .duration(500)  // Animation takes 500 milliseconds (slower than show)
      .style('opacity', 0);  // Make the tooltip invisible
  }

  // ============================================================================
  // ANIMATION LOOP
  // ============================================================================

  // This function runs every frame during the force simulation to update visual positions
  simulation.on('tick', () => {  // 'tick' event fires every frame of the animation
    link  // Update the position of all links (lines)
      .attr('x1', d => d.source.x)  // Set the starting X coordinate of each line to the source node's X position
      .attr('y1', d => d.source.y)  // Set the starting Y coordinate of each line to the source node's Y position
      .attr('x2', d => d.target.x)  // Set the ending X coordinate of each line to the target node's X position
      .attr('y2', d => d.target.y);  // Set the ending Y coordinate of each line to the target node's Y position

    node  // Update the position of all nodes (circles)
      .attr('cx', d => d.x)  // Set the center X coordinate of each circle to the node's X position
      .attr('cy', d => d.y);  // Set the center Y coordinate of each circle to the node's Y position

    label  // Update the position of all labels (text)
      .attr('x', d => d.x)  // Set the X coordinate of each text label to the node's X position
      .attr('y', d => d.y);  // Set the Y coordinate of each text label to the node's Y position
  });

  // ============================================================================
  // DRAG BEHAVIOR
  // ============================================================================

  // Function that creates drag behavior for the nodes
  function drag(simulation) {  // Takes the force simulation as a parameter
    function dragstarted(event, d) {  // Called when user starts dragging a node
      if (!event.active) simulation.alphaTarget(0.3).restart();  // Restart simulation with higher energy if it was cooling down
      d.fx = d.x;  // Fix the node's X position to where it currently is
      d.fy = d.y;  // Fix the node's Y position to where it currently is
    }

    function dragged(event, d) {  // Called while user is dragging a node
      d.fx = event.x;  // Update the fixed X position to follow the mouse
      d.fy = event.y;  // Update the fixed Y position to follow the mouse
    }

    function dragended(event, d) {  // Called when user stops dragging a node
      if (!event.active) simulation.alphaTarget(0);  // Let the simulation cool down naturally
      d.fx = null;  // Remove the fixed X position so the node can move freely again
      d.fy = null;  // Remove the fixed Y position so the node can move freely again
    }

    return d3.drag()  // Create a new drag behavior
      .on('start', dragstarted)  // Attach the dragstarted function to the 'start' event
      .on('drag', dragged)  // Attach the dragged function to the 'drag' event
      .on('end', dragended);  // Attach the dragended function to the 'end' event
  }

  // ============================================================================
  // UTILITY FUNCTIONS FOR DYNAMIC UPDATES
  // ============================================================================

  // Function to add a new node to the graph
  function addNode(newNode) {  // Takes a node object as parameter
    nodes.push(newNode);  // Add the new node to our nodes array
    updateGraph();  // Redraw the entire graph with the new node
  }

  // Function to add a new link between existing nodes
  function addLink(newLink) {  // Takes a link object as parameter
    links.push(newLink);  // Add the new link to our links array
    updateGraph();  // Redraw the entire graph with the new link
  }

  // Function to remove a node and all its connections
  function removeNode(nodeId) {  // Takes the ID of the node to remove
    nodes = nodes.filter(n => n.id !== nodeId);  // Remove the node from the nodes array
    links = links.filter(l => l.source.id !== nodeId && l.target.id !== nodeId);  // Remove all links connected to this node
    updateGraph();  // Redraw the entire graph without the removed node
  }

  // Function to update the entire graph (redraw everything)
  function updateGraph() {  // Called whenever we need to refresh the visualization
    // Remove old elements
    svg.selectAll('*').remove();  // Remove all existing SVG elements
    
    // Recreate simulation
    simulation.nodes(nodes);  // Update the simulation with the new nodes
    simulation.force('link').links(links);  // Update the simulation with the new links
    
    // Redraw all elements (you would repeat the drawing code here)
    // For brevity, this is simplified - in practice you'd recreate all visual elements
    
    simulation.alpha(1).restart();  // Restart the force simulation with full energy
  }

  // Example usage of the utility functions (commented out):
  // addNode({ id: 'Frank', name: 'Frank Miller', role: 'student', age: 19, department: 'Physics', friends: 10, size: 20, color: '#ff6b6b' });  // Add a new student
  // addLink({ source: 'Frank', target: 'Alice', relationship: 'friends', since: 2023, strength: 0.8, type: 'bidirectional' });  // Add a friendship connection
};

// Execute the sketch - this runs the entire graph visualization
graphSketch2();  // Call the main function to create and display the network graph 