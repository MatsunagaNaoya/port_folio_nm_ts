import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { getBelts, deleteBelt, restoreBelt } from './belt-api';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ベルト一覧API
app.get('/api/belts', async (req: any, res: any) => {
	try {
		const belts = await getBelts();
		res.json(belts);
	} catch (err) {
		res.status(500).json({ error: 'サーバーエラー' });
	}
});

// ベルト論理削除API
app.delete('/api/belts/:id', async (req: any, res: any) => {
	try {
		const beltId = parseInt(req.params.id);
		if (isNaN(beltId)) {
			return res.status(400).json({ error: '無効なベルトID' });
		}

		await deleteBelt(beltId);
		res.json({ message: 'ベルトを削除しました' });
	} catch (err) {
		console.error('削除エラー:', err);
		res.status(500).json({ error: '削除に失敗しました' });
	}
});

// ベルト復元API
app.put('/api/belts/:id/restore', async (req: any, res: any) => {
	try {
		const beltId = parseInt(req.params.id);
		if (isNaN(beltId)) {
			return res.status(400).json({ error: '無効なベルトID' });
		}

		await restoreBelt(beltId);
		res.json({ message: 'ベルトを復元しました' });
	} catch (err) {
		console.error('復元エラー:', err);
		res.status(500).json({ error: '復元に失敗しました' });
	}
});

app.listen(PORT, () => {
	console.log(`APIサーバー起動: http://localhost:${PORT}`);
});
