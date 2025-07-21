/**
 * Combined Map Visualization
 * 
 * This script creates a single map canvas that visualizes multiple datasets
 * including bird migration patterns and geographic features.
 */

// Initialize the map with your access token
mapboxgl.accessToken = 'pk.eyJ1Ijoic3JpeWF0aG90YWt1cmEiLCJhIjoiY21kYzhuMG1hMTVrbjJpcHpnZ3Awdjc1dCJ9.bEGwdPmOH5kVaT9RWduC5Q';

// Create the map instance
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-60, 0], // Centered on the Atlantic Ocean
    zoom: 2,
    pitch: 0,
    bearing: 0,
    // Add 3D terrain for a more immersive globe view
    projection: 'globe',
    // Add subtle fog for depth
    fog: {
        color: 'rgb(25, 32, 46)', // Darker blue-gray
        'high-color': 'rgb(17, 24, 39)', // Darker blue-black
        'horizon-blend': 0.1, // More subtle blend
        'space-color': 'rgb(11, 15, 25)', // Dark space color
        'star-intensity': 0.35 // Subtle star effect
    }
});

// Add atmosphere styling
map.on('style.load', () => {
    // Set custom atmosphere
    map.setFog({
        color: 'rgb(25, 32, 46)',
        'high-color': 'rgb(17, 24, 39)',
        'horizon-blend': 0.1,
        'space-color': 'rgb(11, 15, 25)',
        'star-intensity': 0.35
    });
    
    // Add a subtle sky layer
    map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 5, // Reduced intensity
            'sky-atmosphere-color': 'rgba(25, 32, 46, 0.5)',
            'sky-atmosphere-halo-color': 'rgba(17, 24, 39, 0.5)'
        }
    });
});

// Add navigation controls
map.addControl(new mapboxgl.NavigationControl(), 'top-right');
map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
map.addControl(new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left');

// Store layer visibility state
const layerVisibility = {
    birds: true,
    features: true
};

// Color palettes
const speciesColors = {};
const colorPalette = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
    '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
];

// Load and process data
console.log('Starting to load bird migration data...');

// Show loading message
const loadingEl = document.getElementById('loading');
loadingEl.innerHTML = 'Loading bird migration data...<br><small>Please wait, this may take a moment...</small>';

// Function to process bird data
function processBirdData(birdData) {
    console.log('Processing bird data:', birdData);
    
    if (!birdData || !birdData.features || birdData.features.length === 0) {
        console.error('No features found in bird data');
        return;
    }
    
    // Add bird migration source
    if (map.getSource('bird-migration')) {
        map.removeLayer('migration-routes');
        map.removeSource('bird-migration');
    }
    
    try {
        map.addSource('bird-migration', {
            type: 'geojson',
            data: birdData
        });
        
        // Add bird migration layer
        map.addLayer({
            id: 'migration-routes',
            type: 'line',
            source: 'bird-migration',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#ff0000', // Red color for test data
                'line-width': 4,
                'line-opacity': 0.8
            }
        });
        
        // Fit map to the data
        const bounds = new mapboxgl.LngLatBounds();
        birdData.features.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates) {
                feature.geometry.coordinates.forEach(coord => {
                    bounds.extend(coord);
                });
            }
        });
        
        if (!bounds.isEmpty()) {
            map.fitBounds(bounds, { padding: 50 });
        }
        
        console.log('Test data successfully added to map');
        loadingEl.style.display = 'none';
        
    } catch (error) {
        console.error('Error adding test data to map:', error);
        loadingEl.innerHTML = `Error: ${error.message}`;
    }
}

// Simple test data (a line across New York)
const testGeoJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "species": "Test Bird",
                "scientific_name": "Testus birdus",
                "migration_type": "Test",
                "season": "All year",
                "distance_km": 1000,
                "population": "Test",
                "description": "Test migration route"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [-74.0, 40.7],
                    [-73.9, 40.7],
                    [-73.8, 40.8],
                    [-73.7, 40.8],
                    [-73.6, 40.7],
                    [-73.5, 40.7]
                ]
            }
        }
    ]
};

