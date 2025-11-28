<template>
	<div class="viewer-image">
		<!-- 图片 -->
		<el-image-viewer
			v-if="img.visible"
			:url-list="[img.url]"
			infinite
			teleported
			@close="close"
		/>
	</div>

	<!-- Univer -->
	<excel ref="excel" />

	<!-- PDF -->
	<pdf ref="pdf" />

	<!-- 文档 -->
	<cl-dialog
		v-model="doc.visible"
		:title="$t('文档预览')"
		height="70vh"
		width="80%"
		:scrollbar="false"
	>
		<div v-loading="doc.loading" class="viewer-doc">
			<iframe :ref="setRefs('docIframe')" :src="doc.url" />
		</div>
	</cl-dialog>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'file-viewer'
});

import { reactive, nextTick, ref } from 'vue';
import { getType } from '/#/upload';
import { useCool } from '/@/cool';
import Excel from './excel.vue';
import Pdf from './pdf.vue';

const { refs, setRefs } = useCool();

// 图片预览
const img = reactive({
	visible: false,
	url: ''
});

// 文档预览
const doc = reactive({
	visible: false,
	loading: false,
	url: ''
});

// Excel
const excel = ref();

// PDF
const pdf = ref();

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

		// 表格预览 (Univer)
		if (['excel', 'xls', 'xlsx', 'csv'].includes(type)) {
			excel.value?.open(url);
			return true;
		}

		// PDF 预览
		if (type == 'pdf') {
			pdf.value?.open(url);
			return true;
		}

		// 文档预览
		if (['word', 'ppt'].includes(type)) {
			doc.visible = true;
			doc.loading = true;
			doc.url = `https://view.officeapps.live.com/op/view.aspx?src=${decodeURIComponent(url)}`;

			nextTick(() => {
				refs.docIframe.onload = () => {
					doc.loading = false;
				};
			});

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

.viewer-doc {
	height: 100%;
	width: 100%;

	iframe {
		border: 0;
		height: 100%;
		width: 100%;
	}
}
</style>