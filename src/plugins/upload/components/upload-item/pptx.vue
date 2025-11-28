<template>
	<cl-dialog v-model="visible" :title="$t('幻灯片预览')" fullscreen :scrollbar="false" @closed="onClosed">
		<div v-loading="loading" class="pptx-viewer">
			<vue-office-pptx v-if="pptUrl" :src="pptUrl" @rendered="onRendered" @error="onError" />
		</div>
	</cl-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { config } from '/@/config';
import VueOfficePptx from '@vue-office/pptx';

const visible = ref(false);
const loading = ref(false);
const pptUrl = ref('');

function open(url: string) {
	visible.value = true;
	loading.value = true;

	// 处理跨域
	let fetchUrl = url;
	if (config.host && url.startsWith(config.host)) {
		fetchUrl = url.replace(config.host, config.baseUrl);
	}

	pptUrl.value = fetchUrl;
}

function close() {
	visible.value = false;
}

function onRendered() {
	loading.value = false;
}

function onError(error: any) {
	loading.value = false;
	console.error('PPT 文档加载失败:', error);
}

function onClosed() {
	pptUrl.value = '';
	loading.value = false;
}

defineExpose({
	open,
	close
});
</script>

<style lang="scss" scoped>
.pptx-viewer {
	height: 100%;
	width: 100%;
	overflow: auto;

	// 强制覆盖内部组件的固定高度
	:deep(.pptx-preview-wrapper) {
		height: 100% !important;
		min-height: unset !important;
	}
}
</style>
