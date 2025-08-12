// I_shape.js - renders a 3D triangular rod into #i-shape-container and adds a label below
// Requires Three.js to be loaded first
(function() {
    const container = document.getElementById('i-shape-container');
    if (!container) return;
    const WIDTH = 800;
    const HEIGHT = 200;
    container.style.width = WIDTH + 'px';
    container.style.height = HEIGHT + 'px';
    container.style.position = 'relative';

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x22223b, 1);
    container.appendChild(renderer.domElement);

    // Triangular rod geometry (prism)
    function createTriangularRod(length = 6, height = 0.6, width = 0.6) {
        // Create a triangular prism geometry
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(width, 0);
        shape.lineTo(width/2, height);
        shape.lineTo(0, 0);
        const extrudeSettings = {
            steps: 1,
            depth: length,
            bevelEnabled: false
        };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.rotateX(Math.PI/2);
        geometry.translate(-width/2, 0, -length/2);
        return geometry;
    }

    const material = new THREE.MeshPhongMaterial({ color: 0x8ecae6, shininess: 100, specular: 0x22223b });
    const rod = new THREE.Mesh(createTriangularRod(), material);
    rod.castShadow = true;
    rod.receiveShadow = true;
    scene.add(rod);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(6, 8, 8);
    scene.add(directionalLight);

    // Camera position
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 0, 0);

    // Simple animation
    function animate() {
        requestAnimationFrame(animate);
        rod.rotation.z += 0.01;
        renderer.render(scene, camera);
    }
    animate();

    // Add label below canvas
    let label = document.createElement('div');
    label.textContent = 'Pen rose path';
    label.style.textAlign = 'center';
    label.style.marginTop = '12px';
    label.style.fontSize = '1.3em';
    label.style.color = '#4361ee';
    label.style.fontWeight = 'bold';
    container.parentElement.appendChild(label);
})();
