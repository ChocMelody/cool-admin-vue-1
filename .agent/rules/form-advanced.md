---
description: cl-form 高级用法
globs: *.tsx, *.ts, *.vue
---

## 起步 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>open</el-tag>
			<span>起步</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['form/open.vue']" />

			<!-- 自定义表单组件 -->
			<!--【很重要】ref 一定要对应 useForm 定义的值 -->
			<cl-form ref="Form"></cl-form>
		</div>

		<div class="f">
			<span class="date">2024-01-01</span>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@cool-vue/crud';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '起步',

		items: [
			{
				label: '昵称',
				// 绑定值的标识，表单提交及回显会自动根据 prop 获取对应的值
				prop: 'nickname',
				// 组件绑定
				component: {
					// 必须是“全局注册”的组件名，如 element-plus 的 el-input、el-date-picker 等
					name: 'el-input',

					// 绑定的组件参数配置，如 clearable、placeholder 等
					// 组件内 emit 的用 on[name] 接收，如 onChange、onInput、onBlur 等
					props: {
						placeholder: '请输入昵称',
						clearable: true,
						onChange(value: string) {}
					}
				}
			},
			{
				prop: 'age',
				component: {
					name: 'el-input-number'
				},
				// 默认值，第一次打开有效
				value: 18
			}
		],
		on: {
			// 打开时触发
			open() {
				console.log(Form.value?.validateField);
			},

			// 关闭时触发。当配置该方法时，关闭事件会被阻断，使用 done() 关闭窗口
			close(action, done) {
				// action 为关闭窗口的触发动作 "save" | "close"
				// done 关闭事件
				done();
			},

			// 提交时触发
			submit(data, { done, close }) {
				// data 为表单值
				// done 关闭加载事件、但不关闭窗口
				// close 关闭窗口

				close();
			}
		}
	});
}
</script>

```

## 选项框配置 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>options</el-tag>
			<span>选项框配置</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['form/options.vue']" />

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
import { computed, reactive } from 'vue';

const Form = useForm();

// 觉得麻烦就 any，如 { user: [] as any[] }
const options = reactive<{ [key: string]: { label: string; value: any }[] }>({
	user: []
});

function open() {
	Form.value?.open({
		title: '选项框配置',
		items: [
			{
				label: '下拉框',
				prop: 'select',
				component: {
					name: 'el-select',
					props: {
						clearable: true // 可清除
					},
					options: [
						{
							label: 'javascript',
							value: 1
						},
						{
							label: 'vue',
							value: 2
						},
						{
							label: 'html',
							value: 3
						},
						{
							label: 'css',
							value: 4
						}
					]
				}
			},
			{
				label: '单选框',
				prop: 'radio',
				value: 1,
				component: {
					name: 'el-radio-group',
					options: [
						{
							label: '手机',
							value: 1
						},
						{
							label: '电脑',
							value: 2
						},
						{
							label: '电视',
							value: 3
						}
					]
				}
			},
			{
				label: '多选框',
				prop: 'checkbox',
				value: [2, 3],
				component: {
					name: 'el-checkbox-group',
					options: [
						{
							label: '咖啡',
							value: 1
						},
						{
							label: '汉堡',
							value: 2
						},
						{
							label: '炸鸡',
							value: 3
						},
						{
							label: '奶茶',
							value: 4
						}
					]
				}
			},
			{
				label: '动态配置1',
				prop: 'd1',
				component: {
					name: 'el-select',
					// 动态设置方法1，在 on.open 事件配置 options
					options: []
				}
			},
			{
				label: '动态配置2',
				prop: 'd2',
				component: {
					name: 'el-select',
					// 动态设置方法2，使用 computed 更新 options
					options: computed(() => options.user)
				}
			}
		],
		on: {
			open() {
				// 模拟 1.5s 后取的数据
				setTimeout(() => {
					// 动态设置方法1，使用 setOptions 方法设置
					// d1 为 prop 值
					Form.value?.setOptions('d1', [
						{
							label: '😊',
							value: 1
						},
						{
							label: '😭',
							value: 2
						},
						{
							label: '😘',
							value: 3
						}
					]);

					// 动态设置方法2，直接设置 options.user，由 computed 更新
					options.user = [
						{
							label: '💰',
							value: 1
						},
						{
							label: '🚗',
							value: 2
						}
					];
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

## 插件的使用 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>plugin</el-tag>
			<span>插件的使用</span>
		</div>

		<div class="c">
			<el-button @click="open('manager')">管理者</el-button>
			<el-button @click="open('user')">用户</el-button>
			<demo-code :files="['form/plugin/index.vue', 'form/plugin/role.ts']" />

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
import { setRole } from './role';

const Form = useForm();

function open(role: string) {
	Form.value?.open(
		{
			title: '插件的使用',

			items: [
				{
					label: '姓名',
					prop: 'name',
					required: true,
					component: {
						name: 'el-input'
					}
				},
				{
					// 自定义参数 role，匹配插件传入的角色
					role: 'user',
					label: '面试职位',
					prop: 'work',
					value: 1,
					component: {
						name: 'el-radio-group',
						options: [
							{
								label: '前端开发',
								value: 1
							},
							{
								label: '后端开发',
								value: 2
							},
							{
								label: 'UI设计',
								value: 3
							}
						]
					}
				},
				{
					role: 'user',
					label: '期望薪资',
					prop: 'salary',
					value: 5000,
					component: {
						name: 'el-input-number',
						props: {
							min: 2000,
							max: 100000
						}
					}
				},
				{
					role: 'manager',
					label: '入职时间',
					prop: 'date',
					component: {
						name: 'el-date-picker'
					}
				},
				{
					role: 'manager',
					label: '负责人',
					prop: 'head',
					component: {
						name: 'el-input'
					}
				}
			],
			on: {
				submit(data, { done, close }) {
					close();
				}
			}
		},
		[
			// 自定义插件，角色权限控制
			setRole(role)
		]
	);
}
</script>

```

