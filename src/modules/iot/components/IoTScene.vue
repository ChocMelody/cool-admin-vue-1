<template>
	<div class="iot-scene-wrapper">
		<!-- 3D 容器 -->
		<div ref="container" class="iot-scene-container"></div>

		<!-- UI 覆盖层 (HUD) -->
		<div class="iot-hud">
			<!-- 顶部状态栏 -->
			<div class="hud-header">
				<div class="title">
					<span class="icon">⚡</span>
					{{ t("智能产线监控中心") }}
				</div>
				<div class="stats">
					<div class="stat-item">
						<span class="label">{{ t("运行状态") }}</span>
						<span class="value active">{{ t("正常运行") }}</span>
					</div>
					<div class="stat-item">
						<span class="label">{{ t("生产效率") }}</span>
						<span class="value">98.5%</span>
					</div>
					<div class="stat-item">
						<span class="label">{{ t("今日产量") }}</span>
						<span class="value number">{{ props.products?.length || 0 }}</span>
					</div>
				</div>
			</div>

			<!-- 底部图例 -->
			<div class="hud-footer">
				<div class="legend-item">
					<span class="dot station"></span> {{ t("工站") }}
				</div>
				<div class="legend-item">
					<span class="dot product"></span> {{ t("在制品") }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const props = defineProps<{
	stations: any[];
	products: any[];
}>();

const container = ref<HTMLElement | null>(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let animationId: number;

const stationMeshes: Map<string, THREE.Group> = new Map();
const productMeshes: Map<string, THREE.Mesh> = new Map();

// 资源复用
const sharedGeometry = {
	station: new THREE.BoxGeometry(2, 0.5, 2),
	product: new THREE.SphereGeometry(0.4, 32, 32)
};

const sharedMaterials = {
	station: new THREE.MeshPhysicalMaterial({
		color: 0x00ffff,
		metalness: 0.8,
		roughness: 0.2,
		transmission: 0.3, // 玻璃质感
		thickness: 1,
		transparent: true,
		opacity: 0.8
	}),
	stationBase: new THREE.MeshStandardMaterial({
		color: 0x1f2b3e,
		roughness: 0.8
	}),
	product: new THREE.MeshStandardMaterial({
		color: 0x67c23a,
		emissive: 0x67c23a,
		emissiveIntensity: 0.5,
		roughness: 0.4,
		metalness: 0.6
	})
};

function init() {
	if (!container.value) return;

	// 1. Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x0a0e17); // 深空黑
	scene.fog = new THREE.FogExp2(0x0a0e17, 0.02); // 雾化增强景深

	// 2. Camera
	camera = new THREE.PerspectiveCamera(
		50, // 稍微广角一点
		container.value.clientWidth / container.value.clientHeight,
		0.1,
		1000
	);
	camera.position.set(15, 12, 15);
	camera.lookAt(0, 0, 0);

	// 3. Renderer
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setSize(container.value.clientWidth, container.value.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	// 开启色调映射，让发光效果更好
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.2;
	container.value.appendChild(renderer.domElement);

	// 4. Lights
	// 环境光 - 暗蓝色调
	const ambientLight = new THREE.AmbientLight(0x223344, 1.5);
	scene.add(ambientLight);

	// 主光源 - 聚光灯
	const mainLight = new THREE.SpotLight(0xffffff, 100);
	mainLight.position.set(20, 30, 10);
	mainLight.angle = Math.PI / 4;
	mainLight.penumbra = 0.5;
	mainLight.castShadow = true;
	mainLight.shadow.mapSize.width = 1024;
	mainLight.shadow.mapSize.height = 1024;
	scene.add(mainLight);

	// 补光 - 蓝色边缘光
	const rimLight = new THREE.DirectionalLight(0x00aaff, 2);
	rimLight.position.set(-10, 10, -10);
	scene.add(rimLight);

	// 5. Grid
	const gridHelper = new THREE.GridHelper(60, 30, 0x334455, 0x112233);
	scene.add(gridHelper);

	// 地面反射平面 (增加科技感)
	const planeGeometry = new THREE.PlaneGeometry(200, 200);
	const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0e17, depthWrite: false });
	const plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.rotation.x = -Math.PI / 2;
	plane.position.y = -0.1;
	scene.add(plane);

	// 6. Controls
	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.maxPolarAngle = Math.PI / 2 - 0.1; // 不允许钻到地下去

	animate();
}

function animate() {
	animationId = requestAnimationFrame(animate);
	controls.update();

	// 材质呼吸
	const time = Date.now() * 0.002;
	productMeshes.forEach(mesh => {
		const mat = mesh.material as THREE.MeshStandardMaterial;
		if (mat.emissiveIntensity !== undefined) {
			mat.emissiveIntensity = 0.5 + Math.sin(time) * 0.3;
		}
	});

	// 位置浮动
	animateProducts();

	renderer.render(scene, camera);
}

function updateStations() {
	if (!scene) return;

	stationMeshes.forEach((mesh) => scene.remove(mesh));
	stationMeshes.clear();

	if (!props.stations || props.stations.length === 0) return;

	props.stations.forEach((station, index) => {
		const group = new THREE.Group();

		// 底座
		const baseGeom = new THREE.CylinderGeometry(1.2, 1.5, 0.5, 32);
		const baseMesh = new THREE.Mesh(baseGeom, sharedMaterials.stationBase);
		baseMesh.castShadow = true;
		baseMesh.receiveShadow = true;
		baseMesh.position.y = 0.25;
		group.add(baseMesh);

		// 核心设备体
		const mesh = new THREE.Mesh(sharedGeometry.station, sharedMaterials.station);
		mesh.position.y = 1.0;
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		group.add(mesh);

		// 光环 (简易)
		const ringGeom = new THREE.TorusGeometry(1.6, 0.05, 16, 100);
		const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4 });
		const ring = new THREE.Mesh(ringGeom, ringMat);
		ring.rotation.x = Math.PI / 2;
		ring.position.y = 0.1;
		group.add(ring);

		// 位置计算
		const x = index * 6 - (props.stations.length * 6) / 2;
		group.position.set(x, 0, 0);

		if (station.position) {
			try {
				const pos = typeof station.position === 'string' ? JSON.parse(station.position) : station.position;
				group.position.set(pos.x ?? x, pos.y ?? 0, pos.z ?? 0);
			} catch (e) { }
		}

		scene.add(group);
		stationMeshes.set(String(station.id), group);
	});
}

