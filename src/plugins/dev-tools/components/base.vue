<template>
    <div class="dt-base">
        <div class="item">
            <span>{{ t('登录需要验证码') }}</span>
            <el-switch v-model="captcha" @change="onChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storage } from '/@/cool';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 默认为 true
const captcha = ref(storage.get('devTools.captcha') !== false);

function onChange(val: any) {
    storage.set('devTools.captcha', val);
}
</script>

<style lang="scss" scoped>
.dt-base {
    .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        background-color: var(--el-fill-color-lighter);
        padding: 10px;
        border-radius: 8px;
        font-size: 14px;
    }
}
</style>
