/**
 * Relational Structures - Network Visualization
 * This script handles the interactive network diagram for the Relational Structures page.
 */

// Configuration
const CONFIG = {
    width: 1000,
    height: 700,
    nodeRadius: 15,
    linkDistance: 150,
    chargeStrength: -500,
    colorScheme: d3.schemeTableau10,
    simulationAlpha: 0.5,
    simulationAlphaDecay: 0.05,
    simulationAlphaMin: 0.1
};

// State
let nodes = [];
let links = [];
let simulation;
let showLabels = true;
let showLinks = true;

// Initialize the visualization
document.addEventListener('DOMContentLoaded', function() {
    // Load data and initialize the visualization
    loadData().then(() => {
        initializeVisualization();
        setupEventListeners();
    }).catch(error => {
        console.error('Error initializing visualization:', error);
        showError('Failed to load the network visualization. Please try again later.');
    });
});

/**
 * Load data from CSV files
 */
async function loadData() {
    try {
        // Load nodes data
        const nodesResponse = await fetch('Relational Structures/nodes.csv');
        const nodesText = await nodesResponse.text();
        nodes = d3.csvParse(nodesText, d => ({
            id: +d.id,
            name: d.name,
            hex: d.hex,
            hue: +d.hue,
            examples: d.examples ? d.examples.split(',').map(s => s.trim()) : [],
            synonyms: d.synonyms ? d.synonyms.split(',').map(s => s.trim()) : []
        }));

        // Load edges data
        const edgesResponse = await fetch('Relational Structures/edges.csv');
        const edgesText = await edgesResponse.text();
        links = d3.csvParse(edgesText, d => ({
            source: +d.source,
            target: +d.target,
            type: d.type,
            strength: +d.strength,
            bidirectional: d.bidirectional === 'true',
            synonymName: d.synonymName || null
        }));
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

/**
 * Initialize the visualization
 */
function initializeVisualization() {
    // Create SVG container
    const svg = d3.select('#network-diagram')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '600px')
        .attr('viewBox', `0 0 ${CONFIG.width} ${CONFIG.height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            container.attr('transform', event.transform);
        });

    svg.call(zoom);

    // Create container for zoomable elements
    const container = svg.append('g');

    // Create arrow markers for links
    container.append('defs').selectAll('marker')
        .data(['end'])
        .enter().append('marker')
        .attr('id', d => `arrow-${d}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#999');

    // Create links
    const link = container.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('class', 'link')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('marker-end', d => d.bidirectional ? '' : 'url(#arrow-end)');

    // Create nodes
    const node = container.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('g')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    // Add circles to nodes
    node.append('circle')
        .attr('r', CONFIG.nodeRadius)
        .attr('fill', d => d.hex || '#4b5563')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

    // Add labels to nodes
    const label = node.append('text')
        .attr('class', 'node-label')
        .attr('dy', -20)
        .attr('text-anchor', 'middle')
        .text(d => d.name)
        .style('font-size', '12px')
        .style('fill', '#333')
        .style('pointer-events', 'none')
        .style('user-select', 'none');

    // Create simulation
    simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(CONFIG.linkDistance))
        .force('charge', d3.forceManyBody().strength(CONFIG.chargeStrength))
        .force('center', d3.forceCenter(CONFIG.width / 2, CONFIG.height / 2))
        .force('collision', d3.forceCollide().radius(d => CONFIG.nodeRadius + 5))
        .on('tick', ticked);

    // Tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '10px')
        .style('border-radius', '5px')
        .style('pointer-events', 'none')
        .style('z-index', '1000');

    // Add hover effects
    node.on('mouseover', function(event, d) {
        d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', CONFIG.nodeRadius * 1.5);

        // Highlight connected links
        link.attr('stroke-opacity', l => {
            const isConnected = l.source.id === d.id || l.target.id === d.id;
            return isConnected ? 1 : 0.1;
        });

        // Show tooltip
        tooltip.transition()
            .duration(200)
            .style('opacity', 0.9);
            
        tooltip.html(`
            <div><strong>${d.name}</strong></div>
            <div>Hex: ${d.hex}</div>
            <div>Hue: ${d.hue}°</div>
            ${d.examples.length ? `<div>Examples: ${d.examples.join(', ')}</div>` : ''}
            ${d.synonyms.length ? `<div>Synonyms: ${d.synonyms.join(', ')}</div>` : ''}
        `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    });

    node.on('mousemove', function(event) {
        tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    });

    node.on('mouseout', function() {
        d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', CONFIG.nodeRadius);

        // Reset link opacity
        link.attr('stroke-opacity', 0.6);

        // Hide tooltip
        tooltip.transition()
            .duration(200)
            .style('opacity', 0);
    });

    // Update positions on each tick
    function ticked() {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node
            .attr('transform', d => `translate(${d.x},${d.y})`);
    }

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

/**
 * Set up event listeners for UI controls
 */
function setupEventListeners() {
    // Reset view button
    document.getElementById('reset-view').addEventListener('click', resetView);
    
    // Toggle labels button
    document.getElementById('toggle-labels').addEventListener('click', toggleLabels);
    
    // Toggle links button
    document.getElementById('toggle-links').addEventListener('click', toggleLinks);
}

/**
 * Reset the view to initial state
 */
function resetView() {
    // Reset the simulation
    simulation.alpha(1).restart();
    
    // Reset node positions
    nodes.forEach(node => {
        node.fx = null;
        node.fy = null;
    });
    
    // Re-center the view
    d3.select('svg')
        .transition()
        .duration(1000)
        .call(d3.zoom().transform, d3.zoomIdentity);
}

/**
 * Toggle node labels visibility
 */
function toggleLabels() {
    showLabels = !showLabels;
    d3.selectAll('.node-label')
        .style('opacity', showLabels ? 1 : 0);
}

/**
 * Toggle links visibility
 */
function toggleLinks() {
    showLinks = !showLinks;
    d3.selectAll('.link')
        .style('opacity', showLinks ? 1 : 0);
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '20px';
    errorDiv.style.textAlign = 'center';
    errorDiv.textContent = message;
    
    const container = document.getElementById('network-diagram');
    container.innerHTML = '';
    container.appendChild(errorDiv);
}
