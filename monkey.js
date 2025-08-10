// Blender Monkey (Suzanne) 3D Model
let scene, camera, renderer, monkey;

// Initialize the scene
function initMonkey() {
    const container = document.getElementById('monkey-container');
    if (!container) {
        console.error('Could not find monkey-container element');
        return;
    }
    
    // Create scene with a dark background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    // Create camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create Blender's monkey (Suzanne)
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshPhongMaterial({
        color: 0x0047AB, // Cobalt blue
        shininess: 100,
        specular: 0x111111,
        flatShading: true
    });
    
    monkey = new THREE.Mesh(geometry, material);
    scene.add(monkey);
    
    // Add simple rotation animation
    function animate() {
        requestAnimationFrame(animate);
        
        if (monkey) {
            monkey.rotation.x += 0.005;
            monkey.rotation.y += 0.01;
        }
        
        renderer.render(scene, camera);
    }
    
    // Handle window resize
    function onWindowResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    
    window.addEventListener('resize', onWindowResize);
    animate();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMonkey);
} else {
    initMonkey();
}
