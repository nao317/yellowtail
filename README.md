# ポートフォリオサイト

React + Supabase で実装する前提の初期設計書です。

## 機能

- プロフィール表示
- 投稿一覧表示
- 投稿詳細表示
- 投稿作成・編集・削除（admin 1人のみ）

## 設計

### 1. 全体方針

- React + TypeScript（Vite）を採用
- 画面は React Router で管理し、ルーティング責務を一元化する
- 機能単位（feature単位）でディレクトリを分けて保守性を上げる
- サーバーデータとUI状態を分離する（TanStack Query と local state）
- データ基盤は Supabase（PostgreSQL + Auth + Storage）を利用
- 管理者認証は Supabase Auth で単一アカウント運用にする

### 2. 技術スタック（想定）

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Tailwind CSS または CSS Modules（どちらかに統一）
- Supabase（Database / Auth / Storage）
- @supabase/supabase-js
- Zod（バリデーション）
- Vitest + Testing Library（単体/コンポーネントテスト）
- Playwright（E2E）

### 3. ルーティング設計（React Router）

- /
  - ホーム（プロフィール + 最新投稿）
- /posts
  - 投稿一覧
- /posts/[slug]
  - 投稿詳細
- /admin/login
  - 管理者ログイン
- /admin/posts
  - 投稿管理一覧
- /admin/posts/new
  - 投稿作成
- /admin/posts/[id]/edit
  - 投稿編集

管理系ページは ProtectedRoute で認証・権限チェックし、未認証時は /admin/login にリダイレクトする。

### 4. 認証設計（admin 1人）

- 前提: 管理者アカウントは1つのみ
- Supabase Auth の email/password ログインを使用
- セッション状態は `onAuthStateChange` と初期セッション取得で同期
- profiles テーブルの role 列で admin 判定する（admin 以外は管理画面拒否）
- 認証情報の参照は `features/auth` に集約し、画面側でSDKを直接触らない
- 初期運用では admin ユーザーを1件だけ作成し、追加作成しない

### 5. Supabaseセキュリティ設計（RLS）

- posts テーブルは RLS を有効化
- 公開投稿（is_published = true）は anon で SELECT を許可
- 投稿の INSERT / UPDATE / DELETE は admin ロールのみ許可
- profiles は本人参照のみ許可、role更新は service role 経由のみ
- service role key はバックエンド処理専用とし、フロントには渡さない

### 6. データモデル（最小）

- profiles
  - id（auth.users.id と紐づく UUID）
  - username
  - role（admin固定）
  - created_at

- posts
  - id（UUID）
  - title
  - slug（UNIQUE）
  - excerpt
  - content
  - thumbnail_url
  - is_published
  - published_at
  - updated_at

### 7. データ取得と更新

- 公開ページ
  - TanStack Query で一覧/詳細を取得し、キャッシュを活用
- 管理ページ
  - mutation で作成/更新/削除を実行し、成功時に query invalidation
- バリデーション
  - 入力値とAPI入出力は Zod で検証
- データアクセス
  - Supabaseアクセスは `features/*/services` 経由に限定

### 8. API設計方針

- 基本は Supabase SDK で直接アクセス
- 外部公開したい処理や秘匿鍵が必要な処理のみBFFを追加
- BFFを追加する場合は認可責務をBFF側に集約する

### 9. エラーハンドリング方針

- 入力エラーは 400 系で返却し、フォーム項目ごとに表示
- 未認証は 401、権限不足は 403
- 想定外エラーは 500 とし、UIでは共通メッセージを表示
- ルート単位で Error Boundary を設定し、復帰導線を用意する

### 10. テスト方針

- 単体テスト
  - lib, services, validation
- コンポーネントテスト
  - 管理フォーム、投稿カード
- E2E
  - ログイン -> 投稿作成 -> 公開ページで表示確認

## ファイル構造（React ベストプラクティス案）

```text
.
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── providers/
│   │   │   ├── QueryProvider.tsx
│   │   │   └── AuthProvider.tsx
│   │   ├── router/
│   │   │   ├── index.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── layout/
│   │   │   ├── RootLayout.tsx
│   │   │   └── AdminLayout.tsx
│   │   └── errors/
│   │       ├── AppErrorBoundary.tsx
│   │       └── NotFound.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── PostsPage.tsx
│   │   ├── PostDetailPage.tsx
│   │   ├── AdminLoginPage.tsx
│   │   ├── AdminPostsPage.tsx
│   │   ├── AdminPostNewPage.tsx
│   │   └── AdminPostEditPage.tsx
│   ├── features/
│   │   ├── posts/
│   │   │   ├── components/
│   │   │   ├── queries/
│   │   │   ├── services/
│   │   │   ├── mutations/
│   │   │   ├── schemas/
│   │   │   └── types.ts
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── queries/
│   │   │   ├── services/
│   │   │   ├── mutations/
│   │   │   ├── schemas/
│   │   │   └── types.ts
│   │   └── profile/
│   │       ├── components/
│   │       ├── queries/
│   │       ├── services/
│   │       └── types.ts
│   ├── shared/
│   │   ├── ui/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── env.ts
│   │   │   └── logger.ts
│   │   └── types/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── admin.ts
│   └── styles/
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 実装ルール（初期）

- app 配下はアプリ初期化（Provider、Router、Layout）だけに限定する
- 画面は pages、機能ロジックは features、共通処理は shared へ分離する
- 入出力スキーマは features/*/schemas に集約する
- データ取得は queries、更新は mutations で分離する
- 画面から直接 Supabase SDK を呼ばない（services経由）
- Supabase key は用途を分離する
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY はフロントでは使わない（必要時はEdge Functions等のサーバー側でのみ利用）

## 今後の拡張候補

- 下書き保存
- タグ・カテゴリ
- Markdownエディタ
- OGP画像自動生成
