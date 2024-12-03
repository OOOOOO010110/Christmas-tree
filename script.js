let scene, camera, renderer, treeParticles, snowflakes, heartParticles;

// 创建分层圣诞树
function createLayeredTree() {
    treeParticles = [];
    const layerCount = 25; // 层数
    const baseRadius = 15;
    const treeHeight = 30;
    const startY = -6;

    for (let layer = 0; layer < layerCount; layer++) {
        const geometry = new THREE.BufferGeometry();
        const heightPercent = layer / layerCount;
        const y = startY + treeHeight * heightPercent;
        
        // 计算当前层的特征
        const currentRadius = baseRadius * (1 - Math.pow(heightPercent, 0.7));
        const particleCount = Math.floor(2000 * (1 - heightPercent * 0.5));
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        // 在当前层创建粒子分布
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const angle = (i / particleCount) * Math.PI * 2 * 8;
            
            // 计算基础半径，添加随机变化
            const radiusVariation = Math.random() * 0.3;
            const radius = currentRadius * (0.7 + radiusVariation);
            
            positions[i3] = Math.cos(angle) * radius * (1 + Math.random() * 0.1);
            positions[i3 + 1] = y + (Math.random() - 0.5) * 0.5;
            positions[i3 + 2] = Math.sin(angle) * radius * (1 + Math.random() * 0.1);
            
            // 设置颜色
            const baseColor = new THREE.Color(0xff9ecd);
            const topColor = new THREE.Color(0xffffff);
            const mixRatio = heightPercent + Math.random() * 0.2;
            const color = new THREE.Color().lerpColors(baseColor, topColor, mixRatio);
            
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.15 + Math.random() * 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData = {
            originalPositions: positions.slice(),
            layer: layer,
            heightPercent: heightPercent
        };
        
        scene.add(particles);
        treeParticles.push(particles);
    }
}

// 创建雪花
function createSnowflakes() {
    const snowflakeCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(snowflakeCount * 3);
    const colors = new Float32Array(snowflakeCount * 3);

    for (let i = 0; i < snowflakeCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 100;
        positions[i3 + 1] = Math.random() * 100; // 从顶部开始
        positions[i3 + 2] = (Math.random() - 0.5) * 100;

        const color = new THREE.Color(0xffffff);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    snowflakes = new THREE.Points(geometry, material);
    scene.add(snowflakes);
}

// 创建更清晰的粒子爱心
function createHeart() {
    const heartGeometry = new THREE.BufferGeometry();
    const particleCount = 5000; // 增加粒子数量
    const vertices = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // 创建心形轮廓和填充
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        let x, y, z;

        if (i < particleCount * 0.7) { // 70% 的粒子用于轮廓
            const t = (i / (particleCount * 0.7)) * Math.PI * 2;
            const scale = 0.15;
            
            // 心形方程
            x = 16 * Math.pow(Math.sin(t), 3);
            y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            z = Math.cos(t * 2) * 2; // 添加深度
            
            x *= scale;
            y *= scale;
            z *= scale * 0.3;
        } else { // 30% 的粒子用于填充
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 1.5;
            const heightScale = 0.15;
            
            x = radius * Math.cos(angle) * heightScale;
            y = radius * Math.sin(angle) * heightScale;
            z = (Math.random() - 0.5) * heightScale;
        }

        // 调整位置到树顶
        vertices[i3] = x;
        vertices[i3 + 1] = y + 25; // 确保在树顶
        vertices[i3 + 2] = z;

        // 创建渐变色效果
        const color = new THREE.Color(0xff69b4);
        color.lerp(new THREE.Color(0xffffff), Math.random() * 0.3);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    heartGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    heartGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const heartMaterial = new THREE.PointsMaterial({
        size: 0.08, // 减小粒子大小使形状更清晰
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    heartParticles = new THREE.Points(heartGeometry, heartMaterial);
    scene.add(heartParticles);
}

// 动画更新函数
function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    // 更新树的动画
    treeParticles.forEach((particles, index) => {
        const positions = particles.geometry.attributes.position.array;
        const originalPositions = particles.userData.originalPositions;
        const heightPercent = particles.userData.heightPercent;
        
        // 基础旋转
        particles.rotation.y = time * 0.1 + heightPercent * Math.PI;
        
        // 为每个粒子添加动画
        for (let i = 0; i < positions.length; i += 3) {
            const waveX = Math.sin(time * 2 + heightPercent * 10) * 0.1;
            const waveZ = Math.cos(time * 2 + heightPercent * 10) * 0.1;
            
            positions[i] = originalPositions[i] + waveX * (1 - heightPercent);
            positions[i + 1] = originalPositions[i + 1] + Math.sin(time * 3 + i * 0.1) * 0.05;
            positions[i + 2] = originalPositions[i + 2] + waveZ * (1 - heightPercent);
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
    });

    // 更新爱心动画
    if (heartParticles) {
        heartParticles.rotation.y = Math.sin(time * 0.5) * 0.2;
        const positions = heartParticles.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const originalY = positions[i + 1] - 25;
            const pulseOffset = Math.sin(time * 2 + i * 0.1) * 0.05;
            
            positions[i] *= 1 + pulseOffset * 0.1;
            positions[i + 1] = originalY + Math.sin(time * 3 + i) * 0.05 + 25;
            positions[i + 2] *= 1 + pulseOffset * 0.1;
        }
        heartParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 更新雪
    if (snowflakes) {
        const positions = snowflakes.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] -= 0.1;
            if (positions[i + 1] < -50) positions[i + 1] = 50;
            positions[i] += Math.sin(time + i) * 0.01;
        }
        snowflakes.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

// 初始化场景
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 40); // 确保相机在合适的位置

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createLayeredTree();
    createSnowflakes();
    createHeart(); // 创建爱心粒子
    animate();
}

// 窗口大小调整处理
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('load', init);