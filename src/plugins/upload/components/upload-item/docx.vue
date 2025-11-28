<template>
    <cl-dialog v-model="visible" :title="$t('文档预览')" fullscreen :scrollbar="false" @closed="onClosed">
        <div v-loading="loading" class="docx-viewer">
            <vue-office-docx v-if="docUrl" :src="docUrl" @rendered="onRendered" @error="onError" />
        </div>
    </cl-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { config } from '/@/config';
import VueOfficeDocx from '@vue-office/docx';
import '@vue-office/docx/lib/v3/index.css';

const visible = ref(false);
const loading = ref(false);
const docUrl = ref('');

function open(url: string) {
    visible.value = true;
    loading.value = true;

    // 处理跨域
    let fetchUrl = url;
    if (config.host && url.startsWith(config.host)) {
        fetchUrl = url.replace(config.host, config.baseUrl);
    }

    docUrl.value = fetchUrl;
}

function close() {
    visible.value = false;
}

function onRendered() {
    loading.value = false;
}

function onError(error: any) {
    loading.value = false;
    console.error('Word 文档加载失败:', error);
}

function onClosed() {
    docUrl.value = '';
    loading.value = false;
}

defineExpose({
    open,
    close
});
</script>

<style lang="scss" scoped>
.docx-viewer {
    height: 100%;
    width: 100%;
    overflow: auto;
}
</style>