// Load test data first
console.log('Loading test data...');
processBirdData(testGeoJSON);

// First, check if the file exists
fetch('amazon_bird_migration.json', { cache: 'no-cache' })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text().then(text => {
            console.log('Raw response text:', text.substring(0, 200) + '...'); // Log first 200 chars
            return JSON.parse(text);
        });
    })
    .then(birdData => {
        console.log('Parsed bird migration data:', birdData);
        
        if (!birdData) {
            throw new Error('No data received');
        }
        
        if (!birdData.features || !Array.isArray(birdData.features) || birdData.features.length === 0) {
            throw new Error('No features found in bird migration data');
        }
        
        console.log(`Loaded ${birdData.features.length} features`);
        
        // Hide loading indicator
        loadingEl.style.display = 'none';

    // Process bird migration data
    if (birdData && birdData.features) {
        // Get unique species for coloring
        const speciesSet = new Set();
        birdData.features.forEach(feature => {
            if (feature.properties && feature.properties.species) {
                speciesSet.add(feature.properties.species);
            }
        });

        // Assign colors to species
        let colorIndex = 0;
        speciesSet.forEach(species => {
            speciesColors[species] = colorPalette[colorIndex % colorPalette.length];
            colorIndex++;
        });

        // Add bird migration source
        console.log('Adding bird migration source...');
        try {
            map.addSource('bird-migration', {
                type: 'geojson',
                data: birdData
            });
            console.log('Successfully added bird migration source');

            // Add bird migration layer
            console.log('Adding bird migration layer...');
            map.addLayer({
                id: 'migration-routes',
                type: 'line',
                source: 'bird-migration',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': [
                        'match',
                        ['get', 'species'],
                        ...Object.entries(speciesColors).flat(),
                        '#999' // Default color
                    ],
                    'line-width': 3,
                    'line-opacity': 0.8,
                    'line-blur': 0.5
                }
            });
            console.log('Successfully added bird migration layer');
        } catch (error) {
            console.error('Error adding bird migration layer:', error);
            throw error;
        }

        // Add arrow images for direction
        map.loadImage(
            'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Black_triangle.svg/200px-Black_triangle.svg.png',
            (error, image) => {
                if (error) throw error;
                
                map.addImage('arrow', image, { sdf: false });
                
                // Add arrows layer
                map.addLayer({
                    'id': 'migration-arrows',
                    'type': 'symbol',
                    'source': 'bird-migration',
                    'layout': {
                        'symbol-placement': 'line',
                        'symbol-spacing': 50,
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true,
                        'icon-image': 'arrow',
                        'icon-size': 0.5,
                        'icon-rotate': 180
                    },
                    'paint': {
                        'icon-opacity': 0.8
                    }
                });
            }
        );
    }

    // Add interactivity
    setupInteractivity();
    
    // Update legend
    updateLegend();
    
    // Fit map to all data
    setTimeout(() => {
        console.log('Fitting map to data...');
        fitMapToData();
        
        // Force a map repaint
        setTimeout(() => {
            map.resize();
            console.log('Map resize triggered');
        }, 1000);
    }, 500);
    
    // Add debug info
    console.log('Map layers after setup:', map.getStyle().layers);

    })
    .catch(error => {
        console.error('Error loading bird migration data:', error);
        const errorMsg = `Error loading data: ${error.message}. Make sure the file 'amazon_bird_migration.json' exists in the same directory as your HTML file.`;
        console.error(errorMsg);
        
        // Show error in the loading element
        const loadingEl = document.getElementById('loading');
        loadingEl.style.color = 'red';
        loadingEl.innerHTML = `
            <strong>Error loading data:</strong><br>
            ${error.message}<br><br>
            Make sure you're running this on a local server and that the file 'amazon_bird_migration.json' exists in the same directory as your HTML file.
            <br><br>
            <button onclick="window.location.reload()">Try Again</button>
        `;
    });

// Store the current popup reference
let currentPopup = null;
let hoverTimeout = null;

