# ポートフォリオ TypeScript DB 接続アプリケーション

ローカル PostgreSQL データベースに接続し、データを取得して表示する TypeScript アプリケーションです。

## 機能

- PostgreSQL データベースへの接続
- 名前付きパラメータを使用した SQL クエリ実行
- 型安全なデータ取得
- エラーハンドリング
- 柔軟なパラメータ設定（コマンドライン引数、環境変数、デフォルト値）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`env.example`ファイルを参考に、`.env`ファイルを作成してください：

```bash
cp env.example .env
```

`.env`ファイルを編集して、実際のデータベース接続情報を設定：

```env
# データベース接続設定
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name

# テスト用パラメータ設定（オプション）
DISH_TYPE=4
DISH_ID=401
```

### 3. データベースの準備

PostgreSQL データベースが起動していることを確認し、必要なテーブルが存在することを確認してください。

## 使用方法

### パラメータ設定の優先順位

1. **コマンドライン引数** (最高優先度)
2. **環境変数**
3. **デフォルト値** (最低優先度)

### 開発モードで実行

```bash
# デフォルト値で実行
npm run dev

# コマンドライン引数でパラメータ指定
npm run dev -- --dishType=4 --dishId=402

# 環境変数でパラメータ指定
DISH_TYPE=4 DISH_ID=402 npm run dev
```

### 本番ビルド

```bash
npm run build
npm start

# コマンドライン引数でパラメータ指定
npm start -- --dishType=4 --dishId=402
```

### ファイル監視モード（開発用）

```bash
npm run dev:watch
```

### ビルドファイルのクリーンアップ

```bash
npm run clean
```

### フロントエンドからの利用

```typescript
import { getDishData } from './src/index';

// フロントエンドから直接呼び出し
const dishData = await getDishData(4, 401);
console.log(dishData);
```

## プロジェクト構造

```
port_folio_nm_ts/
├── src/
│   └── index.ts          # メインアプリケーションファイル
├── common/
│   └── interface/
│       └── db.ts         # データベース接続・操作関数
├── dist/                 # コンパイル済みJavaScriptファイル
├── package.json
├── tsconfig.json
├── .env                  # 環境変数（要作成）
├── env.example           # 環境変数テンプレート
└── README.md
```

## 技術スタック

- **TypeScript**: 型安全な JavaScript
- **Node.js**: JavaScript 実行環境
- **PostgreSQL**: リレーショナルデータベース
- **pg**: PostgreSQL 用 Node.js ドライバー
- **dotenv**: 環境変数管理

## ライセンス

ISC