function updateProducts() {
	if (!scene) return;

	productMeshes.forEach((mesh) => scene.remove(mesh));
	productMeshes.clear();

	if (!props.products) return;

	// 按站点分组产品，以便计算偏移
	const productsByStation: Record<string, any[]> = {};
	props.products.forEach(p => {
		const sId = String(p.currentStationId);
		if (!productsByStation[sId]) productsByStation[sId] = [];
		productsByStation[sId].push(p);
	});

	props.products.forEach((product) => {
		const mesh = new THREE.Mesh(sharedGeometry.product, sharedMaterials.product.clone());
		// 如果有状态，可以改变颜色
		mesh.castShadow = true;

		const stationIdStr = String(product.currentStationId);
		if (product.currentStationId && stationMeshes.has(stationIdStr)) {
			const stationGroup = stationMeshes.get(stationIdStr);
			if (stationGroup) {
				mesh.position.copy(stationGroup.position);
				mesh.position.y = 2.0; // 基础悬浮高度

				// 计算同站点产品的偏移
				const siblings = productsByStation[stationIdStr];
				const index = siblings.findIndex(p => p.id === product.id);
				if (index > 0) {
					// 简单的环形偏移
					const angle = (index / siblings.length) * Math.PI * 2;
					const radius = 0.8; // 偏移半径
					mesh.position.x += Math.cos(angle) * radius;
					mesh.position.z += Math.sin(angle) * radius;
				}

				// 简单的悬浮动画初始相位
				mesh.userData.yBase = mesh.position.y;
				mesh.userData.phase = Math.random() * Math.PI * 2;
			}
		}

		scene.add(mesh);
		// 存储引用
		productMeshes.set(String(product.id), mesh);
	});
}

