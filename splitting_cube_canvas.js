// splitting_cube_canvas.js - renders interactive splitting cube into #splitting-cube-container
// Requires Three.js to be loaded first
(function() {
    const container = document.getElementById('splitting-cube-container');
    if (!container) return;
    const WIDTH = 800;
    const HEIGHT = 600;
    container.style.width = WIDTH + 'px';
    container.style.height = HEIGHT + 'px';
    container.style.position = 'relative';

    // --- Splitting Cube logic from splitting_cube.html (refactored for canvas) ---
    let scene, camera, renderer, raycaster, mouse;
    let cubes = [];
    let splitMode = 'click'; // 'click', 'hover', 'motion'
    let sensitivity = 5;
    let baseSize = 20;
    let interactionCooldown = new Map();
    let mouseVelocity = { x: 0, y: 0 };
    let lastMousePos = { x: 0, y: 0 };
    let frameCount = 0;

    function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(WIDTH, HEIGHT);
        renderer.setClearColor(0x1a1a2e, 1);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        camera.position.set(8, 8, 8);
        camera.lookAt(0, 0, 0);

        // Controls (simple drag rotate and zoom)
        let isMouseDown = false;
        let previousMousePosition = { x: 0, y: 0 };
        let targetRotationX = 0, targetRotationY = 0;
        let currentRotationX = 0, currentRotationY = 0;

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
            // For hover/motion split
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            if (splitMode === 'hover' || splitMode === 'motion') {
                checkIntersection(event);
            }
        });
        renderer.domElement.addEventListener('wheel', function(event) {
            const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
            camera.position.multiplyScalar(zoomFactor);
            event.preventDefault();
        });
        renderer.domElement.addEventListener('click', function(event) {
            if (splitMode === 'click') checkIntersection(event);
        });

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        const pointLight = new THREE.PointLight(0x00ffff, 0.6, 100);
        pointLight.position.set(-10, 5, -10);
        scene.add(pointLight);
        const pointLight2 = new THREE.PointLight(0xff0080, 0.4, 100);
        pointLight2.position.set(10, -5, 10);
        scene.add(pointLight2);

        createInitialCube();
        animate();
    }

    function createInitialCube() {
        const geometry = new THREE.BoxGeometry(baseSize, baseSize, baseSize);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff88,
            shininess: 100,
            transparent: true,
            opacity: 0.9,
            emissive: 0x002200
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.position.set(0, 0, 0);
        cube.userData = { 
            size: baseSize,
            generation: 0,
            rotationSpeed: { 
                x: (Math.random() - 0.5) * 0.02, 
                y: (Math.random() - 0.5) * 0.02, 
                z: (Math.random() - 0.5) * 0.02 
            },
            creationTime: Date.now(),
            id: Math.random()
        };
        scene.add(cube);
        cubes.push(cube);
    }

    function checkIntersection(event) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cubes);
        if (intersects.length > 0) {
            const intersectedCube = intersects[0].object;
            const cubeId = intersectedCube.userData.id;
            const now = Date.now();
            if (interactionCooldown.has(cubeId) && now - interactionCooldown.get(cubeId) < 200) {
                return;
            }
            interactionCooldown.set(cubeId, now);
            if (intersectedCube.userData.size > 0.1 && intersectedCube.userData.generation < 4) {
                splitCube(intersectedCube);
            }
        }
    }

    function splitCube(cube) {
        const index = cubes.indexOf(cube);
        if (index === -1) return;
        scene.remove(cube);
        cubes.splice(index, 1);
        const newCubes = createSplitCubes(cube);
        newCubes.forEach(newCube => {
            scene.add(newCube);
            cubes.push(newCube);
        });
    }

    function createSplitCubes(originalCube) {
        const newCubes = [];
        const originalSize = originalCube.userData.size;
        const newSize = originalSize / 2;
        const offset = newSize / 2;
        const generation = originalCube.userData.generation + 1;
        for (let x = -1; x <= 1; x += 2) {
            for (let y = -1; y <= 1; y += 2) {
                for (let z = -1; z <= 1; z += 2) {
                    const geometry = new THREE.BoxGeometry(newSize, newSize, newSize);
                    const hue = (generation * 0.15 + Math.random() * 0.3) % 1;
                    const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
                    const material = new THREE.MeshPhongMaterial({ 
                        color: color.getHex(),
                        shininess: 80,
                        transparent: true,
                        opacity: 0.8,
                        emissive: color.offsetHSL(0, 0, -0.3).getHex()
                    });
                    const cube = new THREE.Mesh(geometry, material);
                    cube.position.set(
                        originalCube.position.x + x * offset,
                        originalCube.position.y + y * offset,
                        originalCube.position.z + z * offset
                    );
                    cube.castShadow = true;
                    cube.receiveShadow = true;
                    cube.userData = {
                        size: newSize,
                        generation: generation,
                        rotationSpeed: {
                            x: (Math.random() - 0.5) * 0.04,
                            y: (Math.random() - 0.5) * 0.04,
                            z: (Math.random() - 0.5) * 0.04
                        },
                        creationTime: Date.now(),
                        id: Math.random()
                    };
                    newCubes.push(cube);
                }
            }
        }
        return newCubes;
    }

    function animate() {
        requestAnimationFrame(animate);
        cubes.forEach((cube, index) => {
            cube.rotation.x += cube.userData.rotationSpeed.x;
            cube.rotation.y += cube.userData.rotationSpeed.y;
            cube.rotation.z += cube.userData.rotationSpeed.z;
            const time = Date.now() * 0.001;
            cube.position.y += Math.sin(time + index) * 0.005;
        });
        renderer.render(scene, camera);
    }

    // Public API (optional)
    window.changeSplitMode = function(mode) { splitMode = mode; };
    window.setSensitivity = function(value) { sensitivity = value; };
    window.setBaseSize = function(value) { baseSize = value; };
    window.resetSplittingCubeScene = function() {
        cubes.forEach(cube => scene.remove(cube));
        cubes = [];
        interactionCooldown.clear();
        createInitialCube();
    };

    // Initialize
    init();
})();
