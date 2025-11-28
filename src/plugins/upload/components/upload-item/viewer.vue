<template>
	<div class="viewer-image">
		<!-- 图片 -->
		<el-image-viewer v-if="img.visible" :url-list="[img.url]" infinite teleported @close="close" />
	</div>

	<!-- Excel -->
	<excel ref="excel" />

	<!-- PDF -->
	<pdf ref="pdf" />

	<!-- Word -->
	<docx ref="docx" />

	<!-- PPT -->
	<pptx ref="pptx" />
</template>

<script lang="ts" setup>
defineOptions({
	name: 'file-viewer'
});

import { reactive, ref } from 'vue';
import { getType } from '/#/upload';
import Excel from './excel.vue';
import Pdf from './pdf.vue';
import Docx from './docx.vue';
import Pptx from './pptx.vue';

// 图片预览
const img = reactive({
	visible: false,
	url: ''
});

// Excel
const excel = ref();

// PDF
const pdf = ref();

// Word
const docx = ref();

// PPT
const pptx = ref();

// 打开
async function open(item: Upload.Item) {
	if (item?.type) {
		// 链接
		const url = item.url || '';

		// 类型
		const type = getType(url);

		// 图片预览
		if (type == 'image') {
			img.visible = true;
			img.url = url;

			return true;
		}

		// 表格预览 (@vue-office/excel)
		if (['excel', 'xls', 'xlsx', 'csv'].includes(type)) {
			excel.value?.open(url);
			return true;
		}

		// PDF 预览
		if (type == 'pdf') {
			pdf.value?.open(url);
			return true;
		}

		// Word 文档预览
		if (type == 'word') {
			docx.value?.open(url);
			return true;
		}

		// PPT 文档预览
		if (type == 'ppt') {
			pptx.value?.open(url);
			return true;
		}

		window.open(item.url);
	}
}

// 关闭
function close() {
	img.visible = false;
}

defineExpose({
	open
});
</script>

<style lang="scss" scoped>
.viewer-image {
	position: absolute;
}
</style>
