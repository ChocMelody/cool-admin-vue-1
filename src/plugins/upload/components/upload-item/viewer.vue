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
	<cl-dialog
		v-model="univer.visible"
		:title="$t('表格预览')"
		fullscreen
		:scrollbar="false"
		@closed="onUniverClosed"
	>
		<div id="univer-container" style="height: 100%; width: 100%"></div>
	</cl-dialog>

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

import { reactive, nextTick, onUnmounted } from 'vue';
import { getType } from '../../utils';
import { useCool } from '/@/cool';
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetZhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import '@univerjs/preset-sheets-core/lib/index.css';
import * as XLSX from 'xlsx';

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

// Univer
const univer = reactive({
	visible: false,
	instance: null as any,
	api: null as any
});

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
			univer.visible = true;

			nextTick(() => {
				initUniver(url);
			});

			return true;
		}

		// 文档预览
		if (['word', 'ppt', 'pdf'].includes(type)) {
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

// 初始化 Univer
async function initUniver(url: string) {
	// 销毁旧实例
	if (univer.instance) {
		univer.instance.dispose();
		univer.instance = null;
	}

	// 获取文件流
	const res = await fetch(url);
	const buffer = await res.arrayBuffer();

	// 解析 Excel
	const workbook = XLSX.read(buffer);

	// 转换为 Univer 数据
	const sheets: Record<string, any> = {};
	const sheetOrder: string[] = [];

	workbook.SheetNames.forEach((name) => {
		const sheet = workbook.Sheets[name];
		const id = name;
		sheetOrder.push(id);

		const cellData: Record<number, Record<number, any>> = {};
		const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

		data.forEach((row, r) => {
			if (!cellData[r]) cellData[r] = {};
			row.forEach((cell, c) => {
				cellData[r][c] = { v: cell };
			});
		});

		sheets[id] = {
			id,
			name,
			cellData
		};
	});

	const snapshot = {
		id: 'workbook-01',
		name: 'Excel Preview',
		appVersion: '3.0.0',
		locale: LocaleType.ZH_CN,
		styles: {},
		sheets,
		sheetOrder
	};

	// 创建实例
	const { univer: instance, univerAPI } = createUniver({
		locale: LocaleType.ZH_CN,
		locales: {
			[LocaleType.ZH_CN]: merge(
				{},
				UniverPresetZhCN
			),
		},
		theme: defaultTheme,
		presets: [
			UniverSheetsCorePreset({
				container: 'univer-container',
			}),
		],
	});

	univer.instance = instance;
	univer.api = univerAPI;

	// 创建工作簿
	univer.instance.createUnit(0, snapshot);
}

// Univer 关闭回调
function onUniverClosed() {
	if (univer.instance) {
		univer.instance.dispose();
		univer.instance = null;
	}
}

// 关闭
function close() {
	img.visible = false;
}

onUnmounted(() => {
	onUniverClosed();
});

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