// Setup map interactivity
function setupInteractivity() {
    // Hover effect for migration routes
    map.on('mousemove', 'migration-routes', (e) => {
        // Clear any pending hover timeout
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
        
        // Don't show hover popup if there's already a click popup
        if (document.querySelectorAll('.mapboxgl-popup').length > 0) {
            return;
        }
        
        if (e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties;
            const species = props.species || 'Unknown Species';
            const imagePath = getBirdImagePath(species);
            
            // Create popup content with new styling and image
            const description = `
                <div class="popup-header">
                    <h3 class="popup-title">${species}</h3>
                    <p class="popup-scientific">${props.scientific_name || getScientificName(species) || 'Scientific name not available'}</p>
                </div>
                
                <div class="popup-content">
                    <div class="popup-image-container">
                        <img src="${imagePath}" 
                             alt="${species}" 
                             class="popup-image"
                             onerror="this.onerror=null; this.src='images/birds/default.jpg';">
                    </div>
                    
                    <div class="popup-details">
                        <div class="popup-detail">
                            <strong>Migration Type:</strong> ${props.migration_type || 'N/A'}
                        </div>
                        <div class="popup-detail">
                            <strong>Season:</strong> ${props.season || 'N/A'}
                        </div>
                        <div class="popup-detail">
                            <strong>Distance:</strong> ${props.distance_km ? props.distance_km.toLocaleString() + ' km' : 'N/A'}
                        </div>
                        <div class="popup-detail">
                            <strong>Population Status:</strong> ${props.population || 'N/A'}
                        </div>
                    </div>
                </div>
            `;
            
            // Set a small delay before showing the hover popup
            hoverTimeout = setTimeout(() => {
                // Remove any existing popup
                if (currentPopup) {
                    currentPopup.remove();
                }
                
                // Create and show popup
                currentPopup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false,
                    offset: 15,
                    className: 'bird-popup'
                })
                .setLngLat(e.lngLat)
                .setHTML(description)
                .addTo(map);
            }, 100); // Reduced delay for better UX
            
            // Highlight the hovered feature
            map.setPaintProperty('migration-routes', 'line-width', [
                'case',
                ['==', ['get', 'species'], species],
                4, // Highlight width
                2  // Default width
            ]);
            
            // Change cursor
            map.getCanvas().style.cursor = 'pointer';
        }
    });

    // Reset cursor and highlighting when not hovering
    map.on('mouseleave', 'migration-routes', () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
        
        // Only remove hover popup if it exists and there's no click popup
        if (currentPopup && document.querySelectorAll('.mapboxgl-popup').length <= 1) {
            currentPopup.remove();
            currentPopup = null;
        }
        
        map.getCanvas().style.cursor = '';
        map.setPaintProperty('migration-routes', 'line-width', 2);
    });

    // Click to show persistent popup
    map.on('click', 'migration-routes', (e) => {
        // Clear any pending hover popup
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
        
        // Remove any existing popup
        if (currentPopup) {
            currentPopup.remove();
            currentPopup = null;
        }
        
        if (e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties;
            const species = props.species || 'Unknown Species';
            const imagePath = getBirdImagePath(species);
            
            // Create popup content with new styling and image
            const description = `
                <div class="popup-header">
                    <h3 class="popup-title">${species}</h3>
                    <p class="popup-scientific">${props.scientific_name || getScientificName(species) || 'Scientific name not available'}</p>
                </div>
                
                <div class="popup-content">
                    <div class="popup-image-container">
                        <img src="${imagePath}" 
                             alt="${species}" 
                             class="popup-image"
                             onerror="this.onerror=null; this.src='images/birds/default.jpg';">
                    </div>
                    
                    <div class="popup-details">
                        <div class="popup-detail">
                            <strong>Migration Type:</strong> ${props.migration_type || 'N/A'}
                        </div>
                        <div class="popup-detail">
                            <strong>Season:</strong> ${props.season || 'N/A'}
                        </div>
                        <div class="popup-detail">
                            <strong>Distance:</strong> ${props.distance_km ? props.distance_km.toLocaleString() + ' km' : 'N/A'}
                        </div>
                        <div class="popup-detail">
                            <strong>Population Status:</strong> ${props.population || 'N/A'}
                        </div>
                    </div>
                </div>
                
                ${props.description ? `
                <div class="popup-description">
                    <strong>Description:</strong> ${props.description}
                </div>` : ''}
            `;
            
            // Show persistent popup
            currentPopup = new mapboxgl.Popup({ 
                closeOnClick: false, 
                closeButton: true,
                offset: 15,
                className: 'bird-popup',
                maxWidth: '400px'
            })
            .setLngLat(e.lngLat)
            .setHTML(description)
            .addTo(map);
            
            // Handle popup close event
            currentPopup.on('close', () => {
                if (currentPopup) {
                    currentPopup = null;
                }
            });
        }
    });

    // Close popups when clicking on the map
    map.on('click', (e) => {
        if (!e.features || e.features.length === 0) {
            if (currentPopup) {
                currentPopup.remove();
                currentPopup = null;
            }
        }
    });
}