// 动画循环中更新产品悬浮位置
function animateProducts() {
	// 已经在 animate 中处理了发光，这里可以加位置浮动
	const time = Date.now() * 0.003;
	productMeshes.forEach(mesh => {
		if (mesh.userData.yBase) {
			mesh.position.y = mesh.userData.yBase + Math.sin(time + mesh.userData.phase) * 0.2;
		}
	});
}




watch(() => props.stations, updateStations, { deep: true });
watch(() => props.products, updateProducts, { deep: true });

onMounted(() => {
	init();
	updateStations();
	updateProducts();
	window.addEventListener("resize", onResize);
});

onUnmounted(() => {
	cancelAnimationFrame(animationId);
	window.removeEventListener("resize", onResize);
	if (container.value && renderer) {
		container.value.removeChild(renderer.domElement);
	}
	// 清理资源...
});

function onResize() {
	if (!container.value) return;
	camera.aspect = container.value.clientWidth / container.value.clientHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(container.value.clientWidth, container.value.clientHeight);
}
</script>

<style scoped lang="scss">
.iot-scene-wrapper {
	position: relative;
	width: 100%;
	height: 100%;
	background: #0a0e17;
	/* 兜底背景 */
	border-radius: 8px;
	overflow: hidden;
}

.iot-scene-container {
	width: 100%;
	height: 100%;
	min-height: 600px;
}

/* HUD 覆盖层 */
.iot-hud {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	/* 让鼠标事件透过，操作 3D 场景 */
	padding: 24px;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.hud-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	pointer-events: auto;
	/* 恢复交互 */

	.title {
		font-size: 24px;
		font-weight: 700;
		color: #fff;
		text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
		display: flex;
		align-items: center;
		gap: 12px;
		background: rgba(16, 26, 43, 0.6);
		backdrop-filter: blur(10px);
		padding: 12px 24px;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);

		.icon {
			color: #00ffff;
		}
	}

	.stats {
		display: flex;
		gap: 16px;
	}

	.stat-item {
		background: rgba(16, 26, 43, 0.6);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 12px 20px;
		border-radius: 8px;
		min-width: 120px;
		display: flex;
		flex-direction: column;
		gap: 4px;

		.label {
			font-size: 12px;
			color: #8b9bb4;
			text-transform: uppercase;
		}

		.value {
			font-size: 18px;
			font-weight: 600;
			color: #fff;
			font-family: 'Consolas', 'Monaco', monospace;

			&.active {
				color: #67c23a;
				text-shadow: 0 0 8px rgba(103, 194, 58, 0.4);
			}

			&.number {
				color: #409eff;
			}
		}
	}
}

.hud-footer {
	display: flex;
	gap: 24px;
	padding: 12px 24px;
	background: rgba(16, 26, 43, 0.4);
	backdrop-filter: blur(4px);
	border-radius: 20px;
	align-self: flex-start;
	pointer-events: auto;

	.legend-item {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #ccc;
		font-size: 14px;

		.dot {
			width: 10px;
			height: 10px;
			border-radius: 50%;

			&.station {
				background: #00ffff;
				box-shadow: 0 0 5px #00ffff;
			}

			&.product {
				background: #67c23a;
				box-shadow: 0 0 5px #67c23a;
			}
		}
	}
}

/* 定义渐入动画 */
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.hud-header,
.hud-footer {
	animation: fadeIn 0.8s ease-out;
}
</style>
