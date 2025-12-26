---
description: cl-form 布局与交互
globs: *.tsx, *.ts, *.vue
---

## 内嵌CRUD 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>crud</el-tag>
			<span>内嵌CRUD</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['form/crud.vue']" />

			<!-- 自定义表单组件 -->
			<cl-form ref="Form">
				<template #slot-crud>
					<cl-crud ref="Crud" border>
						<cl-row>
							<!-- 刷新按钮 -->
							<cl-refresh-btn />
							<!-- 新增按钮 -->
							<cl-add-btn />
							<!-- 删除按钮 -->
							<cl-multi-delete-btn />
							<cl-flex1 />
							<!-- 关键字搜索 -->
							<cl-search-key placeholder="搜索姓名、手机号" />
						</cl-row>

						<cl-row>
							<!-- 数据表格 -->
							<cl-table ref="Table" />
						</cl-row>

						<cl-row>
							<cl-flex1 />
							<!-- 分页控件 -->
							<cl-pagination />
						</cl-row>

						<!-- 新增、编辑 -->
						<cl-upsert ref="Upsert" />
					</cl-crud>
				</template>
			</cl-form>
		</div>

		<div class="f">
			<span class="date">2024-01-01</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useCrud, useForm, useTable, useUpsert } from '@cool-vue/crud';

// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			label: '姓名',
			prop: 'name',
			component: {
				name: 'el-input'
			}
		},
		{
			label: '创建时间',
			prop: 'createTime',
			component: {
				name: 'el-date-picker'
			}
		}
	]
});

// cl-table
const Table = useTable({
	autoHeight: false,
	columns: [
		{
			type: 'selection'
		},
		{
			label: '姓名',
			prop: 'name',
			minWidth: 140
		},
		{
			label: '手机号',
			prop: 'phone',
			minWidth: 140
		},
		{
			type: 'op'
		}
	]
});

// cl-crud
const Crud = useCrud(
	{
		service: 'test'
	},
	app => {
		app.refresh({
			size: 10
		});
	}
);

const Form = useForm();

function open() {
	Form.value?.open({
		title: '内嵌CRUD',
		props: {
			labelPosition: 'top'
		},
		dialog: {
			height: '70vh',
			width: '1000px'
		},
		items: [
			{
				label: '姓名',
				prop: 'name',
				component: {
					name: 'el-input',
					props: {
						placeholder: '请填写姓名'
					}
				},
				rules: {
					required: true,
					message: '姓名不能为空'
				}
			},
			{
				label: '内嵌 cl-crud',
				component: {
					name: 'slot-crud'
				}
			}
		],
		on: {
			submit() {
				Form.value?.close();
			}
		}
	});
}
</script>

```

## 组件禁用 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>disabled</el-tag>
			<span>组件禁用</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['form/disabled.vue']" />

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
		title: '组件禁用',
		items: [
			{
				label: '账号',
				prop: 'account',
				component: {
					name: 'el-input',
					props: {
						// 设置 boolean 值控制组件的禁用状态（前提是组件支持这个参数，element 的组件几乎都有）
						disabled: true
					}
				}
			},
			{
				label: '密码',
				prop: 'password',
				component: {
					name: 'el-input'
				}
			}
		],
		on: {
			open() {
				// 通用 setProps 方法去设置 disabled, 1.5s后禁用
				setTimeout(() => {
					Form.value?.setProps('password', { disabled: true });
				}, 1500);
			},

			submit(data, { close }) {
				close();
			}
		}
	});
}
</script>

```

