// Cellular Painting Network Visualization
// Using D3.js to create a cell-styled network from CSV data

// Configuration
const config = {
    width: Math.min(window.innerWidth * 0.9, 1200),
    height: Math.min(window.innerHeight * 0.8, 800),
    node: {
        baseSize: 25,
        maxSize: 80,
        minSize: 15,
        opacity: 0.9,
        strokeWidth: 1.5,
        strokeColor: '#ffffff',
        highlightColor: '#ffffff',
        highlightWidth: 3,
        hoverSizeMultiplier: 1.3,
        nucleusSize: 0.25,  // Size of nucleus relative to cell size
        membraneThickness: 1.2  // Thickness of cell membrane
    },
    link: {
        strokeWidth: 1.5,
        strokeColor: 'rgba(255, 255, 255, 0.15)',
        highlightColor: '#ff6b9f',
        highlightWidth: 2.5,
        dashArray: '3, 3',
        dashAnimateSpeed: 0.5
    },
    force: {
        charge: -800,
        linkDistance: d => 100 + (1 - (d.weight || 0.5)) * 200,  // Closer nodes have stronger connections
        linkStrength: d => (d.weight || 0.5) * 0.8,  // Stronger weight = stronger attraction
        collisionRadius: d => d.size * 1.8,
        center: {
            x: 0.5,  // Center of the SVG
            y: 0.5   // Center of the SVG
        },
        x: {
            strength: 0.1
        },
        y: {
            strength: 0.1
        }
    },
    animation: {
        duration: 1000,
        delay: 50
    }
};

// Color scales for different categories
const colorScales = {
    'Happiness': d3.scaleLinear().domain([0, 1]).range(['#FFD700', '#FFA500']),
    'Sadness': d3.scaleLinear().domain([0, 1]).range(['#1E90FF', '#00008B']),
    'Anger': d3.scaleLinear().domain([0, 1]).range(['#FF4500', '#8B0000']),
    'Fear': d3.scaleLinear().domain([0, 1]).range(['#9932CC', '#4B0082']),
    'Surprise': d3.scaleLinear().domain([0, 1]).range(['#4ECDC4', '#45B7D1']),
    'Disgust': d3.scaleLinear().domain([0, 1]).range(['#32CD32', '#006400']),
    'Trust': d3.scaleLinear().domain([0, 1]).range(['#00CED1', '#008B8B']),
    'Anticipation': d3.scaleLinear().domain([0, 1]).range(['#FFA500', '#FF8C00']),
    'default': d3.scaleLinear().domain([0, 1]).range(['#888888', '#333333'])
};

// Load and process data
Promise.all([
    d3.csv('nodes.csv'),
    d3.csv('edges.csv')
]).then(([nodesData, linksData]) => {
    console.log('Loaded nodes:', nodesData.length, 'links:', linksData.length);
    
    // Process nodes with proper type conversion
    const nodes = nodesData.map(d => {
        const intensity = parseFloat(d.intensity) || 0.5;
        const group = d.group || d.category || 'default';
        const color = d.color || getNodeColor({...d, group, intensity});
        
        return {
            ...d,
            id: d.id,
            label: d.label || d.id,
            group: group,
            intensity: intensity,
            size: intensity * (config.node.maxSize - config.node.minSize) + config.node.minSize,
            color: color,
            x: Math.random() * config.width,
            y: Math.random() * config.height,
            vx: 0,
            vy: 0
        };
    });

    // Create a map for quick node lookup
    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    // Process links with proper source/target resolution
    const links = linksData
        .filter(d => nodeMap.has(d.source) && nodeMap.has(d.target)) // Only include links where both nodes exist
        .map(d => ({
            ...d,
            source: nodeMap.get(d.source),
            target: nodeMap.get(d.target),
            weight: parseFloat(d.weight) || 0.5,
            type: d.relationship || 'related_to',
            color: d.color || '#999999'
        }));

    console.log('Processed nodes:', nodes.length, 'filtered links:', links.length);
    
    // Initialize the visualization
    initVisualization(nodes, links);
    
    // Add window resize handler
    window.addEventListener('resize', debounce(() => {
        const newWidth = Math.min(window.innerWidth * 0.9, 1200);
        const newHeight = Math.min(window.innerHeight * 0.8, 800);
        
        config.width = newWidth;
        config.height = newHeight;
        
        d3.select('svg')
            .attr('width', newWidth)
            .attr('height', newHeight)
            .attr('viewBox', `0 0 ${newWidth} ${newHeight}`);
            
        simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
        simulation.alpha(0.5).restart();
    }, 250));
    
}).catch(error => {
    console.error('Error loading CSV files:', error);
    // Show error to user
    document.getElementById('network').innerHTML = `
        <div style="color: #ff6b6b; padding: 20px; text-align: center;">
            <h3>Error loading data</h3>
            <p>${error.message}</p>
            <p>Please check the console for details.</p>
        </div>`;
});