// Helper function to get scientific name for a bird species
function getScientificName(species) {
    const scientificNames = {
        'Blackpoll Warbler': 'Setophaga striata',
        'Broad-winged Hawk': 'Buteo platypterus',
        'Harpy Eagle': 'Harpia harpyja',
        'Lesser Yellowlegs': 'Tringa flavipes',
        'Orinoco Goose': 'Neochen jubata',
        'Plumbeous Kite': 'Ictinia plumbea',
        'Scissor-tailed Flycatcher': 'Tyrannus forficatus',
        'Solitary Sandpiper': 'Tringa solitaria',
        "Swainson's Hawk": 'Buteo swainsoni',
        'Tennessee Warbler': 'Leiothlypis peregrina'
    };
    return scientificNames[species] || '';
}

// Function to highlight a specific species on the map
function highlightSpecies(species) {
    if (!map.getSource('bird-migration')) return;
    
    // Set filter to show only the selected species
    map.setFilter('migration-routes', ['==', ['get', 'species'], species]);
    
    // Zoom to the extent of the selected species
    const features = map.querySourceFeatures('bird-migration', {
        sourceLayer: 'bird-migration',
        filter: ['==', 'species', species]
    });
    
    if (features && features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        features.forEach(feature => {
            if (feature.geometry.type === 'LineString') {
                feature.geometry.coordinates.forEach(coord => {
                    bounds.extend(coord);
                });
            }
        });
        
        if (!bounds.isEmpty()) {
            map.fitBounds(bounds, {
                padding: 50,
                duration: 1000
            });
        }
    }
    
    // Reset filter after 5 seconds
    setTimeout(() => {
        map.setFilter('migration-routes', null);
    }, 5000);
}

// Function to get the image path for a bird species
function getBirdImagePath(species) {
    // Map species names to their exact image filenames
    const imageMap = {
        'Blackpoll Warbler': 'Blackpoll Warbler.jpeg',
        'Broad-winged Hawk': 'Broad-winged Hawk.jpeg',
        'Harpy Eagle': 'Harpy Eagle.jpg',
        'Lesser Yellowlegs': 'Lesser Yellowlegs.jpeg',
        'Orinoco Goose': 'Orinoco Goose.jpeg',
        'Plumbeous Kite': 'Plumbeous Kite.jpeg',
        'Scissor-tailed Flycatcher': 'Scissor-tailed Flycatcher.jpeg',
        'Solitary Sandpiper': 'Solitary Sandpiper.jpeg',
        "Swainson's Hawk": "Swainson's Hawk.jpeg",
        'Tennessee Warbler': 'Tennessee Warbler.jpeg'
    };
    
    const filename = imageMap[species] || 'default-bird.jpg';
    return `images/birds/${filename}`;
}

