// graph-from-csv.js - Emotion Network Graph with D3.js
// This script visualizes emotion relationships from CSV data

var graphSketch3 = function() {
    // ============================================================================
    // CANVAS DIMENSIONS
    // ============================================================================
    const width = 1000;  // Increased width for better visualization
    const height = 700;  // Increased height for better visualization
  
    // ============================================================================
    // CSV DATA LOADING
    // ============================================================================
  
    // Load both CSV files and create the graph when both are loaded
    Promise.all([
      d3.csv('nodes.csv'),  // Load the nodes data from CSV
      d3.csv('edges.csv')   // Load the edges data from CSV
    ]).then(function([nodesData, edgesData]) {
      console.log('Loaded nodes:', nodesData);  // Log the loaded nodes data
      console.log('Loaded edges:', edgesData);  // Log the loaded edges data
  
      // Process the nodes data
      const nodes = nodesData.map(d => ({
        id: d.id,
        label: d.label,
        category: d.category,
        group: d.group,
        valence: d.valence,
        arousal: d.arousal,
        intensity: +d.intensity,  // Convert to number
        color: d.color,
        size: 10 + (d.intensity * 20)  // Scale size by intensity
      }));

      // Process the edges data
      const links = edgesData.map(d => ({
        source: d.source,
        target: d.target,
        relationship: d.relationship,
        weight: +d.weight,  // Convert to number
        directed: d.directed === 'TRUE',  // Convert to boolean
        color: d.color
      }));

      // Create a map of node IDs to their data for quick lookup
      const nodeMap = new Map(nodes.map(node => [node.id, node]));
  
      createGraph(nodes, links);  // Create the graph with the processed data
    }).catch(function(error) {
      console.error('Error loading CSV files:', error);  // Log any errors
      // Create a fallback graph with sample data if CSV loading fails
      const fallbackNodes = [
        { id: 'Error', label: 'CSV Load Error', category: 'error', group: 'Error', valence: 0, arousal: 0, intensity: 0, color: '#ff0000', size: 20 }
      ];
      const fallbackLinks = [];
      createGraph(fallbackNodes, fallbackLinks);
    });
  
    // ============================================================================
    // GRAPH CREATION FUNCTION
    // ============================================================================
  
    function createGraph(nodes, links) {
      // ============================================================================
      // SVG SETUP WITH ZOOM BEHAVIOR
      // ============================================================================
  
      // Create the main SVG container for our graph
      const svg = d3.select('#d3-container-3')  // Select the HTML element with id 'd3-container-3'
        .append('svg')  // Create a new SVG element inside that container
        .attr('width', width)  // Set the width of the SVG to our defined width
        .attr('height', height)  // Set the height of the SVG to our defined height
        .style('background', '#f0f0f0');  // Set a light gray background color
  
      // Create a group that will contain all graph elements and can be transformed
      const g = svg.append('g');
  
      // Add arrow marker for directed edges - this creates the arrow shape that will appear at the end of directed links
      g.append('defs').append('marker')  // Create a marker definition in the SVG defs section
        .attr('id', 'arrowhead-3')  // Give the marker a unique ID so we can reference it later
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
      // ZOOM BEHAVIOR SETUP
      // ============================================================================
  
      // Create zoom behavior with constraints
      const zoom = d3.zoom()
        .scaleExtent([0.1, 4])  // Limit zoom scale between 0.1x and 4x
        .on('zoom', (event) => {
          // Apply the zoom transformation to the main group
          g.attr('transform', event.transform);
        });
  
      // Apply zoom behavior to the SVG
      svg.call(zoom);
  
      // Add zoom controls info
      svg.append('text')
        .attr('x', 10)
        .attr('y', 20)
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text('Use mouse wheel to zoom, drag to pan');
  
      // ============================================================================
      // ENHANCED FORCE SIMULATION
      // ============================================================================
  
      // Create the force simulation
      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links)
          .id(d => d.id)
          .distance(link => {
            // Adjust distance based on relationship weight
            const baseDistance = 150;
            const weight = link.weight || 0.5;
            return baseDistance * (1.5 - weight); // Stronger connections are closer
          }))
        .force('charge', d3.forceManyBody()
          .strength(node => {
            // Adjust repulsion based on node properties
            let strength = -100;
            if (node.category === 'Primary') strength = -200;
            if (node.category === 'Secondary') strength = -150;
            return strength * (0.5 + node.intensity);
          }))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(node => node.size + 5))
        .force('x', d3.forceX(width / 2).strength(0.05))
        .force('y', d3.forceY(height / 2).strength(0.05));
  
      // ============================================================================
      // ENHANCED LINK VISUALIZATION
      // ============================================================================
  
      // Create the visual links (lines) between nodes
      const link = g.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke', d => d.color || '#888')
        .attr('stroke-width', d => (d.weight || 0.5) * 3) // Scale width by weight
        .attr('stroke-opacity', 0.6)
        .attr('marker-end', d => d.directed ? 'url(#arrowhead-3)' : null);
  
      // ============================================================================
      // ENHANCED NODE VISUALIZATION
      // ============================================================================
  
      // Create the visual nodes (circles)
      const node = g.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', d => d.size)
        .attr('fill', d => d.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .call(drag(simulation));
  
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
        console.log('Clicked on:', d.label, 'Category:', d.category, 'Group:', d.group);  // Log node info to console
      });
  
      // ============================================================================
      // ENHANCED LABELS
      // ============================================================================
  
      // Create text labels for each node
      const label = g.append('g')
        .selectAll('text')
        .data(nodes)
        .enter().append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('font-size', d => 10 + (d.intensity * 4))
        .attr('fill', '#333')
        .text(d => d.label); 
  
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
  
      function showTooltip(event, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', 1);
        
        tooltip.html(`
          <div style="font-size:14px; line-height:1.4;">
            <div style="font-weight:bold; margin-bottom:5px; color:${d.color}">${d.label}</div>
            <div><strong>Category:</strong> ${d.category}</div>
            <div><strong>Valence:</strong> ${d.valence}</div>
            <div><strong>Arousal:</strong> ${d.arousal}</div>
            <div><strong>Intensity:</strong> ${d.intensity.toFixed(2)}</div>
            <div><strong>Group:</strong> ${d.group}</div>
          </div>
        `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 15) + 'px');
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
    }
  };
  
  // Execute the sketch
  graphSketch3();