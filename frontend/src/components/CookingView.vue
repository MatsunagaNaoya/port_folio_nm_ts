<template>
	<div class="cooking-dashboard">
		<!-- ヘッダー -->
		<div class="dashboard-header">
			<div class="header-content">
				<div class="title-section">
					<h1>🍽️ 調理管理システム</h1>
					<p>料理・レシピ・材料の管理・検索機能</p>
				</div>
				<div class="system-info">
					<el-tag :type="loading ? 'warning' : error ? 'danger' : 'success'" size="large">
						{{ loading ? '読み込み中' : error ? 'エラー' : 'システム稼働中' }}
					</el-tag>
					<span class="last-update">最終更新: {{ lastUpdate || '未更新' }}</span>
				</div>
			</div>
		</div>

		<!-- メインコンテンツ -->
		<div class="main-content">
			<!-- 統計情報セクション -->
			<div class="section-group">
				<div class="section-header">
					<h2>📊 統計情報</h2>
					<p>料理データの統計サマリー</p>
				</div>
				<el-row :gutter="20">
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-content">
								<div class="stat-number">{{ dishStats.total }}</div>
								<div class="stat-label">料理総数</div>
								<div class="stat-trend positive">+0%</div>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-content">
								<div class="stat-number">{{ dishStats.selected }}</div>
								<div class="stat-label">選択中</div>
								<div class="stat-trend neutral">選択済み</div>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-content">
								<div class="stat-number">{{ dishStats.types }}</div>
								<div class="stat-label">料理タイプ</div>
								<div class="stat-trend positive">種類</div>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-content">
								<div class="stat-number">{{ dishStats.averageMaterials }}</div>
								<div class="stat-label">平均材料数</div>
								<div class="stat-trend neutral">/料理</div>
							</div>
						</el-card>
					</el-col>
				</el-row>
			</div>

			<!-- 検索・フィルタセクション -->
			<div class="section-group">
				<div class="section-header">
					<h2>🔍 検索・フィルタ</h2>
					<p>料理の検索・絞り込み機能</p>
				</div>
				<el-card>
					<el-row :gutter="20">
						<el-col :span="12">
							<el-input
								v-model="searchQuery"
								placeholder="料理名や材料で検索..."
								prefix-icon="Search"
								clearable
							/>
						</el-col>
						<el-col :span="8">
							<el-select
								v-model="selectedType"
								placeholder="料理タイプを選択"
								clearable
								style="width: 100%"
							>
								<el-option v-for="type in dishTypes" :key="type" :label="type" :value="type" />
							</el-select>
						</el-col>
						<el-col :span="4">
							<el-button type="primary" @click="searchDishes" style="width: 100%"> 検索 </el-button>
						</el-col>
					</el-row>
				</el-card>
			</div>

			<!-- 機能セクション -->
			<div class="section-group">
				<div class="section-header">
					<h2>🔧 操作機能</h2>
					<p>料理データの操作・管理機能</p>
				</div>
				<el-row :gutter="20">
					<el-col :span="6">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">➕</div>
								<h3>新規追加</h3>
								<p>新しい料理の登録</p>
								<el-button type="primary" size="small" @click="addNewDish"> 追加 </el-button>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">🔄</div>
								<h3>データ更新</h3>
								<p>最新データの取得・更新</p>
								<el-button type="info" size="small" @click="fetchDishes" :loading="loading">
									更新
								</el-button>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">📤</div>
								<h3>エクスポート</h3>
								<p>選択データのエクスポート</p>
								<el-button
									type="success"
									size="small"
									@click="exportSelected"
									:disabled="selectedDishes.length === 0"
								>
									エクスポート
								</el-button>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">🗑️</div>
								<h3>選択クリア</h3>
								<p>選択状態のリセット</p>
								<el-button
									type="warning"
									size="small"
									@click="clearSelection"
									:disabled="selectedDishes.length === 0"
								>
									クリア
								</el-button>
							</div>
						</el-card>
					</el-col>
				</el-row>
			</div>

			<!-- データ表示セクション -->
			<div class="section-group">
				<div class="section-header">
					<h2>📋 料理データ一覧</h2>
					<p>全料理データの表示・選択</p>
				</div>

				<div v-if="loading" class="loading-section">
					<el-skeleton :rows="5" animated />
				</div>

				<div v-else-if="error" class="error-section">
					<el-alert :title="error" type="error" :closable="false" show-icon />
				</div>

				<div v-else>
					<el-card>
						<el-table
							:data="filteredDishes"
							style="width: 100%"
							@selection-change="handleSelectionChange"
							:row-key="(row: Dish) => row.id"
							highlight-current-row
							:max-height="400"
							border
						>
							<el-table-column type="selection" width="55" />
							<el-table-column prop="id" label="ID" width="80" />
							<el-table-column prop="name" label="料理名" width="150" />
							<el-table-column prop="type" label="タイプ" width="100">
								<template #default="{ row }">
									<el-tag :type="getTypeColor(row.type)" size="small">
										{{ row.type }}
									</el-tag>
								</template>
							</el-table-column>
							<el-table-column label="材料" min-width="200">
								<template #default="{ row }">
									<div class="materials-list">
										<el-tag
											v-for="material in row.materials"
											:key="material"
											type="info"
											size="small"
											style="margin: 2px"
										>
											{{ material }}
										</el-tag>
									</div>
								</template>
							</el-table-column>
							<el-table-column label="レシピ" min-width="200">
								<template #default="{ row }">
									<div class="recipe-preview">{{ row.recipe.substring(0, 50) }}...</div>
								</template>
							</el-table-column>
						</el-table>
					</el-card>
				</div>
			</div>

			<!-- 選択データセクション -->
			<div v-if="selectedDishes.length > 0" class="section-group">
				<div class="section-header">
					<h2>✅ 選択中の料理</h2>
					<p>選択された料理データ（{{ selectedDishes.length }}件）</p>
				</div>
				<el-card>
					<el-table :data="selectedDishes" style="width: 100%" border>
						<el-table-column prop="id" label="ID" width="80" />
						<el-table-column prop="name" label="料理名" width="150" />
						<el-table-column prop="type" label="タイプ" width="100">
							<template #default="{ row }">
								<el-tag :type="getTypeColor(row.type)" size="small">
									{{ row.type }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column label="材料" min-width="200">
							<template #default="{ row }">
								<div class="materials-list">
									<el-tag
										v-for="material in row.materials"
										:key="material"
										type="success"
										size="small"
										style="margin: 2px"
									>
										{{ material }}
									</el-tag>
								</div>
							</template>
						</el-table-column>
						<el-table-column label="レシピ" min-width="200">
							<template #default="{ row }">
								<div class="recipe-preview">{{ row.recipe.substring(0, 50) }}...</div>
							</template>
						</el-table-column>
					</el-table>
				</el-card>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';

interface Dish {
	id: number;
	name: string;
	type: string;
	materials: string[];
	recipe: string;
}

const dishes = ref<Dish[]>([]);
const selectedDishes = ref<Dish[]>([]);
const loading = ref(false);
const error = ref('');
const lastUpdate = ref('');

// 検索・フィルタ
const searchQuery = ref('');
const selectedType = ref('');

// 統計データ
const dishStats = ref({
	total: 0,
	selected: 0,
	types: 0,
	averageMaterials: 0,
});

// 料理タイプ一覧
const dishTypes = ref<string[]>([]);

// 仮のデータ（実際はAPIから取得）
const mockDishes: Dish[] = [
	{
		id: 1,
		name: 'カレーライス',
		type: 'メイン',
		materials: ['米', 'カレールー', '玉ねぎ', 'にんじん', 'じゃがいも'],
		recipe: '1. 野菜を切る\n2. 炒める\n3. 水を加えて煮込む\n4. カレールーを溶かす',
	},
	{
		id: 2,
		name: '味噌汁',
		type: '汁物',
		materials: ['味噌', '豆腐', 'わかめ', 'ねぎ'],
		recipe: '1. だしを取る\n2. 具材を入れる\n3. 味噌を溶かす',
	},
	{
		id: 3,
		name: 'サラダ',
		type: '副菜',
		materials: ['レタス', 'トマト', 'きゅうり', 'ドレッシング'],
		recipe: '1. 野菜を洗う\n2. 切る\n3. 盛り付ける\n4. ドレッシングをかける',
	},
];

async function fetchDishes() {
	loading.value = true;
	error.value = '';
	try {
		// 実際のAPI呼び出し（現在はモックデータ）
		await new Promise((resolve) => setTimeout(resolve, 1000));
		dishes.value = mockDishes;

		// 統計データを計算
		updateStats();

		// 料理タイプを抽出
		dishTypes.value = Array.from(new Set(dishes.value.map((dish) => dish.type)));

		// 最終更新時間を設定
		const now = new Date();
		lastUpdate.value = now.toLocaleString('ja-JP');
	} catch (e: any) {
		error.value = e.message || 'データ取得失敗';
	} finally {
		loading.value = false;
	}
}

function updateStats() {
	dishStats.value.total = dishes.value.length;
	dishStats.value.selected = selectedDishes.value.length;
	dishStats.value.types = dishTypes.value.length;

	const totalMaterials = dishes.value.reduce((sum, dish) => sum + dish.materials.length, 0);
	dishStats.value.averageMaterials =
		dishes.value.length > 0 ? Math.round((totalMaterials / dishes.value.length) * 10) / 10 : 0;
}

function handleSelectionChange(selection: Dish[]) {
	selectedDishes.value = selection;
	updateStats();
}

function clearSelection() {
	selectedDishes.value = [];
	updateStats();
}

function exportSelected() {
	if (selectedDishes.value.length === 0) {
		ElMessage.warning('選択された料理がありません');
		return;
	}

	const dataStr = JSON.stringify(selectedDishes.value, null, 2);
	const dataBlob = new Blob([dataStr], { type: 'application/json' });
	const url = URL.createObjectURL(dataBlob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `selected-dishes-${new Date().toISOString().split('T')[0]}.json`;
	link.click();
	URL.revokeObjectURL(url);

	ElMessage.success('選択された料理をエクスポートしました');
}

function addNewDish() {
	ElMessage.info('新規料理追加機能は開発中です');
}

function searchDishes() {
	ElMessage.info('検索機能は開発中です');
}

// フィルタリングされた料理
const filteredDishes = computed(() => {
	let filtered = dishes.value;

	if (searchQuery.value) {
		filtered = filtered.filter(
			(dish) =>
				dish.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
				dish.materials.some((material) =>
					material.toLowerCase().includes(searchQuery.value.toLowerCase())
				)
		);
	}

	if (selectedType.value) {
		filtered = filtered.filter((dish) => dish.type === selectedType.value);
	}

	return filtered;
});

onMounted(fetchDishes);

// 料理タイプの色を取得
function getTypeColor(type: string) {
	const colors: { [key: string]: string } = {
		メイン: 'primary',
		副菜: 'success',
		汁物: 'warning',
		デザート: 'danger',
	};
	return colors[type] || 'info';
}
</script>

<style scoped>
.cooking-dashboard {
	background: #f5f7fa;
	min-height: 100vh;
}

/* ヘッダー */
.dashboard-header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	padding: 30px 0;
	margin-bottom: 30px;
}

.header-content {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.title-section h1 {
	margin: 0 0 8px 0;
	font-size: 2.2em;
	font-weight: 600;
}

.title-section p {
	margin: 0;
	opacity: 0.9;
	font-size: 1.1em;
}

.system-info {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 10px;
}

.last-update {
	font-size: 0.9em;
	opacity: 0.8;
}

/* メインコンテンツ */
.main-content {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px 40px;
}

/* セクショングループ */
.section-group {
	margin-bottom: 40px;
}

.section-header {
	margin-bottom: 20px;
	padding-bottom: 15px;
	border-bottom: 2px solid #e4e7ed;
}

.section-header h2 {
	margin: 0 0 8px 0;
	font-size: 1.6em;
	color: #303133;
	font-weight: 600;
}

.section-header p {
	margin: 0;
	color: #606266;
	font-size: 1em;
}

/* 統計カード */
.stat-card {
	text-align: center;
	transition: all 0.3s ease;
}

.stat-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-content {
	padding: 20px;
}

.stat-number {
	font-size: 2.5em;
	font-weight: 700;
	color: #409eff;
	margin-bottom: 8px;
}

.stat-label {
	color: #606266;
	font-size: 0.95em;
	margin-bottom: 8px;
}

.stat-trend {
	font-size: 0.85em;
	font-weight: 600;
	padding: 2px 8px;
	border-radius: 12px;
}

.stat-trend.positive {
	background: #f0f9ff;
	color: #67c23a;
}

.stat-trend.neutral {
	background: #f5f5f5;
	color: #909399;
}

/* 機能カード */
.feature-card {
	height: 180px;
	transition: all 0.3s ease;
	border: 1px solid #e4e7ed;
}

.feature-card:hover {
	transform: translateY(-3px);
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
	border-color: #409eff;
}

.card-content {
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-align: center;
	padding: 20px;
}

.card-icon {
	font-size: 2.5em;
	margin-bottom: 15px;
}

.card-content h3 {
	margin: 0 0 10px 0;
	font-size: 1.2em;
	color: #303133;
	font-weight: 600;
}

.card-content p {
	margin: 0 0 15px 0;
	color: #606266;
	font-size: 0.9em;
	line-height: 1.4;
}

/* データ表示 */
.loading-section,
.error-section {
	padding: 20px;
}

.materials-list {
	display: flex;
	flex-wrap: wrap;
	gap: 2px;
}

.recipe-preview {
	color: #606266;
	font-size: 0.9em;
	line-height: 1.4;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
	.header-content {
		flex-direction: column;
		text-align: center;
		gap: 20px;
	}

	.title-section h1 {
		font-size: 1.8em;
	}

	.system-info {
		align-items: center;
	}

	.main-content {
		padding: 0 15px 30px;
	}

	.feature-card {
		height: 160px;
		margin-bottom: 20px;
	}

	.card-content {
		padding: 15px;
	}

	.card-icon {
		font-size: 2em;
	}

	.stat-number {
		font-size: 2em;
	}
}
</style>