// Function to handle image loading with fallback
function loadImageWithFallback(imgElement, species) {
    const originalSrc = imgElement.src;
    
    // Set loading state
    imgElement.style.opacity = '0.7';
    imgElement.style.filter = 'blur(2px)';
    
    imgElement.onload = function() {
        // Image loaded successfully
        imgElement.style.opacity = '1';
        imgElement.style.filter = 'none';
        imgElement.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
    };
    
    imgElement.onerror = function() {
        // If image fails to load, try with a placeholder
        if (imgElement.src !== 'images/birds/default-bird.jpg') {
            imgElement.src = 'images/birds/default-bird.jpg';
        } else {
            // If placeholder also fails, show a colored circle as fallback
            const fallbackColor = speciesColors[species] || '#6b7280';
            imgElement.style.backgroundColor = fallbackColor;
            imgElement.style.backgroundImage = 'none';
            const firstLetter = species ? species.charAt(0).toUpperCase() : '?';
            imgElement.alt = `${species} (image not available)`;
            imgElement.style.display = 'flex';
            imgElement.style.alignItems = 'center';
            imgElement.style.justifyContent = 'center';
            imgElement.style.color = '#fff';
            imgElement.style.fontWeight = 'bold';
            imgElement.textContent = firstLetter;
        }
    };
}

