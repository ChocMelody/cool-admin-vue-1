---
description: cl-form 组件示例
globs: *.tsx, *.ts, *.vue
---
## 层级显示 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>children</el-tag>
			<span>层级显示</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['form/children.vue']" />

			<!-- 自定义表单组件 -->
			<cl-form ref="Form"></cl-form>
		</div>

		<div class="f">
			<span class="date">2024-01-01</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '层级显示',
		items: [
			{
				label: '姓名',
				prop: 'name',
				component: {
					name: 'el-input'
				}
			},
			{
				label: '年龄',
				prop: 'age',
				value: 18,
				component: {
					name: 'el-input-number'
				}
			},

			// 基础信息
			{
				component: {
					//【很重要】使用 cl-form-card 组件渲染，也可以使用自定义
					name: 'cl-form-card',
					props: {
						// 标题
						label: '基础信息',
						// 是否展开，默认 true
						expand: true
					}
				},
				children: [
					{
						label: '账号',
						prop: 'account',
						component: {
							name: 'el-input'
						}
					},
					{
						label: '密码',
						prop: 'password',
						component: {
							name: 'el-input'
						}
					}
				]
			},

			// 其他信息
			{
				component: {
					name: 'cl-form-card',
					props: {
						label: '其他信息',
						expand: false
					}
				},
				children: [
					{
						label: '身份证',
						prop: 'idcard',
						component: {
							name: 'el-input'
						}
					},
					{
						label: '学校',
						prop: 'school',
						component: {
							name: 'el-input'
						}
					},
					{
						label: '专业',
						prop: 'major',
						component: {
							name: 'el-input'
						}
					}
				]
			}
		],
		on: {
			submit(data, { close }) {
				close();
			}
		}
	});
}
</script>

```

## 组件渲染 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>component</el-tag>
			<span>组件渲染</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code
				:files="[
					'form/component/index.vue',
					'form/component/select-labels.vue',
					'form/component/select-status.vue',
					'form/component/select-work.vue',
					'form/component/select-work2.vue'
				]"
			/>

			<!-- 自定义表单组件 -->
			<cl-form ref="Form">
				<!-- 年龄插槽 -->
				<template #slot-age="{ scope }">
					<!-- scope 为表单值 -->
					<el-input-number v-model="scope.age" :min="18" :max="100"></el-input-number>
				</template>
			</cl-form>
		</div>

		<div class="f">
			<span class="date">2024-01-01</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';
import { ElMessage } from 'element-plus';
import SelectWork from './select-work2.vue';
import SelectLabels from './select-labels.vue';
import SelectStatus from './select-status.vue';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '组件配置',

		items: [
			{
				label: '昵称',
				prop: 'name',
				// 组件配置方式1：标签名（方便，但是不建议组件全局注册）
				value: '神仙',
				component: {
					// 必须是“全局注册”的组件名，如 element-plus 的 el-input、el-date-picker 等
					name: 'el-input'
				}
			},
			{
				label: '手机号',
				prop: 'phone',
				value: '13255022000',
				component: {
					name: 'el-input',
					// 自定义插槽
					slots: {
						prepend() {
							return '+86';
						}
					}
				}
			},
			{
				label: '年龄',
				prop: 'age',
				// 组件配置方式2：插槽（万能，就是代码多写点）
				value: 18,
				component: {
					// 必须是 "slot-" 开头
					name: 'slot-age'
				}
			},
			// -- start 组件配置方式3：组件实例（不想全局注册，但又想组件化）
			{
				label: '工作',
				prop: 'work',
				value: '设计',
				component: {
					// 双向绑定
					vm: SelectWork
				}
			},
			{
				label: '标签',
				prop: 'labels',
				value: ['多金', '深情'],
				component: {
					// scope[prop]绑定
					vm: SelectLabels
				}
			},
			{
				label: '状态',
				prop: 'status',
				value: 1,
				component: {
					// useForm 绑定
					vm: SelectStatus
				}
			}
			// -- end
		],
		on: {
			submit(data, { close }) {
				ElMessage.info(
					`${data.name || '无名'}（${data.age || 18}岁）工作：${data.work || '无'}`
				);
				close();
			}
		}
	});
}
</script>

```

## select-labels 示例

```vue
<template>
	<!--【很重要】直接绑定表单值 scope[prop] -->
	<!-- !符号，只是为了类型提示不错误 -->
	<el-select v-model="scope[prop!]" multiple>
		<el-option
			v-for="(item, index) in list"
			:key="index"
			:label="item.label"
			:value="item.label"
		/>
	</el-select>
</template>

<!--【很重要】必须要有name，避免注册后和其他冲突 -->
<script setup lang="ts">
defineOptions({
	name: 'select-labels'
});

import { ref } from 'vue';

const props = defineProps({
	scope: null, // 表单值
	prop: String // 表单项配置的 prop
});

// 选项列表
const list = ref<{ label: string; value: string }[]>([
	{
		label: '帅气',
		value: '帅气' // 测试直接使用label，真实情况可能是1，2，3，4或者id
	},
	{
		label: '多金',
		value: '多金'
	},
	{
		label: '深情',
		value: '深情'
	}
]);
</script>

```

## select-status 示例

