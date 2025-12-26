---
description: cl-table 操作与编辑
globs: *.tsx, *.ts, *.vue
---

## 操作栏 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>op</el-tag>
			<span>操作栏</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/op.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="操作栏" width="80%">
				<cl-crud ref="Crud">
					<cl-row>
						<cl-table ref="Table">
							<!-- 插槽的渲染方式 #[component.name] -->
							<template #slot-btns="{ scope }">
								<el-button
									@click="
										() => {
											ElMessage.info(scope.row.name);
										}
									"
									>插槽按钮</el-button
								>
							</template>
						</cl-table>
					</cl-row>

					<cl-row>
						<cl-flex1 />
						<cl-pagination />
					</cl-row>

					<!-- 新增、编辑 -->
					<cl-upsert ref="Upsert" />
				</cl-crud>
			</cl-dialog>
		</div>

		<div class="f">
			<span class="date">2024-01-01</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { ref } from 'vue';
import { useDict } from '/$/dict';
import { ElMessage } from 'element-plus';

const { dict } = useDict();

// cl-crud 配置
const Crud = useCrud(
	{
		service: 'test'
	},
	app => {
		app.refresh();
	}
);

// cl-table 配置
const Table = useTable({
	autoHeight: false,
	contextMenu: ['refresh'],

	columns: [
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
			label: '工作',
			prop: 'occupation',
			dict: dict.get('occupation'),
			minWidth: 140
		},
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc'
		},
		{
			//【很重要】type 必须是 op
			type: 'op',

			width: 410, // 宽度

			//【很重要】操作按钮配置，edit 和 info 必须搭配 cl-upsert 实现
			// edit 编辑，预先获取 service 的 info 接口数据，并带入 cl-upsert 的表单值中
			// info 详情，cl-upsert 内的组件全部传入 disabled 参数
			// delete 删除，调用 service 的 delete 接口删除行数据
			buttons: [
				{
					label: '编辑',
					type: 'primary',
					onClick({ scope }) {
						ElMessage.info(scope.row.name);
					}
				},
				{
					label: '删除',
					type: 'danger',
					onClick({ scope }) {
						ElMessage.info(scope.row.name);
					}
				},
				{
					label: '更多',
					type: 'success',
					children: [
						{
							label: '查看',
							onClick({ scope }) {
								ElMessage.info(scope.row.name);
							}
						},
						{
							label: '禁用',
							onClick({ scope }) {
								ElMessage.info(scope.row.name);
							}
						}
					]
				},
				{
					name: 'slot-btns'
				}
			]
		}
	]
});

// cl-upsert 配置，详细移步到 cl-upsert 示例查看
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
			label: '手机号',
			prop: 'phone',
			component: {
				name: 'el-input'
			}
		},
		{
			label: '工作',
			prop: 'occupation',
			component: {
				name: 'cl-select',
				props: {
					tree: true, // 树形方式选择
					checkStrictly: true, // 任意层级都能点
					options: dict.get('occupation') // 使用字典数据
				}
			}
		}
	]
});

const visible = ref(false);

function open() {
	visible.value = true;
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
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/plugin/base.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="插件的使用" width="80%">
				<cl-crud ref="Crud">
					<cl-row>
						<cl-table ref="Table" />
					</cl-row>

					<cl-row>
						<cl-flex1 />
						<cl-pagination />
					</cl-row>
				</cl-crud>
			</cl-dialog>
		</div>

		<div class="f">
			<span class="date">2024-01-01</span>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { useCrud, useTable } from '@cool-vue/crud';
import { ref } from 'vue';
import { useDict } from '/$/dict';
import { merge } from 'lodash-es';
import { defineComponent } from 'vue';

// 插件：列标签匹配，方便多个列表公用同一个组件
function setColumn(): ClTable.Plugin {
	const columns = {
		UserInfo: {
			label: '用户信息',
			minWidth: 200,
			component: {
				vm: defineComponent({
					name: 'user-info',

					props: {
						scope: null
					},

					setup(props) {
						return () => {
							return (
								<div>
									<p>{props.scope.name}</p>
									<p>{props.scope.phone}</p>
								</div>
							);
						};
					}
				})
			}
		}
	} as { [key: string]: DeepPartial<ClTable.Column> };

	return ({ exposed }) => {
		function deep(arr: ClTable.Column[]) {
			arr.forEach(e => {
				if (e.tag) {
					merge(e, columns[e.tag]);
				}
				deep(e.children || []);
			});
		}

		deep(exposed.columns);
	};
}

const { dict } = useDict();

// cl-crud 配置
const Crud = useCrud(
	{
		service: 'test'
	},
	app => {
		app.refresh();
	}
);

// cl-table 配置
const Table = useTable({
	autoHeight: false,
	contextMenu: ['refresh'],

	columns: [
		{
			type: 'selection'
		},
		{
			tag: 'UserInfo'
		},
		{
			label: '工作',
			prop: 'occupation',
			dict: dict.get('occupation'),
			minWidth: 140
		},
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc'
		}
	],

	//【很重要】配置插件
	plugins: [setColumn()]
});

const visible = ref(false);

function open() {
	visible.value = true;
}
</script>

```

## 行编辑 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>row-edit</el-tag>
			<span>行编辑</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/plugin/row-edit.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="行编辑" width="80%">
				<cl-crud ref="Crud">
					<el-text class="mb-4" tag="p">点击姓名、手机号可以进行编辑</el-text>

					<cl-row>
						<cl-table ref="Table" />
					</cl-row>

					<cl-row>
						<cl-flex1 />
						<cl-pagination />
					</cl-row>
				</cl-crud>
			</cl-dialog>
		</div>

		<div class="f">
			<span class="date">2024-01-01</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useCrud, useTable } from '@cool-vue/crud';
import { ref } from 'vue';
import { useDict } from '/$/dict';
import { Plugins } from '/#/crud';

const { dict } = useDict();

// cl-crud 配置
const Crud = useCrud(
	{
		service: 'test'
	},
	app => {
		app.refresh();
	}
);

// cl-table 配置
const Table = useTable({
	autoHeight: false,
	contextMenu: ['refresh'],

	columns: [
		{
			label: '姓名',
			prop: 'name',
			minWidth: 140,
			// 【很重要】行编辑，默认 el-input
			edit: true
		},
		{
			label: '手机号',
			prop: 'phone',
			minWidth: 140,
			// 【很重要】行编辑，开启、关闭
			edit: {
				enable: true
			}
		},
		{
			label: '工作',
			prop: 'occupation',
			dict: dict.get('occupation'),
			minWidth: 140,
			edit: {
				enable: true,
				// 【很重要】行编辑，组件配置
				component: {
					name: 'cl-select',
					props: {
						options: dict.get('occupation'),
						tree: true
					}
				}
			}
		},
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc',
			// 【很重要】行编辑，组件配置
			edit: {
				enable: true,
				component: {
					name: 'el-date-picker',
					props: {
						type: 'date',
						valueFormat: 'YYYY-MM-DD'
					}
				}
			}
		},
		{
			type: 'op',
			buttons: ['delete']
		}
	],

	//【很重要】行编辑插件
	plugins: [Plugins.Table.rowEdit()]
});

const visible = ref(false);

function open() {
	visible.value = true;
}
</script>

```