// Update the legend with current layer information
function updateLegend() {
    const legend = document.getElementById('legend-items');
    if (!legend) return;
    
    // Clear existing legend items
    legend.innerHTML = '';
    
    // Add a title to the legend
    const legendTitle = document.createElement('h3');
    legendTitle.textContent = 'Bird Species';
    legendTitle.style.margin = '0 0 12px 0';
    legendTitle.style.fontSize = '16px';
    legendTitle.style.color = '#1e2937';
    legendTitle.style.fontWeight = '600';
    legend.appendChild(legendTitle);
    
    // Add a search input for filtering species
    const searchContainer = document.createElement('div');
    searchContainer.style.marginBottom = '12px';
    searchContainer.style.position = 'relative';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search species...';
    searchInput.style.width = '100%';
    searchInput.style.padding = '8px 12px 8px 32px';
    searchInput.style.border = '1px solid #e5e7eb';
    searchInput.style.borderRadius = '6px';
    searchInput.style.fontSize = '14px';
    searchInput.style.outline = 'none';
    searchInput.style.transition = 'border-color 0.2s, box-shadow 0.2s';
    searchInput.style.boxSizing = 'border-box';
    
    // Add search icon
    const searchIcon = document.createElement('span');
    searchIcon.innerHTML = '🔍';
    searchIcon.style.position = 'absolute';
    searchIcon.style.left = '10px';
    searchIcon.style.top = '50%';
    searchIcon.style.transform = 'translateY(-50%)';
    searchIcon.style.opacity = '0.5';
    searchIcon.style.pointerEvents = 'none';
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const items = legend.querySelectorAll('.legend-item');
        
        items.forEach(item => {
            const speciesName = item.getAttribute('data-species').toLowerCase();
            const scientificName = item.getAttribute('data-scientific').toLowerCase();
            
            if (speciesName.includes(searchTerm) || scientificName.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchInput);
    legend.appendChild(searchContainer);
    
    // Add bird species to the legend
    Object.entries(speciesColors).forEach(([species, color]) => {
        const scientificName = getScientificName(species) || 'Scientific name not available';
        const birdImage = getBirdImagePath(species);
        
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.setAttribute('data-species', species.toLowerCase());
        item.setAttribute('data-scientific', scientificName.toLowerCase());
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `Show ${species} migration route`);
        
        // Styling
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.padding = '10px 12px';
        item.style.margin = '6px 0';
        item.style.borderRadius = '8px';
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
        item.style.transition = 'all 0.2s ease';
        item.style.cursor = 'pointer';
        item.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
        
        // Hover and focus states
        const hoverStyles = {
            backgroundColor: '#f8fafc',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transform: 'translateY(-1px)'
        };
        
        const activeStyles = {
            backgroundColor: '#f1f5f9',
            transform: 'translateY(0)'
        };
        
        item.addEventListener('mouseenter', () => {
            Object.assign(item.style, hoverStyles);
            highlightSpecies(species);
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
            item.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
            item.style.transform = 'none';
            highlightSpecies(null);
        });
        
        item.addEventListener('focus', () => {
            Object.assign(item.style, hoverStyles);
            highlightSpecies(species);
        });
        
        item.addEventListener('blur', () => {
            item.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
            item.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
            item.style.transform = 'none';
            highlightSpecies(null);
        });
        
        item.addEventListener('click', () => {
            // Toggle the active state
            const isActive = item.classList.contains('active');
            
            // Remove active state from all items
            document.querySelectorAll('.legend-item').forEach(el => {
                el.classList.remove('active');
                el.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
                el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                el.style.transform = 'none';
            });
            
            if (!isActive) {
                item.classList.add('active');
                Object.assign(item.style, activeStyles);
                highlightSpecies(species);
                
                // Zoom to the selected species
                const features = map.querySourceFeatures('bird-migration', {
                    sourceLayer: 'bird-migration',
                    filter: ['==', 'species', species]
                });
                
                if (features.length > 0) {
                    const bounds = features.reduce((bounds, feature) => {
                        return bounds.extend(getFeatureBounds(feature));
                    }, new mapboxgl.LngLatBounds());
                    
                    map.fitBounds(bounds, {
                        padding: 50,
                        duration: 1000,
                        essential: true
                    });
                }
            } else {
                highlightSpecies(null);
            }
        });
        
        // Handle keyboard navigation
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
        
        // Create color indicator
        const colorIndicator = document.createElement('div');
        colorIndicator.style.width = '14px';
        colorIndicator.style.height = '14px';
        colorIndicator.style.borderRadius = '3px';
        colorIndicator.style.backgroundColor = color;
        colorIndicator.style.marginRight = '12px';
        colorIndicator.style.flexShrink = '0';
        colorIndicator.style.border = '1px solid rgba(0,0,0,0.1)';
        
        // Create image container with loading state
        const imgContainer = document.createElement('div');
        imgContainer.style.width = '36px';
        imgContainer.style.height = '36px';
        imgContainer.style.borderRadius = '50%';
        imgContainer.style.overflow = 'hidden';
        imgContainer.style.marginRight = '12px';
        imgContainer.style.flexShrink = '0';
        imgContainer.style.border = '2px solid #fff';
        imgContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        imgContainer.style.position = 'relative';
        imgContainer.style.backgroundColor = 'rgba(0,0,0,0.05)';
        
        // Create loading spinner
        const spinner = document.createElement('div');
        spinner.style.position = 'absolute';
        spinner.style.top = '50%';
        spinner.style.left = '50%';
        spinner.style.width = '16px';
        spinner.style.height = '16px';
        spinner.style.margin = '-8px 0 0 -8px';
        spinner.style.border = '2px solid rgba(0,0,0,0.1)';
        spinner.style.borderTopColor = color;
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'spin 1s linear infinite';
        
        // Create bird image
        const img = document.createElement('img');
        img.src = birdImage;
        img.alt = species;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        // Add loading state
        imgContainer.appendChild(spinner);
        
        // When image loads, remove spinner and show image
        img.onload = function() {
            spinner.remove();
            img.style.opacity = '1';
        };
        
        // Handle image loading errors
        img.onerror = function() {
            spinner.remove();
            // Show fallback content
            const fallback = document.createElement('div');
            fallback.style.width = '100%';
            fallback.style.height = '100%';
            fallback.style.display = 'flex';
            fallback.style.alignItems = 'center';
            fallback.style.justifyContent = 'center';
            fallback.style.backgroundColor = color + '33'; // 20% opacity
            fallback.style.color = color;
            fallback.style.fontWeight = 'bold';
            fallback.textContent = species.charAt(0).toUpperCase();
            
            // Clear container and add fallback
            imgContainer.innerHTML = '';
            imgContainer.appendChild(fallback);
            imgContainer.style.borderColor = color + '80'; // 50% opacity
        };
        
        imgContainer.appendChild(img);
        
        // Create text container
        const textContainer = document.createElement('div');
        textContainer.style.flex = '1';
        textContainer.style.minWidth = '0';
        
        // Create species name
        const speciesName = document.createElement('div');
        speciesName.textContent = species;
        speciesName.style.fontWeight = '600';
        speciesName.style.fontSize = '14px';
        speciesName.style.color = '#1e293b';
        speciesName.style.marginBottom = '2px';
        speciesName.style.whiteSpace = 'nowrap';
        speciesName.style.overflow = 'hidden';
        speciesName.style.textOverflow = 'ellipsis';
        
        // Create scientific name
        const sciName = document.createElement('div');
        sciName.textContent = scientificName;
        sciName.style.fontSize = '12px';
        sciName.style.color = '#64748b';
        sciName.style.fontStyle = 'italic';
        sciName.style.whiteSpace = 'nowrap';
        sciName.style.overflow = 'hidden';
        sciName.style.textOverflow = 'ellipsis';
        
        // Assemble the components
        textContainer.appendChild(speciesName);
        textContainer.appendChild(sciName);
        
        item.appendChild(colorIndicator);
        item.appendChild(imgContainer);
        item.appendChild(textContainer);
        
        legend.appendChild(item);
    });
    
    // Add animation for the spinner
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Fit map to show all data
function fitMapToData() {
    console.log('Fitting map to data...');
    const bounds = new mapboxgl.LngLatBounds();
    
    // Get bounds from all sources
    const sources = ['bird-migration'];
    let hasValidBounds = false;
    
    sources.forEach(sourceId => {
        const source = map.getSource(sourceId);
        console.log(`Processing source: ${sourceId}`, source);
        
        if (source && source._data && source._data.features) {
            console.log(`Found ${source._data.features.length} features in ${sourceId}`);
            
            source._data.features.forEach((feature, i) => {
                if (!feature.geometry) {
                    console.warn(`Feature ${i} has no geometry`);
                    return;
                }
                
                if (feature.geometry.type === 'LineString' && feature.geometry.coordinates) {
                    feature.geometry.coordinates.forEach(coord => {
                        bounds.extend(coord);
                        hasValidBounds = true;
                    });
                } else if (feature.geometry.type === 'Point' && feature.geometry.coordinates) {
                    bounds.extend(feature.geometry.coordinates);
                    hasValidBounds = true;
                } else if (feature.geometry.type === 'Polygon' && feature.geometry.coordinates) {
                    feature.geometry.coordinates[0].forEach(coord => {
                        bounds.extend(coord);
                        hasValidBounds = true;
                    });
                }
            });
        }
    });
    
    console.log('Calculated bounds:', bounds);
    console.log('Has valid bounds:', hasValidBounds);
    
    // Only fit bounds if we have valid bounds
    if (hasValidBounds) {
        console.log('Fitting to bounds:', {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
        });
        
        map.fitBounds(bounds, {
            padding: 100,
            maxZoom: 5,
            duration: 2000
        });
    } else {
        console.warn('No valid bounds found for any features');
        // Fallback to a reasonable view
        map.fitBounds([[-180, -60], [180, 60]], {
            padding: 50,
            maxZoom: 2,
            duration: 1000
        });
    }
}

// Setup control buttons
document.getElementById('zoomIn').addEventListener('click', () => {
    map.zoomIn();
});

document.getElementById('zoomOut').addEventListener('click', () => {
    map.zoomOut();
});

document.getElementById('resetView').addEventListener('click', () => {
    fitMapToData();
});

document.getElementById('toggleBirds').addEventListener('click', () => {
    const visible = layerVisibility.birds = !layerVisibility.birds;
    const opacity = visible ? 0.8 : 0;
    
    map.setPaintProperty('migration-routes', 'line-opacity', opacity);
    map.setPaintProperty('migration-arrows', 'icon-opacity', opacity);
    
    // Update button text
    document.getElementById('toggleBirds').textContent = 
        visible ? 'Hide Bird Migration' : 'Show Bird Migration';
});

document.getElementById('toggleFeatures').addEventListener('click', () => {
    // This is a placeholder for toggling additional features
    // You can add more feature layers here
    console.log('Toggle features clicked');
});
