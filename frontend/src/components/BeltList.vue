<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

interface Belt {
	id: number;
	effects: string[];
}

const belts = ref<Belt[]>([]);
const selectedBelts = ref<Belt[]>([]);
const loading = ref(false);
const error = ref('');
const lastUpdate = ref('');

// 統計データ
const beltStats = ref({
	total: 0,
	selected: 0,
	withEffects: 0,
	averageEffects: 0,
});

async function fetchBelts() {
	loading.value = true;
	error.value = '';
	try {
		const res = await fetch('http://localhost:3000/api/belts');
		if (!res.ok) throw new Error('APIエラー');
		belts.value = await res.json();

		// 統計データを計算
		updateStats();

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
	beltStats.value.total = belts.value.length;
	beltStats.value.selected = selectedBelts.value.length;

	const beltsWithEffects = belts.value.filter((belt) =>
		belt.effects.some((effect) => effect && effect.trim() !== '')
	);
	beltStats.value.withEffects = beltsWithEffects.length;

	const totalEffects = belts.value.reduce(
		(sum, belt) => sum + belt.effects.filter((effect) => effect && effect.trim() !== '').length,
		0
	);
	beltStats.value.averageEffects =
		belts.value.length > 0 ? Math.round((totalEffects / belts.value.length) * 10) / 10 : 0;
}

onMounted(fetchBelts);

function handleSelectionChange(selection: Belt[]) {
	// 最大3つまで選択可能
	if (selection.length > 3) {
		// 3つを超えた場合は、最新の3つを保持
		selectedBelts.value = selection.slice(-3);
		ElMessage.warning('ベルトは最大3つまで選択できます');
	} else {
		selectedBelts.value = selection;
	}
	updateStats();
}

function clearSelection() {
	selectedBelts.value = [];
	updateStats();
	ElMessage.success('選択をクリアしました');
}

function removeBelt(beltId: number) {
	ElMessageBox.confirm(
		'このベルトを削除しますか？\n（論理削除され、一覧から非表示になります）',
		'削除確認',
		{
			confirmButtonText: '削除',
			cancelButtonText: 'キャンセル',
			type: 'warning',
		}
	)
		.then(async () => {
			try {
				const response = await fetch(`http://localhost:3000/api/belts/${beltId}`, {
					method: 'DELETE',
				});

				if (response.ok) {
					// 選択リストから削除
					selectedBelts.value = selectedBelts.value.filter((belt) => belt.id !== beltId);
					// 全ベルトリストから削除
					belts.value = belts.value.filter((belt) => belt.id !== beltId);
					updateStats();
					ElMessage.success('ベルトを削除しました');
				} else {
					const errorData = await response.json();
					ElMessage.error(errorData.error || '削除に失敗しました');
				}
			} catch (error) {
				console.error('削除エラー:', error);
				ElMessage.error('削除に失敗しました');
			}
		})
		.catch(() => {
			// キャンセルされた場合
			ElMessage.info('削除をキャンセルしました');
		});
}

function exportSelected() {
	if (selectedBelts.value.length === 0) {
		ElMessage.warning('選択されたベルトがありません');
		return;
	}

	const dataStr = JSON.stringify(selectedBelts.value, null, 2);
	const dataBlob = new Blob([dataStr], { type: 'application/json' });
	const url = URL.createObjectURL(dataBlob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `selected-belts-${new Date().toISOString().split('T')[0]}.json`;
	link.click();
	URL.revokeObjectURL(url);

	ElMessage.success('選択されたベルトをエクスポートしました');
}
</script>

<template>
	<div class="belt-dashboard">
		<!-- ヘッダー -->
		<div class="dashboard-header">
			<div class="header-content">
				<div class="title-section">
					<h1>🎯 ベルト管理システム</h1>
					<p>ベルトデータの分析・選択・管理機能</p>
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
					<p>ベルトデータの統計サマリー</p>
				</div>
				<el-row :gutter="20">
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-content">
								<div class="stat-number">{{ beltStats.total }}</div>
								<div class="stat-label">ベルト総数</div>
								<div class="stat-trend positive">+0%</div>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-content">
								<div class="stat-number">{{ beltStats.selected }}</div>
								<div class="stat-label">選択中</div>
								<div class="stat-trend neutral">選択済み</div>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-content">
								<div class="stat-number">{{ beltStats.withEffects }}</div>
								<div class="stat-label">効果あり</div>
								<div class="stat-trend positive">+0%</div>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-content">
								<div class="stat-number">{{ beltStats.averageEffects }}</div>
								<div class="stat-label">平均効果数</div>
								<div class="stat-trend neutral">/ベルト</div>
							</div>
						</el-card>
					</el-col>
				</el-row>
			</div>

			<!-- 機能セクション -->
			<div class="section-group">
				<div class="section-header">
					<h2>🔧 操作機能</h2>
					<p>ベルトデータの操作・管理機能</p>
				</div>
				<el-row :gutter="20">
					<el-col :span="8">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">🔄</div>
								<h3>データ更新</h3>
								<p>最新データの取得・更新</p>
								<el-button type="primary" size="small" @click="fetchBelts" :loading="loading">
									更新
								</el-button>
							</div>
						</el-card>
					</el-col>
					<el-col :span="8">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">📤</div>
								<h3>エクスポート</h3>
								<p>選択データのエクスポート</p>
								<el-button
									type="success"
									size="small"
									@click="exportSelected"
									:disabled="selectedBelts.length === 0"
								>
									エクスポート
								</el-button>
							</div>
						</el-card>
					</el-col>
					<el-col :span="8">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">🗑️</div>
								<h3>選択クリア</h3>
								<p>選択状態のリセット</p>
								<el-button
									type="warning"
									size="small"
									@click="clearSelection"
									:disabled="selectedBelts.length === 0"
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
					<h2>📋 ベルトデータ一覧</h2>
					<p>全ベルトデータの表示・選択（最大3つまで選択可能）</p>
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
							:data="belts"
							style="width: 100%"
							@selection-change="handleSelectionChange"
							:row-key="(row: Belt) => row.id"
							highlight-current-row
							:max-height="400"
							border
							ref="beltTable"
						>
							<el-table-column
								type="selection"
								width="55"
								:selectable="(row: Belt) => selectedBelts.length < 3 || selectedBelts.some((b) => b.id === row.id)"
								:reserve-selection="true"
							/>
							<el-table-column prop="id" label="ID" width="80" />
							<el-table-column
								v-for="n in 5"
								:key="n"
								:label="`効果${n}`"
								:prop="`effects[${n - 1}]`"
							>
								<template #default="{ row }">
									<el-tag v-if="row.effects[n - 1]" type="info" size="small">
										{{ row.effects[n - 1] }}
									</el-tag>
									<span v-else class="no-effect">-</span>
								</template>
							</el-table-column>
						</el-table>
					</el-card>
				</div>
			</div>

			<!-- 選択データセクション -->
			<div v-if="selectedBelts.length > 0" class="section-group">
				<div class="section-header">
					<h2>✅ 選択中のベルト</h2>
					<p>選択されたベルトデータ（{{ selectedBelts.length }}/3）</p>
				</div>
				<el-card>
					<el-table :data="selectedBelts" style="width: 100%" border>
						<el-table-column prop="id" label="ID" width="80" />
						<el-table-column
							v-for="n in 5"
							:key="n"
							:label="`効果${n}`"
							:prop="`effects[${n - 1}]`"
						>
							<template #default="{ row }">
								<el-tag v-if="row.effects[n - 1]" type="success" size="small">
									{{ row.effects[n - 1] }}
								</el-tag>
								<span v-else class="no-effect">-</span>
							</template>
						</el-table-column>
						<el-table-column label="操作" width="100">
							<template #default="{ row }">
								<el-button type="danger" size="small" @click="removeBelt(row.id)" icon="Delete">
									削除
								</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-card>
			</div>
		</div>
	</div>
</template>

<style scoped>
.belt-dashboard {
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

.no-effect {
	color: #c0c4cc;
	font-style: italic;
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
