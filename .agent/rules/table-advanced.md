---
description: cl-table 高级特性
globs: *.tsx, *.ts, *.vue
---

## 表头搜索 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>search</el-tag>
			<span>表头搜索</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/search.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="表头搜索" width="80%">
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
import { Plus } from '@element-plus/icons-vue';

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

			//【很重要】搜索参数配置
			search: {
				isInput: false, // 默认false，是否输入框模式
				value: '', // 默认值
				refreshOnChange: true, // 默认false，搜索时刷新数据，service 的 page 接口请求参数为 { page: 1, [绑定的prop]: 输入值 }
				// 自定义渲染组件
				component: {
					name: 'el-input',
					props: {
						placeholder: '搜索姓名'
					}
				}
			}
		},
		{
			label: '手机号',
			prop: 'phone',
			minWidth: 140,

			//【很重要】搜索参数配置
			search: {
				// 是否显示搜索图标
				icon: () => <Plus />,

				// 自定义渲染组件
				component: {
					name: 'el-input',
					props: {
						placeholder: '搜索手机号',

						// 自定义 change 事件
						onChange(val) {
							Crud.value?.refresh({
								page: 1,
								phone: val
							});
						}
					}
				}
			}
		},
		{
			label: '工作',
			prop: 'occupation',
			dict: dict.get('occupation'),
			minWidth: 140,

			//【很重要】搜索参数配置
			search: {
				// 是否显示搜索图标
				icon: () => <cl-svg name="icon-app" size={13} />,
				// 自定义渲染组件
				component: {
					name: 'cl-select',
					props: {
						placeholder: '搜索工作',
						options: dict.get('occupation')
					}
				}
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

## 多选框数据 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>selection</el-tag>
			<span>多选框数据</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/selection.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="多选框数据" width="80%">
				<cl-crud ref="Crud">
					<cl-row>
						<el-button @click="selectRow">选中2行</el-button>
						<el-button :disabled="Table?.selection.length == 0" @click="clear">
							取消选择
						</el-button>
					</cl-row>

					<cl-row>
						<cl-table ref="Table" />
					</cl-row>

					<cl-row>
						<el-text>已选 {{ Table?.selection.length }} 人</el-text>
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
	contextMenu: ['refresh', 'check'],

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

function selectRow() {
	const [a, b] = Table.value?.data || [];

	// 选中2个
	Table.value?.toggleRowSelection(a);
	Table.value?.toggleRowSelection(b);
}

function clear() {
	Table.value?.clearSelection();
}

const visible = ref(false);

function open() {
	visible.value = true;
}
</script>

```

## 插槽的使用 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>slot</el-tag>
			<span>插槽的使用</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/slot.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="插槽的使用" width="80%">
				<cl-crud ref="Crud">
					<cl-row>
						<cl-table ref="Table">
							<!--【很重要】必须与 prop 名保持一致，格式：column-[prop] -->
							<template #column-name="{ scope }">
								<cl-row type="flex" align="middle">
									<cl-avatar :size="36" :style="{ marginRight: '10px' }" />
									<el-text>{{ scope.row.name }}</el-text>
								</cl-row>
							</template>

							<template #column-phone="{ scope }"> 📱{{ scope.row.phone }} </template>
						</cl-table>
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
			headerAlign: 'left',
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
</script>

```

## 合并行或列 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>span-method</el-tag>
			<span>合并行或列</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/span-method.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="合并行或列" width="80%">
				<cl-crud ref="Crud">
					<cl-row>
						<cl-table ref="Table" :span-method="onSpanMethod" />
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
			label: '存款',
			prop: 'wages',
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

interface SpanMethodProps {
	row: any;
	column: any;
	rowIndex: number;
	columnIndex: number;
}

function onSpanMethod({ row, column, rowIndex, columnIndex }: SpanMethodProps) {
	// 根据实际业务需求调整返回值 { rowspan, colspan }
	if (columnIndex === 0) {
		if (rowIndex % 2 === 0) {
			return {
				rowspan: 2,
				colspan: 1
			};
		} else {
			return {
				rowspan: 0,
				colspan: 0
			};
		}
	}
}

const visible = ref(false);

function open() {
	visible.value = true;
}
</script>

```

## 表尾合计行 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>summary</el-tag>
			<span>表尾合计行</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/summary.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="表尾合计行" width="80%">
				<cl-crud ref="Crud">
					<cl-row>
						<cl-table ref="Table" show-summary :summary-method="getSummaries" />
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
			label: '存款',
			prop: 'wages',
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

function getSummaries() {
	return ['合计', '$' + Table.value?.data.reduce((a, b) => a + b.wages, 0)];
}

const visible = ref(false);

function open() {
	visible.value = true;
}
</script>

```