```vue
<template>
	<!--【很重要】直接绑定status，或者使用 form[prop!] -->
	<el-radio-group v-model="form.status">
		<el-radio v-for="(item, index) in list" :key="index" :value="item.value">
			{{ item.label }}
		</el-radio>
	</el-radio-group>
</template>

<!--【很重要】必须要有name，避免注册后和其他冲突 -->
<script setup lang="ts">
defineOptions({
	name: 'select-status'
});

import { useForm } from '@cool-vue/crud';
import { computed, ref } from 'vue';

const props = defineProps({
	scope: null, // 表单值
	prop: String // 表单项配置的 prop
});

// 使用 useForm，能直接获取到上级的表单实例，
// 比如操作表单的 Form.value?.submit、Form.value?.close等
// 获取表单值，Form.value?.form
const Form = useForm();

// 表单值，包一层不会太难受
const form = computed(() => Form.value?.form || {});

// 选项列表
const list = ref<{ label: string; value: number }[]>([
	{
		label: '很好',
		value: 1
	},
	{
		label: '不舒服',
		value: 2
	},
	{
		label: '要嘎了',
		value: 3
	}
]);
</script>

```

## select-work 示例

```vue
<template>
	<el-select v-model="active" @change="onChange">
		<el-option
			v-for="(item, index) in list"
			:key="index"
			:label="item.label"
			:value="item.label"
		/>
	</el-select>
</template>

<!-- 【很重要】必须要有name，避免注册后和其他冲突 -->
<script setup lang="ts">
defineOptions({
	name: 'select-work'
});

import { ref, watch } from 'vue';

const props = defineProps({
	modelValue: String
});

const emit = defineEmits(['update:modelValue', 'change']);

//【很重要】绑定值
// 这种方式虽然麻烦，但是可扩展性高，一些复杂的数据结构可以按这种方式绑定值
const active = ref();

// 选项列表
const list = ref<{ label: string; value: string }[]>([
	{
		label: '倒茶',
		value: '倒茶' // 测试直接使用label，真实情况可能是1，2，3，4或者id
	},
	{
		label: '设计',
		value: '设计'
	},
	{
		label: '开发',
		value: '开发'
	}
]);

//【很重要】更新绑定值，表单提交才能得到选择后的
function onChange(val: string) {
	emit('update:modelValue', val);
	emit('change', val);
}

//【很重要】使用监听的方式，避免表单打开数据是异步获取的情况
watch(
	() => props.modelValue,
	val => {
		// 设置选中的值
		active.value = val;
	},
	{
		immediate: true
	}
);
</script>

```

## select-work2 示例

```vue
<template>
	<el-select v-model="active">
		<el-option
			v-for="(item, index) in list"
			:key="index"
			:label="item.label"
			:value="item.label"
		/>
	</el-select>
</template>

<!-- 【很重要】必须要有name，避免注册后和其他冲突 -->
<script setup lang="ts">
defineOptions({
	name: 'select-work2'
});

import { ref, useModel } from 'vue';

const props = defineProps({
	modelValue: String
});

//【很重要】绑定值，使用 useModel 的方式双向绑定
const active = useModel(props, 'modelValue');

// 选项列表
const list = ref<{ label: string; value: string }[]>([
	{
		label: '倒茶',
		value: '倒茶' // 测试直接使用label，真实情况可能是1，2，3，4或者id
	},
	{
		label: '设计',
		value: '设计'
	},
	{
		label: '开发',
		value: '开发'
	}
]);
</script>

```

## 参数配置 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>config</el-tag>
			<span>参数配置</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['form/config.vue']" />

			<!-- 自定义表单组件 -->
			<cl-form ref="Form">
				<!-- 按钮插槽 -->
				<template #slot-btns>
					<el-button type="danger">按钮插槽</el-button>
				</template>
			</cl-form>
		</div>

		<div class="f">
			<span class="date">2024-01-01</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useForm } from '@cool-vue/crud';
import { ElMessage } from 'element-plus';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '参数配置',

		// 打开是否重置表单
		isReset: false,

		// 默认表单值
		form: {
			nickName: '神仙都没用'
		},

		// 表单配置
		props: {
			// 标签宽度
			labelWidth: '120px',

			// 标签位置
			labelPosition: 'top'
		},

		// 窗口的高。配置后，在窗口内部滚动。默认整个页面滚动
		height: '60vh',

		// 窗口的宽，默认 50%
		width: '60%',

		// 窗口设置
		dialog: {
			// 是否隐藏头部
			hideHeader: false,

			// 顶部操作按钮，默认["fullscreen", "close"]
			// fullscreen 全屏
			// close 关闭
			controls: ['close']
		},

		// 底部操作按钮
		op: {
			// 默认靠右布局
			justify: 'flex-end',

			// 保存按钮文字
			saveButtonText: '提交',

			// 关闭按钮文字
			closeButtonText: '关闭',

			// 是否隐藏
			hidden: false,

			// 按钮配置
			buttons: [
				// 自定义
				{
					label: '自定义按钮',
					onClick() {
						ElMessage.success('自定义按钮点击');
					}
				},
				// close 关闭
				'close',
				// save 保存
				'save',
				// 插槽使用，配合 template，往上看 cl-form 组件
				'slot-btns'
			]
		},

		// 表单项配置
		items: [
			{
				label: '昵称',
				prop: 'nickName',
				component: {
					name: 'el-input'
				}
			}
		],

		// 事件
		on: {
			submit(data, { close }) {
				close();
			}
		}
	});
}
</script>

```
