<template>
	<cl-dialog
		v-model="visible"
		:title="$t('PDF 预览')"
		top="5vh"
		height="85vh"
		width="80%"
		:scrollbar="false"
	>
		<div v-loading="loading" class="viewer-pdf">
			<iframe :src="url" @load="onLoad" />
		</div>
	</cl-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const visible = ref(false);
const url = ref('');
const loading = ref(false);

function open(path: string) {
	loading.value = true;
	url.value = path;
	visible.value = true;
}

function close() {
	visible.value = false;
}

function onLoad() {
	loading.value = false;
}

defineExpose({
	open,
	close
});
</script>

<style lang="scss" scoped>
.viewer-pdf {
	height: 100%;
	width: 100%;

	iframe {
		border: 0;
		height: 100%;
		width: 100%;
	}
}
</style>
