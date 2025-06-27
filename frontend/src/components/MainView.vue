<template>
	<div class="functional-dashboard">
		<!-- ヘッダー -->
		<div class="dashboard-header">
			<div class="header-content">
				<div class="title-section">
					<h1>ポートフォリオ管理システム</h1>
					<p>データ管理・分析・レポート機能</p>
				</div>
				<div class="system-info">
					<el-tag type="success" size="large">システム稼働中</el-tag>
					<span class="last-update">最終更新: {{ lastUpdate }}</span>
				</div>
			</div>
		</div>

		<!-- メインコンテンツ -->
		<div class="main-content">
			<!-- ベルト管理セクション -->
			<div class="section-group">
				<div class="section-header">
					<h2>🎯 ベルト管理</h2>
					<p>ベルト関連データの分析・管理機能</p>
				</div>
				<el-row :gutter="20">
					<el-col :span="8">
						<el-card class="feature-card" @click="navigateToBelt">
							<div class="card-content">
								<div class="card-icon">📊</div>
								<h3>データ分析</h3>
								<p>ベルトデータの統計・分析</p>
								<el-button type="primary" size="small">詳細</el-button>
							</div>
						</el-card>
					</el-col>
					<el-col :span="8">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">🔍</div>
								<h3>検索・フィルタ</h3>
								<p>条件指定でのデータ検索</p>
								<el-button type="info" size="small">詳細</el-button>
							</div>
						</el-card>
					</el-col>
					<el-col :span="8">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">📈</div>
								<h3>レポート</h3>
								<p>分析結果のレポート生成</p>
								<el-button type="warning" size="small">詳細</el-button>
							</div>
						</el-card>
					</el-col>
				</el-row>
			</div>

			<!-- 調理管理セクション -->
			<div class="section-group">
				<div class="section-header">
					<h2>🍽️ 調理管理</h2>
					<p>料理・レシピ・材料の管理機能</p>
				</div>
				<el-row :gutter="20">
					<el-col :span="6">
						<el-card class="feature-card" @click="navigateToDish">
							<div class="card-content">
								<div class="card-icon">🍳</div>
								<h3>料理一覧</h3>
								<p>登録済み料理の表示</p>
								<el-button type="primary" size="small">詳細</el-button>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">📝</div>
								<h3>レシピ管理</h3>
								<p>レシピの登録・編集</p>
								<el-button type="success" size="small">詳細</el-button>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">🥕</div>
								<h3>材料管理</h3>
								<p>材料データベース管理</p>
								<el-button type="info" size="small">詳細</el-button>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">🔍</div>
								<h3>検索機能</h3>
								<p>料理・レシピ検索</p>
								<el-button type="warning" size="small">詳細</el-button>
							</div>
						</el-card>
					</el-col>
				</el-row>
			</div>

			<!-- システム管理セクション -->
			<div class="section-group">
				<div class="section-header">
					<h2>⚙️ システム管理</h2>
					<p>システム設定・メンテナンス機能</p>
				</div>
				<el-row :gutter="20">
					<el-col :span="8">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">👥</div>
								<h3>ユーザー管理</h3>
								<p>ユーザーアカウント管理</p>
								<el-button type="primary" size="small">詳細</el-button>
							</div>
						</el-card>
					</el-col>
					<el-col :span="8">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">��</div>
								<h3>システム監視</h3>
								<p>システム状態・ログ確認</p>
								<el-button type="info" size="small">詳細</el-button>
							</div>
						</el-card>
					</el-col>
					<el-col :span="8">
						<el-card class="feature-card">
							<div class="card-content">
								<div class="card-icon">🔧</div>
								<h3>設定</h3>
								<p>システム設定・環境設定</p>
								<el-button type="warning" size="small">詳細</el-button>
							</div>
						</el-card>
					</el-col>
				</el-row>
			</div>

			<!-- 統計情報セクション -->
			<div class="section-group">
				<div class="section-header">
					<h2>📈 統計情報</h2>
					<p>システム全体の統計データ</p>
				</div>
				<el-row :gutter="20">
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-content">
								<div class="stat-number">{{ beltStats.total || 0 }}</div>
								<div class="stat-label">ベルト総数</div>
								<div class="stat-trend positive">+12%</div>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-content">
								<div class="stat-number">{{ dishStats.total || 0 }}</div>
								<div class="stat-label">料理総数</div>
								<div class="stat-trend positive">+8%</div>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-content">
								<div class="stat-number">{{ materialStats.total || 0 }}</div>
								<div class="stat-label">材料総数</div>
								<div class="stat-trend neutral">0%</div>
							</div>
						</el-card>
					</el-col>
					<el-col :span="6">
						<el-card class="stat-card">
							<div class="stat-content">
								<div class="stat-number">{{ userStats.total || 0 }}</div>
								<div class="stat-label">アクティブユーザー</div>
								<div class="stat-trend positive">+5%</div>
							</div>
						</el-card>
					</el-col>
				</el-row>
			</div>

			<!-- 最近のアクティビティ -->
			<div class="section-group">
				<div class="section-header">
					<h2>📋 最近のアクティビティ</h2>
					<p>システム内の最新アクティビティ</p>
				</div>
				<el-card>
					<el-timeline>
						<el-timeline-item
							v-for="(activity, index) in recentActivities"
							:key="index"
							:timestamp="activity.timestamp"
							:type="activity.type"
							:color="getTimelineColor(activity.type)"
						>
							<div class="activity-content">
								<strong>{{ activity.title }}</strong>
								<p>{{ activity.content }}</p>
							</div>
						</el-timeline-item>
					</el-timeline>
				</el-card>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import router from '../router';

