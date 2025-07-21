/**
 * 3D L-Shape Renderer
 * A JavaScript module for creating and displaying an interactive 3D L-shaped object using Three.js
 */

class LShapeRenderer {
    constructor(container, options = {}) {
        // Default configuration
        this.config = {
            rodSize: 0.2,
            rodLength: 3,
            color: 0xe74c3c,
            jointColor: 0xc0392b,
            backgroundColor: 0x000000,
            groundColor: 0x34495e,
            enableShadows: true,
            enableAutoRotation: true,
            rotationSpeed: 1,
            ...options
        };

        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.lShape = null;
        this.ground = null;
        this.lights = [];
        
        // Control variables
        this.rotationSpeed = this.config.rotationSpeed;
        this.targetScale = 1;
        this.currentScale = 1;
        this.isMouseDown = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.currentRotationX = 0;
        this.currentRotationY = 0;
        this.animationId = null;

        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.createLShape();
        this.createGround();
        this.setupControls();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(6, 6, 6);
        this.camera.lookAt(1.5, 1.5, 1.5);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(this.config.backgroundColor, 0);
        
        if (this.config.enableShadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        this.container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        
        if (this.config.enableShadows) {
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 500;
            directionalLight.shadow.camera.left = -10;
            directionalLight.shadow.camera.right = 10;
            directionalLight.shadow.camera.top = 10;
            directionalLight.shadow.camera.bottom = -10;
        }
        
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);

        // Point light
        const pointLight = new THREE.PointLight(0x3498db, 0.4, 100);
        pointLight.position.set(-5, 5, 5);
        this.scene.add(pointLight);
        this.lights.push(pointLight);
    }

    createLShape() {
        const group = new THREE.Group();
        
        const rodMaterial = new THREE.MeshPhongMaterial({ 
            color: this.config.color,
            shininess: 100,
            specular: 0x111111
        });

        // Vertical rod (going up along Y axis)
        const verticalGeometry = new THREE.BoxGeometry(
            this.config.rodSize, 
            this.config.rodLength, 
            this.config.rodSize
        );
        const verticalRod = new THREE.Mesh(verticalGeometry, rodMaterial);
        verticalRod.position.y = this.config.rodLength / 2;
        
        if (this.config.enableShadows) {
            verticalRod.castShadow = true;
            verticalRod.receiveShadow = true;
        }
        
        group.add(verticalRod);

        // Horizontal rod (going right along X axis)
        const horizontalGeometry = new THREE.BoxGeometry(
            this.config.rodLength, 
            this.config.rodSize, 
            this.config.rodSize
        );
        const horizontalRod = new THREE.Mesh(horizontalGeometry, rodMaterial);
        horizontalRod.position.x = this.config.rodLength / 2;
        
        if (this.config.enableShadows) {
            horizontalRod.castShadow = true;
            horizontalRod.receiveShadow = true;
        }
        
        group.add(horizontalRod);

        // Third rod (going forward along Z axis from the end of the horizontal rod)
        const depthGeometry = new THREE.BoxGeometry(
            this.config.rodSize, 
            this.config.rodSize, 
            this.config.rodLength
        );
        const depthRod = new THREE.Mesh(depthGeometry, rodMaterial);
        depthRod.position.set(this.config.rodLength, 0, this.config.rodLength / 2);
        
        if (this.config.enableShadows) {
            depthRod.castShadow = true;
            depthRod.receiveShadow = true;
        }
        
        group.add(depthRod);

        // Add cubic joint at the origin
        const jointGeometry = new THREE.BoxGeometry(
            this.config.rodSize * 1.4, 
            this.config.rodSize * 1.4, 
            this.config.rodSize * 1.4
        );
        const jointMaterial = new THREE.MeshPhongMaterial({ 
            color: this.config.jointColor,
            shininess: 100,
            specular: 0x111111
        });
        const joint = new THREE.Mesh(jointGeometry, jointMaterial);
        
        if (this.config.enableShadows) {
            joint.castShadow = true;
            joint.receiveShadow = true;
        }
        
        group.add(joint);

        // Add second cubic joint at the end of horizontal rod where third rod connects
        const joint2 = new THREE.Mesh(jointGeometry, jointMaterial);
        joint2.position.set(this.config.rodLength, 0, 0);
        
        if (this.config.enableShadows) {
            joint2.castShadow = true;
            joint2.receiveShadow = true;
        }
        
        group.add(joint2);

        this.lShape = group;
        this.scene.add(this.lShape);
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: this.config.groundColor,
            transparent: true,
            opacity: 0.4
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -2;
        
        if (this.config.enableShadows) {
            this.ground.receiveShadow = true;
        }
        
        this.scene.add(this.ground);
    }

