<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Belt {
	id: number;
	effects: string[];
}

const belts = ref<Belt[]>([]);
const selectedBelts = ref<Belt[]>([]);
const loading = ref(false);
const error = ref('');

async function fetchBelts() {
	loading.value = true;
	error.value = '';
	try {
		const res = await fetch('http://localhost:3000/api/belts');
		if (!res.ok) throw new Error('APIエラー');
		belts.value = await res.json();
	} catch (e: any) {
		error.value = e.message || 'データ取得失敗';
	} finally {
		loading.value = false;
	}
}

onMounted(fetchBelts);

function handleSelectionChange(selection: Belt[]) {
	if (selection.length > 3) {
		selectedBelts.value = selection.slice(0, 3);
	} else {
		selectedBelts.value = selection;
	}
}
</script>

<template>
	<div v-if="loading">読み込み中...</div>
	<div v-else-if="error">エラー: {{ error }}</div>
	<div v-else>
		<el-table
			:data="belts"
			style="width: 100%"
			@selection-change="handleSelectionChange"
			:row-key="(row: Belt) => row.id"
			highlight-current-row
			:max-height="400"
			border
		>
			<el-table-column type="selection" width="55" />
			<el-table-column prop="id" label="ID" width="50" />
			<el-table-column v-for="n in 5" :key="n" :label="`効果${n}`" :prop="`effects[${n - 1}]`">
				<template #default="{ row }">
					<span>{{ row.effects[n - 1] || '' }}</span>
				</template>
			</el-table-column>
		</el-table>

		<el-divider />

		<div v-if="selectedBelts.length > 0">
			<h3>選択中のベルト（最大3つ）</h3>
			<el-table :data="selectedBelts" style="width: 100%" border>
				<el-table-column prop="id" label="ID" width="50" />
				<el-table-column v-for="n in 5" :key="n" :label="`効果${n}`" :prop="`effects[${n - 1}]`">
					<template #default="{ row }">
						<span>{{ row.effects[n - 1] || '' }}</span>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div v-else>
			<p>ベルトを選択してください（最大3つまで）。</p>
		</div>
	</div>
</template>
