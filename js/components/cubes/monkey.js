console.log('monkey.js: Script loaded');

// 3D Model variables
let scene, camera, renderer, monkey, container;
let isInitialized = false;
let animationId = null;
let resizeObserver = null;

// Initialize the 3D scene
function initMonkey() {
    console.log('initMonkey called, document ready state:', document.readyState);
    
    if (isInitialized) {
        console.log('Monkey already initialized');
        return;
    }
    
    // Get container for size reference
    container = document.getElementById('monkey-container');
    if (!container) {
        console.error('monkey-container not found');
        return;
    }
    
    console.log('monkey-container found, dimensions:', container.clientWidth, 'x', container.clientHeight);
    
    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded');
        return;
    }
    
    try {
        // Create canvas element
        let canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        container.appendChild(canvas);
        
        // Get container dimensions
        const width = container.clientWidth || 400;
        const height = container.clientHeight || 400;
        
        // Create scene with dark background
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);
        
        // Create camera
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 5);
        
        // Create renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height, false);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Create 3D model (Torus Knot as placeholder for Suzanne)
        const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0x0047AB, // Cobalt blue
            shininess: 100,
            specular: 0x111111,
            flatShading: false
        });
        
        monkey = new THREE.Mesh(geometry, material);
        scene.add(monkey);
        
        // Set up resize observer
        if (window.ResizeObserver) {
            resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(container);
        } else {
            // Fallback for browsers without ResizeObserver
            window.addEventListener('resize', handleResize);
        }
        
        isInitialized = true;
        console.log('Monkey 3D scene initialized successfully');
        
        // Start animation
        animate();
        
    } catch (error) {
        console.error('Error initializing monkey 3D scene:', error);
    }
}

// Handle container resize
function handleResize() {
    if (!camera || !renderer || !container) return;
    
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;
    
    // Update camera
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    // Update renderer
    renderer.setSize(width, height, false);
    
    // Adjust camera position based on aspect ratio
    camera.position.z = Math.max(4, 5 * (width / 400));
    camera.lookAt(0, 0, 0);
}

// Animation loop
function animate() {
    if (!isInitialized) return;
    
    animationId = requestAnimationFrame(animate);
    
    if (monkey) {
        monkey.rotation.x += 0.005;
        monkey.rotation.y += 0.01;
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Cleanup function
function cleanup() {
    console.log('Cleaning up monkey 3D scene');
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
    
    if (renderer) {
        renderer.dispose();
        renderer = null;
    }
    
    if (scene) {
        while(scene.children.length > 0) { 
            scene.remove(scene.children[0]); 
        }
        scene = null;
    }
    
    camera = null;
    monkey = null;
    isInitialized = false;
}

// Handle cleanup when page is navigated away
window.addEventListener('beforeunload', cleanup);

// Multiple initialization attempts (same pattern as sketches)
let monkeyInstance = null;

function initMonkeyRobust() {
    console.log('initMonkeyRobust called');
    
    if (isInitialized) {
        console.log('Monkey already initialized');
        return;
    }
    
    const containerExists = document.getElementById('monkey-container');
    const threeExists = typeof THREE !== 'undefined';
    
    console.log('Container exists:', !!containerExists);
    console.log('Three.js exists:', threeExists);
    
    if (containerExists && threeExists) {
        initMonkey();
    } else {
        console.warn('Monkey prerequisites not ready, retrying in 200ms...');
        setTimeout(initMonkeyRobust, 200);
    }
}

// Multiple initialization attempts
console.log('monkey.js: Setting up initialization');

// Immediate attempt
setTimeout(initMonkeyRobust, 200);

// DOM ready attempt
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired for monkey');
    setTimeout(initMonkeyRobust, 100);
});

// Window load attempt (final fallback)
window.addEventListener('load', function() {
    console.log('Window load fired for monkey');
    setTimeout(initMonkeyRobust, 100);
});
