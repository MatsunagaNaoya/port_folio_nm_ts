import express from 'express';
import cors from 'cors';
import { getBelts } from './belt-api';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ベルト一覧API
app.get('/api/belts', async (req, res) => {
	try {
		const belts = await getBelts();
		res.json(belts);
	} catch (err) {
		res.status(500).json({ error: 'サーバーエラー' });
	}
});

app.listen(PORT, () => {
	console.log(`APIサーバー起動: http://localhost:${PORT}`);
});
