// D3 Network Graph from CSV files
// Assumes D3 v7+ is loaded and HTML contains a div with id="network"

const width = 1000;
const height = 600;

// Utility: parse comma-separated string into trimmed array
function parseArray(str) {
    return str ? str.split(',').map(s => s.trim()) : [];
}

// Load both CSVs and render the graph
Promise.all([
    d3.csv('nodes.csv'),
    d3.csv('edges.csv')
]).then(([nodesRaw, edgesRaw]) => {
    // Parse nodes
    const nodes = nodesRaw.map(d => ({
        id: +d.id,
        name: d.name,
        hex: d.hex,
        hue: +d.hue,
        examples: parseArray(d.examples),
        synonyms: parseArray(d.synonyms)
    }));

    // Parse edges
    const links = edgesRaw.map(d => ({
        source: +d.source,
        target: +d.target,
        type: d.type,
        strength: +d.strength,
        bidirectional: d.bidirectional === 'true',
        synonymName: d.synonymName || null
    }));

    // Main D3 rendering
    renderNetwork(nodes, links);
}).catch(err => {
    d3.select('#network').append('div').style('color','red').text('Error loading CSV files: ' + err);
});

function renderNetwork(nodes, links) {
    // Set up SVG
    const svg = d3.select('#network')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create gradient definitions for each node
    const defs = svg.append('defs');
    nodes.forEach((color, i) => {
        const gradient = defs.append('radialGradient')
            .attr('id', `gradient-${i}`)
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '50%');
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', color.hex)
            .attr('stop-opacity', 1);
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', d3.color(color.hex).darker(1))
            .attr('stop-opacity', 0.8);
    });

    // Add arrowhead marker for synonym links
    defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#ffff00')
        .style('filter', 'drop-shadow(0 0 2px #ffff00)');

    // Tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip');

    let showConnections = true;

    // D3 force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(80).strength(d => d.strength))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(25));

    // Draw links
    const linkElements = svg.selectAll('.link')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke', d => d.type === 'synonym' ? 'rgba(255,255,0,0.4)' : 'rgba(255,255,255,0.2)')
        .attr('stroke-width', d => d.type === 'synonym' ? 3 : d.strength * 4)
        .attr('stroke-dasharray', d => d.type === 'synonym' ? '8,4' : 'none')
        .style('opacity', d => d.type === 'synonym' ? 0.6 : d.strength * 0.4);

    // Apply arrowheads to synonym links
    linkElements.filter(d => d.type === 'synonym')
        .attr('marker-end', 'url(#arrowhead)');

    // Create bubble groups for each link
    const bubbleGroups = svg.selectAll('.bubble-group')
        .data(links)
        .enter()
        .append('g')
        .attr('class', 'bubble-group');

    // Add bubbles to each link
    bubbleGroups.each(function(d, i) {
        const group = d3.select(this);
        const numBubbles = d.type === 'synonym' ? 3 : 2;
        for (let j = 0; j < numBubbles; j++) {
            group.append('circle')
                .attr('class', 'bubble')
                .attr('r', d.type === 'synonym' ? 4 : 3)
                .attr('fill', d.type === 'synonym' ? '#ffff00' : '#ffffff')
                .attr('opacity', d.type === 'synonym' ? 0.9 : 0.7)
                .style('filter', d.type === 'synonym' ? 'drop-shadow(0 0 6px #ffff00)' : 'drop-shadow(0 0 4px rgba(255,255,255,0.5))')
                .style('animation-delay', `${j * 0.8}s`);
        }
    });

    // Draw nodes
    const nodeElements = svg.selectAll('.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    nodeElements.append('circle')
        .attr('r', 20)
        .attr('fill', (d, i) => `url(#gradient-${i})`)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))')
        .on('mouseover', function(event, d) {
            d3.select(this).transition().duration(200).attr('r', 25);
            tooltip.transition().duration(200).style('opacity', 1);
            tooltip.html(`
                <strong>${d.name}</strong><br>
                Hex: ${d.hex}<br>
                Hue: ${d.hue}°<br>
                <strong>Synonyms:</strong> ${d.synonyms.join(', ')}<br>
                <strong>Examples:</strong> ${d.examples.join(', ')}
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this).transition().duration(200).attr('r', 20);
            tooltip.transition().duration(200).style('opacity', 0);
        });

    nodeElements.append('text')
        .text(d => d.name)
        .attr('text-anchor', 'middle')
        .attr('dy', 35)
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)');

    // Simulation tick
    simulation.on('tick', () => {
        linkElements
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        nodeElements
            .attr('transform', d => `translate(${d.x},${d.y})`);
        bubbleGroups.attr('transform', d => `translate(0,0)`);
    });

    // Bubble animation
    function animateBubbles() {
        bubbleGroups.selectAll('.bubble')
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attrTween('transform', function(d) {
                const link = d3.select(this.parentNode).datum();
                return function(t) {
                    if (!link.source.x || !link.target.x) return '';
                    const x1 = link.source.x;
                    const y1 = link.source.y;
                    const x2 = link.target.x;
                    const y2 = link.target.y;
                    let progress = t;
                    if (link.type === 'hue') {
                        progress = t < 0.5 ? t * 2 : (1 - t) * 2;
                    }
                    const x = x1 + (x2 - x1) * progress;
                    const y = y1 + (y2 - y1) * progress;
                    return `translate(${x}, ${y})`;
                };
            })
            .on('end', function() {
                d3.select(this).attr('transform', 'translate(0,0)');
            });
    }
    // Initial and interval animation
    animateBubbles();
    window._bubbleInterval = setInterval(animateBubbles, 2200);

    // Controls
    window.restartSimulation = function() {
        simulation.alpha(1).restart();
    };
    window.toggleConnections = function() {
        showConnections = !showConnections;
        linkElements.style('opacity', showConnections ? 
            d => d.type === 'synonym' ? 0.6 : d.strength * 0.4 : 0);
        bubbleGroups.style('opacity', showConnections ? 1 : 0);
    };
    window.randomizeColors = function() {
        nodes.forEach(node => {
            node.x = Math.random() * width;
            node.y = Math.random() * height;
        });
        simulation.alpha(1).restart();
    };
    window.startBubbleAnimation = function() {
        if (window._bubbleInterval) clearInterval(window._bubbleInterval);
        animateBubbles();
        window._bubbleInterval = setInterval(animateBubbles, 2200);
    };

    // Drag handlers
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
