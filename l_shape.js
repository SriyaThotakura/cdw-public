// l_shape.js - renders a 3D L shape into #lshape-container
// Requires Three.js to be loaded first

(function() {
    const container = document.getElementById('lshape-container');
    if (!container) return;

    // Set fixed size
    const WIDTH = 800;
    const HEIGHT = 600;
    container.style.width = WIDTH + 'px';
    container.style.height = HEIGHT + 'px';
    container.style.position = 'relative';

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Create 3D L shape with three equal length cuboid rods
    function createLShape(rodSize = 0.2, rodLength = 3) {
        const group = new THREE.Group();
        const rodMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xe74c3c,
            shininess: 100,
            specular: 0x111111
        });
        // Vertical rod (Y)
        const verticalGeometry = new THREE.BoxGeometry(rodSize, rodLength, rodSize);
        const verticalRod = new THREE.Mesh(verticalGeometry, rodMaterial);
        verticalRod.position.y = rodLength / 2;
        verticalRod.castShadow = true;
        verticalRod.receiveShadow = true;
        group.add(verticalRod);
        // Horizontal rod (X)
        const horizGeometry = new THREE.BoxGeometry(rodLength, rodSize, rodSize);
        const horizRod = new THREE.Mesh(horizGeometry, rodMaterial);
        horizRod.position.x = rodLength / 2;
        horizRod.castShadow = true;
        horizRod.receiveShadow = true;
        group.add(horizRod);
        // Outward rod (Z)
        const outGeometry = new THREE.BoxGeometry(rodSize, rodSize, rodLength);
        const outRod = new THREE.Mesh(outGeometry, rodMaterial);
        outRod.position.set(0, 0, rodLength / 2);
        outRod.castShadow = true;
        outRod.receiveShadow = true;
        group.add(outRod);
        return group;
    }

    // Add L shape
    let lShape = createLShape();
    scene.add(lShape);

    // Add ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(6, 8, 8);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0x3498db, 0.4, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Camera position
    camera.position.set(6, 6, 6);
    camera.lookAt(1.5, 1.5, 1.5);

    // Controls (simple drag rotate and zoom)
    let isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationX = 0, targetRotationY = 0;
    let currentRotationX = 0, currentRotationY = 0;
    let rotationSpeed = 1;
    let targetScale = 1, currentScale = 1;

    renderer.domElement.addEventListener('mousedown', function(event) {
        isMouseDown = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
    });
    renderer.domElement.addEventListener('mouseup', function() {
        isMouseDown = false;
    });
    renderer.domElement.addEventListener('mousemove', function(event) {
        if (isMouseDown) {
            const deltaX = event.clientX - previousMousePosition.x;
            const deltaY = event.clientY - previousMousePosition.y;
            targetRotationY += deltaX * 0.01;
            targetRotationX += deltaY * 0.01;
            previousMousePosition = { x: event.clientX, y: event.clientY };
        }
    });
    renderer.domElement.addEventListener('wheel', function(event) {
        const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
        camera.position.multiplyScalar(zoomFactor);
        event.preventDefault();
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        currentRotationX += (targetRotationX - currentRotationX) * 0.1;
        currentRotationY += (targetRotationY - currentRotationY) * 0.1;
        lShape.rotation.x = currentRotationX;
        lShape.rotation.y = currentRotationY;
        // Auto-rotation
        targetRotationY += rotationSpeed * 0.01;
        targetRotationX += rotationSpeed * 0.005;
        // Smooth scaling
        currentScale += (targetScale - currentScale) * 0.1;
        lShape.scale.set(currentScale, currentScale, currentScale);
        // Floating
        lShape.position.y = Math.sin(Date.now() * 0.001) * 0.1;
        renderer.render(scene, camera);
    }
    animate();
})();