## 组件事件 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>event</el-tag>
			<span>组件事件</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['form/event.vue']" />

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
import { ElMessage } from 'element-plus';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '组件事件',
		items: [
			{
				label: '账号',
				prop: 'account',
				component: {
					name: 'el-input',
					props: {
						// 组件内 emit 的用 on[name] 接收，如 onChange、onInput、onBlur 等
						// 前提是组件内有触发事件
						onBlur() {
							ElMessage.info('账号检查中');
						}
					}
				}
			},
			{
				label: '是否实名',
				prop: 'status',
				value: 1,
				component: {
					name: 'el-radio-group',
					options: [
						{
							label: '关闭',
							value: 0
						},
						{
							label: '开启',
							value: 1
						}
					],
					props: {
						// 值改变事件
						onChange(val: number) {
							if (val == 1) {
								// 显示表单项
								Form.value?.showItem('idcard');
							} else {
								// 隐藏表单项
								Form.value?.hideItem('idcard');
								// 清空值
								Form.value?.setForm('idcard', undefined);
							}
						}
					}
				}
			},
			{
				label: '身份证',
				prop: 'idcard',
				component: {
					name: 'el-input'
				}
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

## 分组显示 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>group</el-tag>
			<span>分组显示</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['form/group.vue']" />

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
		title: '分组显示',
		items: [
			{
				//【很重要】必须为 tabs
				type: 'tabs',
				props: {
					// 分组样式
					type: 'card',
					// 分组列表，必须是 { label, value } 的数组格式
					labels: [
						{
							label: '基础信息', // 标题
							value: 'base' // 唯一标识
						},
						{
							label: '认证信息',
							value: 'auth'
						}
					]
				}
			},
			// 基础信息
			{
				group: 'base', // 标识
				label: '账号',
				prop: 'account',
				required: true,
				component: {
					name: 'el-input'
				}
			},
			{
				group: 'base', // 标识
				label: '密码',
				prop: 'password',
				required: true,
				component: {
					name: 'el-input'
				}
			},

			// 其他信息 group = other
			{
				group: 'auth', // 标识
				label: '身份证',
				prop: 'idcard',
				required: true,
				component: {
					name: 'el-input'
				}
			},
			{
				group: 'auth', // 标识
				label: '学校',
				prop: 'school',
				component: {
					name: 'el-input'
				}
			},
			{
				group: 'auth', // 标识
				label: '专业',
				prop: 'major',
				component: {
					name: 'el-input'
				}
			}
		],
		on: {
			//【提示】当第一组验证通过后，会自动切换到下一组展示，直到全部通过才可提交
			submit(data, { close }) {
				close();
			}
		}
	});
}
</script>

```

## 隐藏/显示 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>hidden</el-tag>
			<span>隐藏/显示</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['form/hidden.vue']" />

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
		title: '隐藏/显示',
		items: [
			{
				label: '状态',
				prop: 'status',
				value: 0,
				component: {
					name: 'el-radio-group',
					options: [
						{
							label: '关闭',
							value: 0
						},
						{
							label: '开启',
							value: 1
						}
					]
				}
			},
			{
				label: '账号',
				prop: 'account',
				component: {
					name: 'el-input'
				}
			},
			{
				//【很重要】是否隐藏
				hidden({ scope }) {
					// scope 为表单值
					// 返回一个 boolean 来控制当前表单项的隐藏/显示
					return scope.status != 1;
				},
				label: '密码',
				prop: 'password',
				component: {
					name: 'el-input'
				}
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

## 布局 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>layout</el-tag>
			<span>布局</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['form/layout.vue']" />

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
		title: '布局',
		items: [
			{
				//【span】参考文档：https://element-plus.gitee.io/zh-CN/component/layout.html
				// 使用 1/24 分栏，默认 24
				span: 12,
				label: '昵称',
				prop: 'nickname',
				component: {
					name: 'el-input'
				}
			},
			{
				span: 12,
				label: '手机号',
				prop: 'phone',
				component: {
					name: 'el-input',
					props: {
						maxlength: 11
					}
				}
			},
			{
				//【flex】使宽度不填充满
				flex: false,
				label: '标签',
				prop: 'label',
				component: {
					name: 'el-input'
				}
			},
			{
				label: '状态',
				prop: 'status',
				value: 1,
				component: {
					name: 'el-radio-group',
					options: [
						{
							label: '开启',
							value: 1
						},
						{
							label: '关闭',
							value: 0
						}
					]
				}
			},
			{
				label: '备注',
				prop: 'remark',
				component: {
					name: 'el-input',
					props: {
						type: 'textarea',
						rows: 4
					}
				}
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
