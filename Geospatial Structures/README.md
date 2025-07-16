# Geospatial Structures
## Maps in Mapbox - Complete Tutorial
---

This directory contains a comprehensive tutorial for working with geospatial data and interactive maps using Mapbox GL JS. This guide is designed for beginners and intermediate developers who want to create custom, interactive maps.

## Table of Contents
1. [What is Mapbox?](#what-is-mapbox)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Understanding the Code](#understanding-the-code)
5. [Adding Data to Your Map](#adding-data-to-your-map)
6. [Advanced Features](#advanced-features)
7. [Troubleshooting](#troubleshooting)

## What is Mapbox?

Mapbox is a mapping platform that provides tools to create custom, interactive maps. It's used by companies like Facebook, Snapchat, and Uber for their mapping needs.

### Key Components:
- **Mapbox GL JS**: JavaScript library for interactive maps
- **Mapbox Styles**: Pre-designed map themes (streets, satellite, light, dark)
- **Mapbox Studio**: Visual editor for custom map styles
- **Mapbox APIs**: Services for geocoding, directions, and data

### Why Use Mapbox?
- **Performance**: Vector-based rendering for smooth interactions
- **Customization**: Highly customizable styles and interactions
- **Data Integration**: Easy to add your own data layers
- **Mobile Support**: Works great on mobile devices
- **Free Tier**: Generous free usage limits

## Prerequisites

Before starting with Mapbox, you should have:

### Basic Knowledge:
- HTML and CSS fundamentals
- JavaScript basics (variables, functions, events)
- Understanding of coordinates (latitude/longitude)

### Tools Needed:
- A web browser (Chrome, Firefox, Safari, Edge)
- A text editor (VS Code, Sublime Text, etc.)
- A Mapbox account (free at [mapbox.com](https://www.mapbox.com))

## Getting Started

### Step 1: Create a Mapbox Account
1. Visit [mapbox.com](https://www.mapbox.com)
2. Sign up for a free account
3. Navigate to your account dashboard
4. Create a new access token

### Step 2: Set Up Your Project
Create separate files for HTML and JavaScript:

**index.html:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My First Mapbox Map</title>
    <!-- Load Mapbox Stylesheet -->
    <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet">
     <!-- Load Mapbox GL JS library -->
    <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
</head>
<body>
    <!-- Load the mapbox container -->
    <div id="mapbox-container-1"></div>
    
    <!-- Load your custom JavaScript file -->
    <script src="mapBox_Sketch_01.js"></script>
</body>
</html>
```

**mapBox_Sketch_01.js:**
```javascript
// Set your Mapbox access token
mapboxgl.accessToken = 'YOUR_ACCESS_TOKEN_HERE';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'mapbox-container-1',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-74.006, 40.7128], // New York City
    zoom: 11
});
```

**Why separate files?**
- **Maintainability**: Easier to organize and maintain code
- **Reusability**: JavaScript can be reused across multiple HTML files
- **Caching**: Browsers can cache JavaScript files separately
- **Collaboration**: Different team members can work on different files
- **Debugging**: Easier to debug when code is organized in separate files

### Step 3: Add CSS Styling

Create a `style.css` file to properly style your map containers:

```css
/* Basic styling for the map containers */
#mapbox-container-1, #mapbox-container-2, #mapbox-container-3 {
    width: 100%;
    height: 400px;
    margin: 40px 0;
    display: block;
    border: 1px solid #ccc;
}

/* Optional: Add this to your HTML head section */
<link rel="stylesheet" href="style.css">
```

**Why CSS styling is important:**
- **Container Sizing**: The map needs a defined height and width to render properly
- **Visual Polish**: Borders and margins make the map look professional
- **Responsive Design**: Percentage width ensures the map adapts to different screen sizes
- **Consistency**: Multiple map containers will have uniform styling

### Step 4: Replace Your Access Token
In the `mapBox_Sketch_01.js` file, replace `'YOUR_ACCESS_TOKEN_HERE'` with your actual Mapbox access token.

## Understanding the Code

Let's break down the key concepts in our NYC map example:

### 1. Map Initialization

```javascript
// Create a new map instance
const map = new mapboxgl.Map({
    container: 'mapbox-container-1',           // HTML element ID
    style: 'mapbox://styles/mapbox/light-v11',  // Map style
    center: [-74.006, 40.7128], // [longitude, latitude]
    zoom: 11,                   // Zoom level (0-22)
    pitch: 0,                   // 3D tilt (0-60)
    bearing: 0                  // Rotation (0-360)
});
```

**Key Parameters Explained:**
- `container`: The HTML element where the map will be rendered
- `style`: The visual theme of the map
- `center`: Starting position [longitude, latitude]
- `zoom`: How close to zoom in (higher = closer)
- `pitch`: 3D tilt angle (0 = flat, 60 = maximum tilt)
- `bearing`: Map rotation in degrees

### 2. Adding Controls

```javascript
// Navigation controls (zoom in/out, compass)
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Fullscreen button
map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

// Scale bar
map.addControl(new mapboxgl.ScaleControl({
    maxWidth: 80,
    unit: 'metric'
}), 'bottom-left');
```

### 3. Adding Markers

```javascript
// Wait for map to load before adding markers
map.on('load', () => {
    // Create a marker
    const marker = new mapboxgl.Marker({
        color: '#666',    // Marker color
        scale: 1.0        // Marker size
    })
    .setLngLat([-73.9855, 40.7580])  // Position
    .setPopup(new mapboxgl.Popup().setHTML('<h3>Times Square</h3>'))
    .addTo(map);  // Add to map
});
```

### 4. Event Handling

```javascript
// Handle map clicks
map.on('click', (e) => {
    const coordinates = e.lngLat;
    console.log(`Clicked at: ${coordinates.lng}, ${coordinates.lat}`);
    
    // Create popup at click location
    new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<p>Longitude: ${coordinates.lng}</p>`)
        .addTo(map);
});
```

## Adding Data to Your Map

Mapbox supports various data formats and sources. Here are the most common ways to add data:

### 1. GeoJSON Data

GeoJSON is the most common format for geographic data. Here's how to add it:

```javascript
// Sample GeoJSON data
const geojsonData = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-73.9855, 40.7580]
            },
            "properties": {
                "name": "Times Square",
                "description": "The heart of Manhattan"
            }
        }
    ]
};

// Add GeoJSON as a source
map.addSource('my-data', {
    type: 'geojson',
    data: geojsonData
});

// Add a layer to display the data
map.addLayer({
    id: 'my-points',
    type: 'circle',
    source: 'my-data',
    paint: {
        'circle-radius': 8,
        'circle-color': '#ff0000',
        'circle-opacity': 0.8
    }
});
```

### 2. Loading External GeoJSON Files

```javascript
// Load GeoJSON from a URL
map.addSource('external-data', {
    type: 'geojson',
    data: 'https://your-domain.com/data.geojson'
});

map.addLayer({
    id: 'external-points',
    type: 'circle',
    source: 'external-data',
    paint: {
        'circle-radius': 6,
        'circle-color': '#00ff00'
    }
});
```

### 3. Adding Custom Markers from Data

```javascript
// Sample data array
const locations = [
    { name: "Times Square", lng: -73.9855, lat: 40.7580 },
    { name: "Central Park", lng: -73.9654, lat: 40.7829 },
    { name: "Brooklyn Bridge", lng: -73.9969, lat: 40.7061 }
];

// Add markers for each location
locations.forEach(location => {
    const marker = new mapboxgl.Marker()
        .setLngLat([location.lng, location.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${location.name}</h3>`))
        .addTo(map);
});
```

### 4. Adding Polygons and Lines

```javascript
// Add a polygon (area)
const polygonData = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-74.0, 40.7],
            [-73.9, 40.7],
            [-73.9, 40.8],
            [-74.0, 40.8],
            [-74.0, 40.7]
        ]]
    },
    "properties": {
        "name": "Manhattan Area"
    }
};

map.addSource('polygon-data', {
    type: 'geojson',
    data: polygonData
});

map.addLayer({
    id: 'polygon-layer',
    type: 'fill',
    source: 'polygon-data',
    paint: {
        'fill-color': '#ff0000',
        'fill-opacity': 0.3
    }
});
```


---