    setupControls() {
        const canvas = this.renderer.domElement;

        // Mouse events
        canvas.addEventListener('mousedown', (event) => {
            this.isMouseDown = true;
            this.previousMousePosition = { x: event.clientX, y: event.clientY };
        });

        canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        canvas.addEventListener('mousemove', (event) => {
            if (this.isMouseDown) {
                const deltaX = event.clientX - this.previousMousePosition.x;
                const deltaY = event.clientY - this.previousMousePosition.y;
                
                this.targetRotationY += deltaX * 0.01;
                this.targetRotationX += deltaY * 0.01;
                
                this.previousMousePosition = { x: event.clientX, y: event.clientY };
            }
        });

        // Mouse wheel for zooming
        canvas.addEventListener('wheel', (event) => {
            const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(zoomFactor);
            event.preventDefault();
        });

        // Touch events for mobile
        canvas.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                this.isMouseDown = true;
                this.previousMousePosition = { 
                    x: event.touches[0].clientX, 
                    y: event.touches[0].clientY 
                };
            }
            event.preventDefault();
        });

        canvas.addEventListener('touchend', () => {
            this.isMouseDown = false;
        });

        canvas.addEventListener('touchmove', (event) => {
            if (this.isMouseDown && event.touches.length === 1) {
                const deltaX = event.touches[0].clientX - this.previousMousePosition.x;
                const deltaY = event.touches[0].clientY - this.previousMousePosition.y;
                
                this.targetRotationY += deltaX * 0.01;
                this.targetRotationX += deltaY * 0.01;
                
                this.previousMousePosition = { 
                    x: event.touches[0].clientX, 
                    y: event.touches[0].clientY 
                };
            }
            event.preventDefault();
        });

        // Window resize handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Smooth rotation interpolation
        this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.1;
        this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.1;

        // Apply manual rotation
        this.lShape.rotation.x = this.currentRotationX;
        this.lShape.rotation.y = this.currentRotationY;

        // Add automatic rotation if speed > 0 and enabled
        if (this.config.enableAutoRotation && this.rotationSpeed > 0) {
            this.targetRotationY += this.rotationSpeed * 0.01;
            this.targetRotationX += this.rotationSpeed * 0.005;
        }

        // Smooth scaling
        this.currentScale += (this.targetScale - this.currentScale) * 0.1;
        this.lShape.scale.set(this.currentScale, this.currentScale, this.currentScale);

        // Add subtle floating animation
        this.lShape.position.y = Math.sin(Date.now() * 0.001) * 0.1;

        this.renderer.render(this.scene, this.camera);
    }

    // Public methods for controlling the L-shape
    setColor(color) {
        this.config.color = color;
        this.lShape.children.forEach(child => {
            if (child.material && child.geometry.type !== 'SphereGeometry') {
                child.material.color.setHex(color);
            }
        });
    }

    setRotationSpeed(speed) {
        this.rotationSpeed = speed;
    }

    setScale(scale) {
        this.targetScale = scale;
    }

    setRodSize(size) {
        this.config.rodSize = size;
        this.scene.remove(this.lShape);
        this.createLShape();
    }

    enableAutoRotation(enable) {
        this.config.enableAutoRotation = enable;
    }

    resetRotation() {
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.currentRotationX = 0;
        this.currentRotationY = 0;
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
        
        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Usage example:
/*
// Basic usage
const container = document.getElementById('my-container');
const lshape = new LShapeRenderer(container);

// Advanced usage with options
const lshape = new LShapeRenderer(container, {
    color: 0x3498db,
    rodSize: 0.3,
    rodLength: 4,
    enableShadows: true,
    enableAutoRotation: true,
    rotationSpeed: 2
});

// Control the L-shape
lshape.setColor(0x9b59b6);
lshape.setRotationSpeed(0.5);
lshape.setScale(1.5);
lshape.enableAutoRotation(false);
lshape.resetRotation();

// Clean up when done
lshape.destroy();
*/

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LShapeRenderer;
}

// Also make it available globally
if (typeof window !== 'undefined') {
    window.LShapeRenderer = LShapeRenderer;
}