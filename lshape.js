// 3D L-Shape Interactive
let scene, camera, renderer, controls, lshape;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Create L-shape with better materials and lighting
function createLShape() {
    const group = new THREE.Group();
    
    // Create a single geometry for the L-shape
    const geometry = new THREE.BoxGeometry(1, 0.2, 0.2);
    
    // Create a more interesting material
    const material = new THREE.MeshPhongMaterial({
        color: 0x4361ee,
        shininess: 50,
        specular: 0xffffff,
        flatShading: true,
        side: THREE.DoubleSide
    });
    
    // Create the vertical part of the L
    const vertical = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 1, 0.2),
        material
    );
    
    // Create the horizontal part of the L
    const horizontal = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.2, 0.2),
        material
    );
    
    // Position the parts to form an L
    vertical.position.y = 0.5;
    horizontal.position.x = 0.5;
    horizontal.position.y = 1.1;
    
    // Add some rounded edges
    vertical.castShadow = true;
    horizontal.castShadow = true;
    
    group.add(vertical);
    group.add(horizontal);
    
    // Add a subtle rotation animation
    group.userData = {
        rotationSpeed: 0.01,
        rotationAxis: new THREE.Vector3(0, 1, 0).normalize(),
        setColor: function(color) {
            vertical.material.color.setStyle(color);
            horizontal.material.color.setStyle(color);
        },
        setRotationSpeed: function(speed) {
            this.rotationSpeed = speed * 0.01;
        }
    };
    
    return group;
}

// Initialize the scene
function initLShape() {
    const container = document.getElementById('lshape-container');
    if (!container) {
        console.error('Could not find lshape-container element');
        return;
    }
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    // Create camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(3, 3, 5);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add L-shape
    lshape = createLShape();
    scene.add(lshape);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('lshape-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate L-shape
    if (lshape) {
        lshape.rotation.y += 0.005;
        lshape.rotation.x += 0.003;
    }
    
    // Update controls
    if (controls) {
        controls.update();
    }
    
    // Render scene
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLShape);
} else {
    initLShape();
}