const lastUpdate = ref('');

// 統計データ
const beltStats = ref({
	total: 0,
	selected: 0,
	withEffects: 0,
	averageEffects: 0,
});

const dishStats = ref({
	total: 0,
	selected: 0,
	types: 0,
	averageMaterials: 0,
});

const materialStats = ref({
	total: 0,
	categories: 0,
	averagePrice: 0,
});

const userStats = ref({
	total: 0,
	active: 0,
	newUsers: 0,
});

// 最近のアクティビティ
const recentActivities = ref([
	{
		title: 'ベルトデータ分析完了',
		content: '最新のベルトデータの分析が完了しました。',
		timestamp: '2024-01-15 14:30',
		type: 'success',
	},
	{
		title: '新しいレシピ追加',
		content: 'ユーザーが新しい料理レシピを追加しました。',
		timestamp: '2024-01-15 13:45',
		type: 'primary',
	},
	{
		title: '材料データベース更新',
		content: '材料データベースが正常に更新されました。',
		timestamp: '2024-01-15 12:20',
		type: 'warning',
	},
	{
		title: 'システムメンテナンス',
		content: '定期メンテナンスが完了しました。',
		timestamp: '2024-01-15 10:00',
		type: 'info',
	},
]);

// タイムライン色取得
const getTimelineColor = (type: string) => {
	const colors = {
		success: '#67C23A',
		primary: '#409EFF',
		warning: '#E6A23C',
		info: '#909399',
	};
	return colors[type as keyof typeof colors] || '#909399';
};

// ナビゲーション関数
function navigateToBelt() {
	router.push('/belt');
}

function navigateToDish() {
	router.push('/dish');
}

// 初期化
onMounted(() => {
	const now = new Date();
	lastUpdate.value = now.toLocaleString('ja-JP');

	// 仮の統計データ（実際はAPIから取得）
	beltStats.value = {
		total: 150,
		selected: 0,
		withEffects: 120,
		averageEffects: 3.2,
	};

	dishStats.value = {
		total: 85,
		selected: 0,
		types: 12,
		averageMaterials: 8.5,
	};

	materialStats.value = {
		total: 320,
		categories: 15,
		averagePrice: 450,
	};

	userStats.value = {
		total: 25,
		active: 18,
		newUsers: 3,
	};
});
</script>

<style scoped>
.functional-dashboard {
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

/* 機能カード */
.feature-card {
	height: 180px;
	cursor: pointer;
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

/* アクティビティ */
.activity-content strong {
	color: #303133;
	font-size: 0.95em;
}

.activity-content p {
	margin: 5px 0 0 0;
	color: #606266;
	font-size: 0.9em;
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
