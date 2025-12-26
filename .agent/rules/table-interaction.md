---
description: cl-table 交互功能
globs: *.tsx, *.ts, *.vue
---

## 右键菜单 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>context-menu</el-tag>
			<span>右键菜单</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/context-menu.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="右键菜单">
				<cl-crud ref="Crud">
					<cl-row>
						<cl-table ref="Table"></cl-table>
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
import { EditPen, MoreFilled } from '@element-plus/icons-vue';

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

	// 右键菜单配置，为 [] 时则不显示内容
	contextMenu: [
		'refresh', // 刷新
		'check', // 选择行
		'edit', // 弹出编辑框
		'delete', // 弹出删除提示
		'info', // 弹出详情
		'order-desc', // 使列倒序
		'order-asc', // 使列升序
		{
			label: '禁用状态',
			disabled: true
		},
		{
			label: '带图标',
			prefixIcon: EditPen,
			suffixIcon: MoreFilled
		},
		{
			label: '超出隐藏，看我有很多字非常多',
			ellipsis: true
		},
		{
			label: '多层级',
			children: [
				{
					label: 'A',
					children: [
						{
							label: 'A-1',
							callback(done) {
								ElMessage.success('点击了A-1');
								done();
							}
						}
					]
				},
				{
					label: 'B'
				},
				{
					label: 'C'
				}
			]
		},
		// row 行数据
		// column 列属性
		// event 事件对象
		(row, column, event) => {
			// 必须返回一个对象
			return {
				label: '自定义2',
				callback(done) {
					ElMessage.info('获取中');

					setTimeout(() => {
						ElMessage.success('Ta 是' + row.name);

						// 关闭右键菜单，只有在用到 callback 方法时才需要
						done();
					}, 500);
				}
			};
		}
	],

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
					tree: true,
					checkStrictly: true,
					options: dict.get('occupation')
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

## 字典匹配 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>dict</el-tag>
			<span>字典匹配</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/dict.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="字典匹配" width="80%">
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

<script setup lang="ts">
import { useCrud, useTable } from '@cool-vue/crud';
import { computed, reactive, ref } from 'vue';
import { useDict } from '/$/dict';

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

const options = reactive({
	occupation: [] as { label: string; value: any }[]
});

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

			//【很重要】字典匹配
			// 使用字典模块的 get 方法绑定，菜单地址 /dict/list
			dict: dict.get('occupation'),

			// 是否使用不同颜色区分
			dictColor: true,

			minWidth: 140
		},
		{
			label: '等级',
			prop: 'occupation',

			//【很重要】动态匹配列表的情况，使用 computed
			dict: computed(() => options.occupation),

			minWidth: 140
		},
		{
			label: '状态',
			prop: 'status',

			// 自定义匹配列表
			dict: [
				{
					label: '启用',
					value: 1,
					type: 'success'
				},
				{
					label: '禁用',
					value: 0,
					type: 'danger'
				}
			],

			minWidth: 140
		},
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc'
		}
	]
});

const visible = ref(false);

function open() {
	visible.value = true;

	// 模拟接口获取数据
	setTimeout(() => {
		options.occupation = [
			{
				label: 'A',
				value: 0
			},
			{
				label: 'B',
				value: 1
			},
			{
				label: 'C',
				value: 2
			},
			{
				label: 'D',
				value: 3
			},
			{
				label: 'E',
				value: 4
			},
			{
				label: 'F',
				value: 5
			}
		];
	}, 1500);
}
</script>

```

## 数据格式化 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>formatter</el-tag>
			<span>数据格式化</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/formatter.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="数据格式化" width="80%">
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
			<span class="date">2024-09-26</span>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { useCrud, useTable } from '@cool-vue/crud';
import { ref } from 'vue';

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
			minWidth: 140,
			formatter(row) {
				return '📱' + row.phone;
			}
		},
		{
			label: '用户信息',
			minWidth: 200,
			// tsx 方式渲染
			// 【很重要】使用 tsx 语法时，script 的 lang 一定要设置为 tsx
			formatter(row) {
				// row 为当前行数据
				return (
					<el-row>
						<cl-avatar size={30} />
						<el-text style={{ marginLeft: '10px' }}>{row.name}</el-text>
					</el-row>
				);
			}
		},
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc'
		}
	]
});

const visible = ref(false);

function open() {
	visible.value = true;
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
			<demo-code :files="['table/hidden.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="隐藏/显示" width="80%">
				<cl-crud ref="Crud">
					<!--配置一个 tab -->
					<el-tabs v-model="active">
						<el-tab-pane label="员工" name="user"></el-tab-pane>
						<el-tab-pane label="企业" name="company"></el-tab-pane>
					</el-tabs>

					<cl-row>
						<!-- 使用方法 showColumn 显示 -->
						<el-button @click="showColumn('account')">显示账号</el-button>

						<!-- 使用方法 hideColumn 隐藏 -->
						<el-button @click="hideColumn('account')">隐藏账号</el-button>
					</cl-row>

					<cl-row>
						<cl-table ref="Table"></cl-table>
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
import { computed, ref } from 'vue';
import { useDict } from '/$/dict';

const { dict } = useDict();

// cl-crud 配置
const Crud = useCrud(
	{
		// 测试数据，移步到 cl-crud 例子查看
		service: 'test'
	},
	app => {
		app.refresh();
	}
);

const active = ref('user');

// cl-table 配置
const Table = useTable({
	autoHeight: false,
	contextMenu: ['refresh'],

	columns: [
		{
			label: 'ID',
			prop: 'id',
			minWidth: 140,

			//【很重要】配置 hidden 参数，格式为 boolean 或者 Vue.ComputedRef<boolean>
			hidden: computed(() => {
				return active.value != 'company';
			})
		},
		{
			label: '账号',
			prop: 'account',
			minWidth: 140,
			hidden: true // 默认 false
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
	]
});

const visible = ref(false);

function open() {
	visible.value = true;
}

function showColumn(prop: string) {
	Table.value?.showColumn(prop);
}

function hideColumn(prop: string) {
	Table.value?.hideColumn(prop);
}
</script>

```
