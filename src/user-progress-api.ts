import { dbConnect, closeConnection } from '../common/interface/db';

// ユーザー進捗情報の型定義
interface UserProgress {
	user_id: number;
	dish_id: number;
	success_rate: number; // 0-3 (★0～3) + 失敗 = 5種類
	created_at: Date;
	updated_at: Date;
}

// ユーザー情報の型定義
interface User {
	user_id: number;
	username: string;
	email: string;
	created_at: Date;
}

// API パラメータの型定義
interface ProgressParams {
	userId: number;
	dishId: number;
	successRate?: number;
}

// パラメータ設定の優先順位: コマンドライン引数 > 環境変数 > デフォルト値
function getProgressParams(): ProgressParams {
	const args = process.argv.slice(2);
	const argUserId = args.find((arg) => arg.startsWith('--userId='))?.split('=')[1];
	const argDishId = args.find((arg) => arg.startsWith('--dishId='))?.split('=')[1];
	const argSuccessRate = args.find((arg) => arg.startsWith('--successRate='))?.split('=')[1];

	const envUserId = process.env.USER_ID;
	const envDishId = process.env.DISH_ID;
	const envSuccessRate = process.env.SUCCESS_RATE;

	const defaultParams: ProgressParams = {
		userId: 1, // ゲストユーザー
		dishId: 101,
		successRate: 0, // デフォルトで0開始
	};

	return {
		userId: Number(argUserId || envUserId || defaultParams.userId),
		dishId: Number(argDishId || envDishId || defaultParams.dishId),
		successRate:
			argSuccessRate || envSuccessRate
				? Number(argSuccessRate || envSuccessRate)
				: defaultParams.successRate,
	};
}

// ユーザー進捗の取得
async function getUserProgress(params: ProgressParams): Promise<UserProgress | null> {
	const query = `
		SELECT 
			user_id,
			dish_id,
			success_rate,
			created_at,
			updated_at
		FROM user_progress
		WHERE user_id = :userId AND dish_id = :dishId
		LIMIT 1;
	`;

	const result = await dbConnect({ sql: query, values: params });
	return result.length > 0 ? result[0] : null;
}

// ユーザー進捗の作成・更新
async function upsertUserProgress(params: ProgressParams): Promise<UserProgress> {
	const query = `
		INSERT INTO user_progress (user_id, dish_id, success_rate, created_at, updated_at)
		VALUES (:userId, :dishId, :successRate, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT (user_id, dish_id) 
		DO UPDATE SET 
			success_rate = :successRate,
			updated_at = CURRENT_TIMESTAMP
		RETURNING *;
	`;

	const result = await dbConnect({ sql: query, values: params });
	return result[0];
}

// ユーザーの全進捗取得
async function getAllUserProgress(userId: number): Promise<UserProgress[]> {
	const query = `
		SELECT 
			up.user_id,
			up.dish_id,
			up.success_rate,
			up.created_at,
			up.updated_at,
			d.dish_name
		FROM user_progress up
		JOIN old_dish_dqx_craftsman d ON up.dish_id = d.dish_id
		WHERE up.user_id = :userId
		ORDER BY up.updated_at DESC;
	`;

	return await dbConnect({ sql: query, values: { userId } });
}

// 進捗統計の取得
async function getProgressStatistics(userId: number): Promise<any> {
	const query = `
		SELECT 
			COUNT(*) as total_dishes,
			COUNT(CASE WHEN success_rate >= 3 THEN 1 END) as mastered_dishes,
			COUNT(CASE WHEN success_rate = 0 THEN 1 END) as not_tried_dishes,
			AVG(success_rate) as average_success_rate
		FROM user_progress
		WHERE user_id = :userId;
	`;

	const result = await dbConnect({ sql: query, values: { userId } });
	return result[0];
}

// データ表示関数
function displayUserProgress(progress: UserProgress | null): void {
	if (!progress) {
		console.log('❌ 進捗データが見つかりませんでした');
		return;
	}

	console.log('📊 ユーザー進捗データ:');
	console.log(`   ユーザーID: ${progress.user_id}`);
	console.log(`   料理ID: ${progress.dish_id}`);
	console.log(`   成功率: ${progress.success_rate}★`);
	console.log(`   作成日時: ${progress.created_at}`);
	console.log(`   更新日時: ${progress.updated_at}`);
}

// メイン実行関数
async function main(): Promise<void> {
	const params = getProgressParams();

	console.log('🚀 ユーザー進捗管理 API 開始');
	console.log('📋 パラメータ情報:');
	console.log(`  ユーザーID: ${params.userId}`);
	console.log(`  料理ID: ${params.dishId}`);
	console.log(`  成功率: ${params.successRate}★`);
	console.log('');

	try {
		// 1. 現在の進捗を取得
		console.log('=== 現在の進捗を取得 ===');
		const currentProgress = await getUserProgress(params);
		displayUserProgress(currentProgress);
		console.log('');

		// 2. 進捗を更新（パラメータで指定された場合）
		if (params.successRate !== undefined) {
			console.log('=== 進捗を更新 ===');
			const updatedProgress = await upsertUserProgress(params);
			console.log('✅ 進捗が更新されました');
			displayUserProgress(updatedProgress);
			console.log('');
		}

		// 3. ユーザーの全進捗を表示
		console.log('=== ユーザーの全進捗 ===');
		const allProgress = await getAllUserProgress(params.userId);

		if (allProgress.length === 0) {
			console.log('❌ 進捗データが見つかりませんでした');
		} else {
			console.log(`📋 進捗一覧（${allProgress.length}件）:\n`);
			allProgress.forEach((progress: any, index: number) => {
				console.log(`${index + 1}. ${progress.dish_name} (ID: ${progress.dish_id})`);
				console.log(`   成功率: ${progress.success_rate}★`);
				console.log(`   更新日時: ${progress.updated_at}`);
				console.log('');
			});
		}

		// 4. 統計情報を表示
		console.log('=== 統計情報 ===');
		const stats = await getProgressStatistics(params.userId);
		console.log('📊 進捗統計:');
		console.log(`   総料理数: ${stats.total_dishes}件`);
		console.log(`   マスター済み: ${stats.mastered_dishes}件`);
		console.log(`   未挑戦: ${stats.not_tried_dishes}件`);
		console.log(
			`   平均成功率: ${
				stats.average_success_rate ? Number(stats.average_success_rate).toFixed(1) : 0
			}★`
		);
		console.log('');
	} catch (error) {
		console.error('❌ アプリケーション実行中にエラーが発生しました:', error);
		process.exit(1);
	} finally {
		await closeConnection();
		console.log('👋 アプリケーション終了');
	}
}

// エクスポート関数（フロントエンド用）
export async function getUserProgressData(
	userId: number,
	dishId: number
): Promise<UserProgress | null> {
	const params: ProgressParams = { userId, dishId };
	return await getUserProgress(params);
}

export async function updateUserProgress(
	userId: number,
	dishId: number,
	successRate: number
): Promise<UserProgress> {
	const params: ProgressParams = { userId, dishId, successRate };
	return await upsertUserProgress(params);
}

export async function getAllProgressData(userId: number): Promise<UserProgress[]> {
	return await getAllUserProgress(userId);
}

export async function getProgressStats(userId: number): Promise<any> {
	return await getProgressStatistics(userId);
}

// アプリケーション実行
if (require.main === module) {
	main().catch((error) => {
		console.error('❌ アプリケーション実行中にエラーが発生しました:', error);
		process.exit(1);
	});
}

export { main };
