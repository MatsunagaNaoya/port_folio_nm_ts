# ポートフォリオ TypeScript + Vue + PostgreSQL アプリケーション

TypeScript + Vue.js + PostgreSQL を使用したフルスタック Web アプリケーションです。
ベルト関連データと調理データを管理・表示する機能を提供します。

## 機能

### バックエンド（TypeScript + PostgreSQL）

- PostgreSQL データベースへの接続・操作
- ベルト関連データの取得・分析
- 調理データの取得・検索
- 型安全なデータ取得とエラーハンドリング
- 柔軟なパラメータ設定（コマンドライン引数、環境変数、デフォルト値）

### フロントエンド（Vue.js + TypeScript）

- SPA（Single Page Application）構成
- 画面遷移機能（メイン・ベルト・調理画面）
- ベルトデータの一覧表示・検索
- 調理データの表示（開発中）
- レスポンシブデザイン

## セットアップ

### 1. 依存関係のインストール

```bash
# バックエンド依存関係
npm install

# フロントエンド依存関係
cd frontend
npm install
```

### 2. 環境変数の設定

`env.example`ファイルを参考に、`.env`ファイルを作成：

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

### 開発モード

#### バックエンド（API サーバ）起動

```bash
# デフォルト値で実行
npm run dev

# コマンドライン引数でパラメータ指定
npm run dev -- --dishType=4 --dishId=402

# 環境変数でパラメータ指定
DISH_TYPE=4 DISH_ID=402 npm run dev
```

#### フロントエンド（Vue 開発サーバ）起動

```bash
cd frontend
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてアプリケーションを確認できます。

### 本番ビルド

```bash
# バックエンド
npm run build
npm start

# フロントエンド
cd frontend
npm run build
```

### その他の便利なコマンド

```bash
# ファイル監視モード（開発用）
npm run dev:watch

# ビルドファイルのクリーンアップ
npm run clean

# フロントエンドのビルドファイルクリーンアップ
cd frontend
npm run clean
```

## プロジェクト構造

```
port_folio_nm_ts/
├── src/
│   ├── server.ts         # APIサーバ（メイン）
│   ├── belt-api.ts       # ベルト関連API
│   ├── recipe-api.ts     # 調理関連API
│   └── user-progress-api.ts # ユーザー進捗API
├── frontend/
│   ├── src/
│   │   ├── App.vue       # メインアプリケーション
│   │   ├── main.ts       # Vueアプリケーションエントリーポイント
│   │   ├── router.ts     # Vue Router設定
│   │   └── components/
│   │       ├── MainView.vue      # メイン画面
│   │       ├── BeltList.vue      # ベルト画面
│   │       └── CookingView.vue   # 調理画面
│   ├── package.json
│   └── tsconfig.json
├── common/
│   └── interface/
│       └── db.ts         # データベース接続・操作関数
├── local/                # ローカル開発用スクリプト（Git管理外）
├── dist/                 # コンパイル済みJavaScriptファイル
├── package.json
├── tsconfig.json
├── .env                  # 環境変数（要作成）
├── env.example           # 環境変数テンプレート
├── 実行手順メモ.txt      # 開発手順メモ
└── README.md
```

## 画面構成

### メイン画面（/main）

- アプリケーションのホーム画面
- 各機能へのナビゲーション

### ベルト画面（/belt）

- ベルト関連データの一覧表示
- 検索・フィルタリング機能
- データ分析結果の表示

### 調理画面（/dish）

- 調理データの表示（開発中）
- レシピ検索機能（予定）

## 技術スタック

### バックエンド

- **TypeScript**: 型安全な JavaScript
- **Node.js**: JavaScript 実行環境
- **PostgreSQL**: リレーショナルデータベース
- **pg**: PostgreSQL 用 Node.js ドライバー
- **dotenv**: 環境変数管理

### フロントエンド

- **Vue.js 3**: プログレッシブ JavaScript フレームワーク
- **Vue Router**: クライアントサイドルーティング
- **TypeScript**: 型安全な開発
- **Vite**: 高速ビルドツール
- **Element Plus**: Vue UI コンポーネントライブラリ

## 開発履歴

- **DB 設計改善**: 材料テーブルの正規化、中間テーブル導入
- **画面遷移機能**: Vue Router による SPA 実装
- **型安全性向上**: TypeScript 設定の最適化
- **エラーハンドリング強化**: 包括的なエラー処理の実装

## ライセンス

ISC