## 必填项配置 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>required</el-tag>
			<span>必填项配置</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['form/required.vue']" />

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
		title: '必填项配置',
		items: [
			{
				label: '昵称',
				prop: 'nickname',
				component: {
					name: 'el-input'
				},
				// 是否必填，默认判断绑定值是否空
				required: true
			},
			{
				label: '手机号',
				prop: 'phone',
				component: {
					name: 'el-input',
					props: {
						maxlength: 11
					}
				},
				// 自定义规则
				// 基础用法可参考：https://element-plus.gitee.io/zh-CN/component/form.html
				// 高级用法可参考：https://github.com/yiminghe/async-validator
				rules: [
					{
						required: true,
						validator: (rule, value, callback) => {
							if (value === '') {
								callback(new Error('手机号不能为空'));
							} else if (!/^1[3456789]\d{9}$/.test(value)) {
								callback(new Error('手机号格式错误'));
							} else {
								callback();
							}
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

## 添加/删除表单项 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>rules</el-tag>
			<span>添加/删除表单项</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['form/rules.vue']" />

			<!-- 自定义表单组件 -->
			<cl-form ref="Form">
				<template #slot-cert="{ scope }">
					<div class="cert">
						<!--【很重要】prop、rules 配置格式如下 -->
						<el-form-item
							v-for="(item, index) in scope.cert"
							:key="index"
							:label="`证书${index + 1}`"
							:prop="`cert.${index}.label`"
							:rules="{
								message: `请填写证书${index + 1}`,
								required: true
							}"
						>
							<div class="row">
								<!-- 输入框 -->
								<el-input v-model="item.label" placeholder="请填写证书"></el-input>

								<!-- 删除行 -->
								<el-icon @click="rowDel(index)">
									<delete />
								</el-icon>
							</div>
						</el-form-item>

						<!-- 添加行 -->
						<el-row type="flex" justify="end">
							<el-button @click="rowAdd()">添加证书</el-button>
						</el-row>
					</div>
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
import { Delete } from '@element-plus/icons-vue';

const Form = useForm();

function open() {
	Form.value?.open({
		title: '添加/删除表单项',
		items: [
			{
				label: '昵称',
				prop: 'nickname',
				component: {
					name: 'el-input'
				},
				required: true
			},
			{
				prop: 'cert',
				//【很重要】默认数据格式，以实际业务为主。
				value: [
					{
						label: ''
					}
				],
				component: {
					name: 'slot-cert'
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

function rowAdd() {
	Form.value?.form.cert.push({
		label: ''
	});
}

function rowDel(index: number) {
	Form.value?.form.cert.splice(index, 1);
}
</script>

<style lang="scss" scoped>
.cert {
	.row {
		display: flex;
		align-items: center;

		.el-input {
			flex: 1;
			margin-right: 10px;
		}

		.el-icon {
			cursor: pointer;

			&:hover {
				color: red;
			}
		}
	}
}
</style>

```
