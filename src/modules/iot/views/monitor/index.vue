<template>
	<div class="iot-monitor">
		<div class="content">
			<div class="scene-wrapper">
				<io-t-scene :stations="stations" :products="products" />
			</div>

			<div class="panel-wrapper">
				<div class="controls-card">
					<el-select v-model="currentLineId" :placeholder="t('选择产线')" @change="refreshData"
						style="width: 100%; margin-bottom: 10px;">
						<el-option v-for="item in lineList" :key="item.id" :label="item.name" :value="item.id" />
					</el-select>
					<el-button type="primary" @click="refreshData" style="width: 100%;">{{ t("刷新数据") }}</el-button>
				</div>

				<el-card class="status-card" :title="t('生产日志')">
					<template #header>
						<div class="card-header">
							<span>{{ t("生产日志") }}</span>
						</div>
					</template>
					<div class="log-list">
						<div v-for="log in logs" :key="log.id" class="log-item">
							<span class="time">{{ log.createTime }}</span>
							<span class="message">{{ log.dataPayload }}</span>
						</div>
					</div>
				</el-card>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCool } from '/@/cool';
import { config, isDev } from '/@/config';
import IoTScene from '../../components/IoTScene.vue';
import { ElMessage } from 'element-plus';

const { t } = useI18n();
const { service } = useCool();
const currentLineId = ref<number>();
const lineList = ref<any[]>([]);
const stations = ref<any[]>([]);
const products = ref<any[]>([]);
const logs = ref<any[]>([]);

// 状态计算
const productCount = computed(() => products.value.length);

async function loadLines() {
	try {
		// 获取产线列表
		lineList.value = await service.iot.production_line.list();
		if (lineList.value.length > 0) {
			currentLineId.value = lineList.value[0].id;
			refreshData();
		}
	} catch (err) {
		console.error('Failed to load production lines:', err);
		ElMessage.error(t('获取产线列表失败'));
	}
}

async function refreshData() {
	if (!currentLineId.value) return;

	try {
		// 并行加载数据
		const [stationList, productList, logRes] = await Promise.all([
			service.iot.station.list({ lineId: currentLineId.value }),
			service.iot.product.list({ status: 0 }), // 0: 在线
			service.iot.production_log.page({ page: 1, size: 10, order: 'createTime', sort: 'desc' })
		]);

		stations.value = stationList;
		products.value = productList;
		logs.value = logRes.list;
	} catch (err) {
		console.error('Failed to refresh data:', err);
		// 不频繁弹窗，仅 log
	}
}

const ws = ref<WebSocket | null>(null);
let reconnectTimer: any = null;
let shouldReconnect = true; // 控制是否应该自动重连

function disconnectWebSocket() {
	shouldReconnect = false;
	if (reconnectTimer) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}
	if (ws.value) {
		ws.value.close();
		ws.value = null;
	}
	console.log('IoT WebSocket manually disconnected');
}

function getWebSocketUrl() {
	// 开发环境通常代理到 8001，WS 端口可能相同或不同
	// 这里假设后端 WS 服务与 API 服务同域，或约定了特定端口 (如 8002)
	// 如果 config.host 是 http://127.0.0.1:8001

	let wsUrl = '';

	if (isDev) {
		// 开发环境：尝试使用 config.host 或硬编码的回退
		// 注意：如果 Cool Admin 后端分离，通常 WS 需要显式配置
		// 暂时保留 :8002 作为默认开发端口，但允许通过配置覆盖
		wsUrl = 'ws://127.0.0.1:8002'; // 默认 Midway WS 端口
	} else {
		// 生产环境：使用当前域名，协议转为 ws/wss
		const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
		wsUrl = `${protocol}//${location.host}/socket`; // 生产环境通常通过 Nginx 转发 /socket
	}

	return wsUrl;
}

function connectWebSocket() {
	if (ws.value) return;

	const url = getWebSocketUrl();
	console.log('Connecting to WebSocket:', url);

	ws.value = new WebSocket(url);

	ws.value.onopen = () => {
		console.log('Connected to IoT WebSocket');
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}
	};

	ws.value.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);

			// 处理数据更新
			if (data.type === 'update') {
				// 格式: { type: "update", stations: [...], products: [...] }
				if (data.stations) {
					stations.value = data.stations;
				}
				if (data.products) {
					products.value = data.products;
				}
			} else if (Array.isArray(data)) {
				// 兼容简单数组推送，认为是产品列表
				products.value = data;
			}
		} catch (error) {
			console.error('Failed to parse WebSocket message:', error);
		}
	};

	ws.value.onclose = () => {
		console.log('IoT WebSocket disconnected');
		ws.value = null;
		// 只有在 shouldReconnect 为 true 时才自动重连
		if (shouldReconnect) {
			reconnectTimer = setTimeout(() => {
				console.log('Retrying WebSocket connection...');
				connectWebSocket();
			}, 5000);
		}
	};

	ws.value.onerror = (error) => {
		console.error('WebSocket error:', error);
	};
}

onMounted(() => {
	loadLines();
	connectWebSocket();
});

onUnmounted(() => {
	disconnectWebSocket();
});
</script>

<style lang="scss" scoped>
.iot-monitor {
	padding: 20px;
	height: 100%;
	display: flex;
	flex-direction: column;

	.content {
		flex: 1;
		display: flex;
		gap: 20px;
		height: 100%; // 确保占满
		min-height: 0;

		.scene-wrapper {
			flex: 1;
			background: #fff;
			border-radius: 8px;
			padding: 0; // 去掉 padding，让 3D 场景完全填充
			box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
			overflow: hidden;
		}

		.panel-wrapper {
			width: 320px;
			display: flex;
			flex-direction: column;
			gap: 20px;

			.controls-card {
				background: transparent;
				border-radius: 8px;
				padding: 20px;
				box-shadow: none;
			}

			.status-card {
				flex: 1;
				display: flex;
				flex-direction: column;
				min-height: 0; // 允许 flex 子项缩小

				:deep(.el-card__body) {
					flex: 1;
					overflow-y: auto;
					min-height: 0;
					padding-top: 0;
				}

				.log-list {
					.log-item {
						border-bottom: 1px solid #ebeef5;
						padding: 10px 0;
						font-size: 13px;
						display: flex;
						flex-direction: column;
						gap: 4px;

						.time {
							color: #909399;
							font-size: 12px;
						}

						.message {
							color: #303133;
							line-height: 1.4;
						}
					}
				}
			}
		}
	}
}
</style>