// Debounce function for window resize
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Helper function to get node color based on category and intensity
function getNodeColor(node) {
    const scale = colorScales[node.group] || colorScales.default;
    return scale(node.intensity || 0.5);
}

// Initialize the visualization
function initVisualization(nodes, links) {
    // Clear any existing content and add loading state
    const container = d3.select('#network').html('<div class="loading">Initializing cellular network...</div>');
    
    // Create SVG container with responsive attributes
    const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${config.width} ${config.height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('background-color', 'rgba(10, 10, 26, 0.2)')
        .style('border-radius', '10px');
    
    // Add defs for filters and gradients
    const defs = svg.append('defs');
       
    // Add glow filter for nodes
    const glowFilter = defs.append('filter')
        .attr('id', 'node-glow')
        .attr('width', '200%')
        .attr('height', '200%')
        .attr('x', '-50%')
        .attr('y', '-50%');
        
    glowFilter.append('feGaussianBlur')
        .attr('stdDeviation', '3')
        .attr('result', 'coloredBlur');
        
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode')
        .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');
    
    // Add a subtle gradient for links
    const linkGradient = defs.append('linearGradient')
        .attr('id', 'link-gradient')
        .attr('gradientUnits', 'userSpaceOnUse');
        
    linkGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'rgba(255, 255, 255, 0.8)');
        
    linkGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'rgba(200, 200, 255, 0.2)');

    // Create force simulation with multiple forces
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links)
            .id(d => d.id)
            .distance(d => {
                // Adjust distance based on weight and relationship type
                let baseDistance = 100 + (1 - (d.weight || 0.5)) * 200;
                return baseDistance * (d.type === 'synonym' ? 0.8 : 1);
            })
            .strength(d => (d.weight || 0.5) * 0.8)
        )
        .force('charge', d3.forceManyBody()
            .strength(d => -800 * (d.size / 50))
            .distanceMax(400)
        )
        .force('center', d3.forceCenter(
            config.width * config.force.center.x, 
            config.height * config.force.center.y
        ))
        .force('collision', d3.forceCollide()
            .radius(d => d.size * 1.8)
            .strength(0.8)
        )
        .force('x', d3.forceX(config.width / 2).strength(0.1))
        .force('y', d3.forceY(config.height / 2).strength(0.1))
        .alphaDecay(0.05)
        .velocityDecay(0.4)
        .on('tick', ticked);

    // Create links with gradient and animation
    const link = svg.append('g')
        .selectAll('.link')
        .data(links)
        .enter().append('g')
        .attr('class', 'link');
        
    // Main link line
    link.append('line')
        .attr('class', 'link-line')
        .attr('stroke', d => d.color || config.link.strokeColor)
        .attr('stroke-width', d => d.weight * config.link.strokeWidth)
        .attr('stroke-opacity', 0.6)
        .attr('stroke-dasharray', config.link.dashArray)
        .attr('marker-end', d => d.type === 'intensifies' ? 'url(#arrowhead)' : '');
        
    // Animated dash for visual effect
    link.append('line')
        .attr('class', 'link-dash')
        .attr('stroke', 'white')
        .attr('stroke-width', d => Math.max(1, d.weight * config.link.strokeWidth * 0.5))
        .attr('stroke-dasharray', '5, 5')
        .attr('stroke-dashoffset', 10)
        .style('opacity', 0.7)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)
        .on('end', function() {
            d3.select(this)
                .attr('stroke-dashoffset', 10)
                .transition()
                .duration(2000)
                .ease(d3.easeLinear)
                .attr('stroke-dashoffset', 0);
        });
        
    // Add arrowhead marker for directed relationships
    const marker = defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto');
        
    marker.append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', 'rgba(255, 255, 255, 0.7)');

    // Create node groups with enhanced visual effects
    const node = svg.append('g')
        .selectAll('.node')
        .data(nodes)
        .enter().append('g')
        .attr('class', 'node')
        .attr('data-group', d => d.group)
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    // Add cell-like circles to nodes with enhanced effects
    node.each(function(d) {
        const nodeGroup = d3.select(this);
        const size = d.size;
        const nucleusSize = size * config.node.nucleusSize;
        const membraneThickness = config.node.membraneThickness;
        
        // Create outer glow
        nodeGroup.append('circle')
            .attr('class', 'node-glow')
            .attr('r', size * 1.3)
            .attr('fill', d.color)
            .attr('opacity', 0.2)
            .attr('filter', 'url(#node-glow)');
        
        // Create cell membrane (outer ring with gradient)
        const membraneGradient = defs.append('radialGradient')
            .attr('id', `membrane-${d.id}`)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', size * 1.1);
            
        membraneGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', d3.color(d.color).brighter(0.8));
            
        membraneGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', d3.color(d.color).darker(0.5));
        
        nodeGroup.append('circle')
            .attr('class', 'cell-membrane')
            .attr('r', size * 1.1)
            .attr('fill', 'none')
            .attr('stroke', `url(#membrane-${d.id})`)
            .attr('stroke-width', membraneThickness)
            .attr('opacity', 0.8);
            
        // Create cell body with gradient
        const cellGradient = defs.append('radialGradient')
            .attr('id', `cell-${d.id}`)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', size);
            
        cellGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', d3.color(d.color).brighter(0.5));
            
        cellGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', d3.color(d.color).darker(0.3));
            
        nodeGroup.append('circle')
            .attr('class', 'cell-body')
            .attr('r', size)
            .attr('fill', `url(#cell-${d.id})`)
            .attr('opacity', config.node.opacity)
            .attr('stroke', d3.color(d.color).brighter(0.8))
            .attr('stroke-width', config.node.strokeWidth)
            .attr('filter', 'url(#node-glow)');
            
        // Add cell nucleus with gradient
        const nucleusGradient = defs.append('radialGradient')
            .attr('id', `nucleus-${d.id}`)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', nucleusSize);
            
        nucleusGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', d3.color(d.color).brighter(1.5));
            
        nucleusGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', d3.color(d.color).brighter(0.5));
            
        nodeGroup.append('circle')
            .attr('class', 'cell-nucleus')
            .attr('r', nucleusSize)
            .attr('fill', `url(#nucleus-${d.id})`)
            .attr('opacity', 0.95)
            .attr('stroke', 'rgba(255, 255, 255, 0.8)')
            .attr('stroke-width', 0.5);
            
        // Add inner glow to nucleus
        nodeGroup.append('circle')
            .attr('class', 'nucleus-glow')
            .attr('r', nucleusSize * 0.7)
            .attr('fill', 'white')
            .attr('opacity', 0.3)
            .attr('filter', 'url(#node-glow)');
            
        // Add text label with better styling
        nodeGroup.append('text')
            .attr('class', 'node-label')
            .text(d => d.label)
            .attr('text-anchor', 'middle')
            .attr('dy', 4)
            .attr('fill', '#ffffff')
            .attr('font-size', Math.max(10, size * 0.25))
            .attr('font-family', 'Poppins, Arial, sans-serif')
            .attr('font-weight', '500')
            .attr('paint-order', 'stroke')
            .attr('stroke', 'rgba(0, 0, 0, 0.5)')
            .attr('stroke-width', 3)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .style('pointer-events', 'none')
            .style('user-select', 'none');
            
        // Add small particles around the cell
        const particleCount = Math.floor(size / 2);
        const particleGroup = nodeGroup.append('g')
            .attr('class', 'cell-particles');
            
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = size * (0.8 + Math.random() * 0.4);
            const sizeParticle = 0.5 + Math.random() * 1.5;
            
            particleGroup.append('circle')
                .attr('class', 'cell-particle')
                .attr('cx', Math.cos(angle) * distance)
                .attr('cy', Math.sin(angle) * distance)
                .attr('r', sizeParticle)
                .attr('fill', 'rgba(255, 255, 255, 0.7)')
                .attr('opacity', 0.7);
        }
    });
    
    // Add animation to particles
    function animateParticles() {
        d3.selectAll('.cell-particle')
            .transition()
            .duration(2000 + Math.random() * 1000)
            .attr('transform', function() {
                const angle = Math.random() * Math.PI * 2;
                const distance = 2 + Math.random() * 3;
                return `translate(${Math.cos(angle) * distance}, ${Math.sin(angle) * distance})`;
            })
            .on('end', function() {
                d3.select(this)
                    .transition()
                    .duration(2000 + Math.random() * 1000)
                    .attr('transform', 'translate(0, 0)')
                    .on('end', animateParticles);
            });
    }
    
    // Start particle animation
    setTimeout(animateParticles, 1000);

    // Update positions on simulation tick
    function ticked() {
        // Update link positions
        link.selectAll('.link-line, .link-dash')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        // Update node positions
        node.attr('transform', d => `translate(${d.x},${d.y})`);
        
        // Update gradient positions for nodes
        node.each(function(d) {
            d3.select(`#cell-${d.id}`)
                .attr('cx', d.x)
                .attr('cy', d.y);
                
            d3.select(`#nucleus-${d.id}`)
                .attr('cx', d.x)
                .attr('cy', d.y);
                
            d3.select(`#membrane-${d.id}`)
                .attr('cx', d.x)
                .attr('cy', d.y);
        });
    }

    // Add interactivity with enhanced effects
    node.on('mouseover', function(event, d) {
        const currentSize = d.size;
        const hoverSize = currentSize * config.node.hoverSizeMultiplier;
        
        // Scale up the node
        d3.select(this).select('.cell-body')
            .transition()
            .duration(200)
            .attr('r', hoverSize);
            
        d3.select(this).select('.cell-membrane')
            .transition()
            .duration(200)
            .attr('r', hoverSize * 1.1);
            
        // Increase glow
        d3.select(this).select('.node-glow')
            .transition()
            .duration(200)
            .attr('r', hoverSize * 1.5)
            .attr('opacity', 0.4);
            
        // Highlight connected links
        link.selectAll('.link-line')
            .attr('stroke-opacity', l => (l.source === d || l.target === d) ? 1 : 0.2)
            .attr('stroke-width', l => (l.source === d || l.target === d) 
                ? config.link.highlightWidth * (l.weight || 1) 
                : config.link.strokeWidth * (l.weight || 1));
                
        // Show tooltip or info panel
        showNodeInfo(d);
    });
    
    node.on('mouseout', function(event, d) {
        // Reset node size
        d3.select(this).select('.cell-body')
            .transition()
            .duration(200)
            .attr('r', d.size);
            
        d3.select(this).select('.cell-membrane')
            .transition()
            .duration(200)
            .attr('r', d.size * 1.1);
            
        // Reset glow
        d3.select(this).select('.node-glow')
            .transition()
            .duration(200)
            .attr('r', d.size * 1.3)
            .attr('opacity', 0.2);
            
        // Reset links
        link.selectAll('.link-line')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => config.link.strokeWidth * (d.weight || 1));
            
        // Hide tooltip
        hideNodeInfo();
    });
    
    // Handle node click
    node.on('click', function(event, d) {
        // Prevent click from propagating to document (which would close dropdowns)
        event.stopPropagation();
        
        // Toggle node selection
        const isSelected = d3.select(this).classed('selected');
        
        // Deselect all nodes first
        node.classed('selected', false);
        
        if (!isSelected) {
            // Select this node
            d3.select(this).classed('selected', true);
            
            // Show detailed info
            showNodeInfo(d, true);
        } else {
            // Hide detailed info if clicking the same node
            hideNodeInfo();
        }
    });
    
    // Show node information panel
    function showNodeInfo(nodeData, isClick = false) {
        const infoPanel = d3.select('.info-panel');
        
        if (!infoPanel.empty()) {
            // Update existing panel
            infoPanel.transition().duration(200).style('opacity', 1);
            
            d3.select('.node-title').text(nodeData.label);
            d3.select('.node-group').text(nodeData.group);
            d3.select('.node-intensity').text(`Intensity: ${(nodeData.intensity * 100).toFixed(0)}%`);
            d3.select('.node-description').text(nodeData.description || 'No description available.');
            
            // Update connections list
            const connections = links
                .filter(l => l.source === nodeData || l.target === nodeData)
                .map(l => ({
                    node: l.source === nodeData ? l.target : l.source,
                    type: l.type,
                    weight: l.weight
                }));
                
            const connectionList = d3.select('.connections-list').selectAll('.connection')
                .data(connections, d => d.node.id);
                
            // Remove old connections
            connectionList.exit().remove();
            
            // Add new connections
            const newConnections = connectionList.enter()
                .append('div')
                .attr('class', 'connection');
                
            newConnections.append('div')
                .attr('class', 'connection-label')
                .text(d => d.node.label);
                
            newConnections.append('div')
                .attr('class', 'connection-type')
                .text(d => d.type);
                
            newConnections.append('div')
                .attr('class', 'connection-strength')
                .style('width', d => `${d.weight * 100}%`);
                
            // Update all connections
            connectionList.select('.connection-label')
                .text(d => d.node.label);
                
            connectionList.select('.connection-type')
                .text(d => d.type);
                
            connectionList.select('.connection-strength')
                .style('width', d => `${d.weight * 100}%`);
                
            // If this was a click, show the panel if it's hidden
            if (isClick) {
                infoPanel.style('display', 'block')
                    .style('right', '20px');
            }
        }
    }
    
    // Hide node information panel
    function hideNodeInfo() {
        const infoPanel = d3.select('.info-panel');
        if (!infoPanel.empty() && !d3.event?.target.closest('.info-panel')) {
            infoPanel.style('right', '-350px');
            
            // After transition completes, hide it completely
            setTimeout(() => {
                infoPanel.style('display', 'none');
            }, 300);
        }
    }
    
    // Close button for info panel
    d3.select('body').on('click', '.close-panel', function() {
        d3.select('.info-panel').style('right', '-350px');
        
        // After transition completes, hide it completely and remove selection
        setTimeout(() => {
            d3.select('.info-panel').style('display', 'none');
            node.classed('selected', false);
        }, 300);
    });
    
    // Click outside to close panel
    d3.select('body').on('click', function(event) {
        if (!d3.event?.target.closest('.node') && !d3.event?.target.closest('.info-panel')) {
            hideNodeInfo();
        }
    });
    
    // Prevent clicks inside the panel from closing it
    d3.select('.info-panel').on('click', function() {
        d3.event.stopPropagation();
    });

    // Drag functions
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
}

// Add controls
function addControls() {
    d3.select('body').append('div')
        .attr('class', 'controls')
        .html(`
            <button onclick="restartSimulation()">Restart Animation</button>
            <button onclick="toggleLabels()">Toggle Labels</button>
            <button onclick="toggleLinks()">Toggle Links</button>
        `);
}

// Global functions for controls
function restartSimulation() {
    // Implementation for restarting the simulation
    console.log('Restarting simulation...');
}

function toggleLabels() {
    // Implementation for toggling labels
    console.log('Toggling labels...');
}

function toggleLinks() {
    // Implementation for toggling links
    console.log('Toggling links...');
}

// Initialize controls when the DOM is loaded
document.addEventListener('DOMContentLoaded', addControls);
