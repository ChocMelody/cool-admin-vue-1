---
description: cl-table 组件示例
globs: *.tsx, *.ts, *.vue
---
## 起步 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>base</el-tag>
			<span>起步</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/base.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="起步" width="80%">
				<!--【很重要】需要包含在 cl-crud 组件内 -->
				<cl-crud ref="Crud">
					<cl-row>
						<!-- 参数文档查看：https://element-plus.org/zh-CN/component/table.html#table-%E5%B1%9E%E6%80%A7 -->
						<cl-table ref="Table" stripe></cl-table>
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
		// 测试数据，移步到 cl-crud 例子查看
		service: 'test'
	},
	app => {
		app.refresh();
	}
);

// cl-table 配置
const Table = useTable({
	// 是否自动计算表格高度，表格高度等于减去上区域和下区域的高度
	//【很重要】在弹窗或者上级不确定高度中，设置 autoHeight: false，避免显示异常。也可以手动设置最大高度 maxHeight: 500
	autoHeight: false,

	// 右键菜单，移步到右键菜单示例中查看
	contextMenu: ['refresh'],

	// 列配置，点击 columns 查看描述
	// 更多配置查看 el-table-column 文档，https://element-plus.org/zh-CN/component/table.html#table-column-%E5%B1%9E%E6%80%A7
	columns: [
		{
			// 是否为多选框操作列
			type: 'selection'

			// 是否为序号列
			// type: "index"
		},
		{
			// 表头标题
			label: '姓名',

			// 绑定值
			prop: 'name',

			// 最小宽度
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
			// 字典匹配，移步到字典示例中查看
			dict: dict.get('occupation'),
			minWidth: 140
		},
		{
			label: '创建时间',
			prop: 'createTime',
			minWidth: 170,
			// 是否排序，desc, asc
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

## 多级表头 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>children</el-tag>
			<span>多级表头</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/children.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="多级表头" width="80%">
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
			label: '用户信息',
			prop: 'baseInfo',
			minWidth: 250,

			// 配置 children 参数
			children: [
				{
					label: '姓名',
					prop: 'name',
					minWidth: 140
				},
				{
					label: '手机号',
					prop: 'phone',
					minWidth: 140
				}
			]
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

## 自定义列展示 示例

```vue
<template>
	<div class="scope">
		<div class="h">
			<el-tag size="small" effect="dark" disable-transitions>column-custom</el-tag>
			<span>自定义列展示</span>
		</div>

		<div class="c">
			<el-button @click="open">预览</el-button>
			<demo-code :files="['table/column-custom.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="自定义列展示" width="80%">
				<cl-crud ref="Crud">
					<cl-row>
						<!--【很重要】组件配置，设置为 Table 的 columns，也可以自定义 -->
						<cl-column-custom :columns="Table?.columns" />
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
			label: '状态',
			prop: 'status',
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
			<demo-code :files="['table/component/index.vue']" />

			<!-- 自定义表格组件 -->
			<cl-dialog v-model="visible" title="组件渲染" width="80%">
				<cl-crud ref="Crud">
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
import { ref } from 'vue';
import { useDict } from '/$/dict';
import { ElMessage } from 'element-plus';
import UserInfo from './user-info.vue';

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
			label: '姓名',
			prop: 'name',
			minWidth: 140,

			//【很重要】组件实例方式渲染
			component: {
				vm: UserInfo
			}
		},
		{
			label: '手机号',
			prop: 'phone',
			minWidth: 140,

			//【很重要】组件名方式渲染
			component: {
				// 组件名，组件必须全局注册了
				name: 'el-input',

				// 传入参数
				props: {
					onChange(val) {
						ElMessage.info(val);
					}
				}
			}
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

## user-info 示例

```vue
<template>
	<div class="user-info">
		<cl-avatar :size="36" />

		<div class="det">
			<p>{{ scope?.name }}</p>
		</div>
	</div>
</template>

<!-- name 必须填写且唯一 -->
<script setup lang="ts">
defineOptions({
	name: 'user-info'
});

const props = defineProps({
	prop: String, // 列配置的 prop
	scope: null // 列数据
});
</script>

<style lang="scss" scoped>
.user-info {
	display: flex;
	align-items: center;

	.det {
		flex: 1;
		margin-left: 10px;
		text-align: left;
	}
}
</style>

```
