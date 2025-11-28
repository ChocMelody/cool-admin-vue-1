<template>
	<cl-dialog
		v-model="visible"
		:title="$t('表格预览')"
		fullscreen
		:scrollbar="false"
		@opened="onOpened"
		@closed="onClosed"
	>
		<div id="univer-container" style="height: 100%; width: 100%"></div>
	</cl-dialog>
</template>

<script lang="ts" setup>
import { ref, shallowRef, onUnmounted } from 'vue';
import { config } from '/@/config';
import {
	createUniver,
	defaultTheme,
	LocaleType,
	merge,
	UniverInstanceType
} from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetZhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import '@univerjs/preset-sheets-core/lib/index.css';
import * as XLSX from 'xlsx';

const visible = ref(false);
const univerInstance = shallowRef<any>(null);
const univerAPI = shallowRef<any>(null);
const currentUrl = ref('');

function open(url: string) {
	currentUrl.value = url;
	visible.value = true;
}

function close() {
	visible.value = false;
}

// Univer 打开回调
function onOpened() {
	if (currentUrl.value) {
		initUniver(currentUrl.value);
	}
}

// 初始化 Univer
async function initUniver(url: string) {
	// 销毁旧实例
	onClosed();

	// 处理跨域
	let fetchUrl = url;
	if (config.host && url.startsWith(config.host)) {
		fetchUrl = url.replace(config.host, config.baseUrl);
	}

	try {
		// 获取文件流
		const res = await fetch(fetchUrl);
		const buffer = await res.arrayBuffer();

		// 解析 Excel
		const workbook = XLSX.read(buffer);

		// 转换为 Univer 数据
		const sheets: Record<string, any> = {};
		const sheetOrder: string[] = [];

		workbook.SheetNames.forEach(name => {
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
		const { univer, univerAPI: api } = createUniver({
			locale: LocaleType.ZH_CN,
			locales: {
				[LocaleType.ZH_CN]: merge({}, UniverPresetZhCN)
			},
			theme: defaultTheme,
			presets: [
				UniverSheetsCorePreset({
					container: 'univer-container'
				})
			]
		});

		univerInstance.value = univer;
		univerAPI.value = api;

		// 创建工作簿
		// 使用 API 创建更安全
		if (univerAPI.value) {
			univerAPI.value.createUniverSheet(snapshot);
		} else {
			univerInstance.value.createUnit(UniverInstanceType.UNIVER_SHEET, snapshot);
		}
	} catch (e) {
		console.error('Univer init error:', e);
	}
}

// Univer 关闭回调
function onClosed() {
	if (univerInstance.value) {
		try {
			univerInstance.value.dispose();
		} catch (e) {
			console.error('Univer dispose error:', e);
		}
		univerInstance.value = null;
		univerAPI.value = null;
	}
}

onUnmounted(() => {
	onClosed();
});

defineExpose({
	open,
	close
});
</script>

<style lang="scss">
// 解决 Univer 在弹窗中下拉框被遮挡的问题
.el-overlay {
	z-index: 1070 !important;
}
</style>
