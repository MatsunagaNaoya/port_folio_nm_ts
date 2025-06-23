import { dbConnect, closeConnection } from '../common/interface/db';

// ベルトIDごとに効果一覧を取得するAPI
export async function getBeltEffects(beltId: number) {
	try {
		const results = await dbConnect({
			sql: `
        SELECT be.belt_effect_id, be.belt_id, em.effect_name, em.effect_type, be.effect_value
        FROM belt_effects be
        JOIN effects_master em ON be.effect_id = em.effect_id
        WHERE be.belt_id = :belt_id
        ORDER BY em.display_order, em.effect_name
      `,
			values: { belt_id: beltId },
		});
		return results;
	} catch (err) {
		console.error('❌ getBeltEffectsエラー:', err);
		throw err;
	}
}

// 効果マスター一覧を取得するAPI
export async function getEffectsMaster() {
	try {
		const results = await dbConnect({
			sql: `
        SELECT effect_id, effect_name, effect_type, display_order
        FROM effects_master
        ORDER BY display_order, effect_id
      `,
			values: {},
		});
		return results;
	} catch (err) {
		console.error('❌ getEffectsMasterエラー:', err);
		throw err;
	}
}

// サンプル実行
if (require.main === module) {
	(async () => {
		try {
			console.log('--- ベルトID=1の効果一覧 ---');
			const effects = await getBeltEffects(1);
			console.log(effects);

			console.log('\n--- 効果マスター一覧 ---');
			const master = await getEffectsMaster();
			console.log(master);
		} finally {
			await closeConnection();
		}
	})();
}
