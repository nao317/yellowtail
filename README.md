# ポートフォリオサイト

Next.js App Router + Supabase で実装する前提の初期設計書です。

## 機能

- プロフィール表示
- 投稿一覧表示
- 投稿詳細表示
- 投稿作成・編集・削除（admin 1人のみ）

## 設計

### 1. 全体方針

- Next.js App Router + TypeScript を採用
- 公開ページは可能な限り Server Component で描画し、初期表示速度とSEOを優先
- 投稿作成やフォーム操作など対話が多い箇所だけ Client Component を使う
- データ基盤は Supabase（PostgreSQL + Auth + Storage）を利用
- 管理者認証は Supabase Auth で単一アカウント運用にする

### 2. 技術スタック（想定）

- Next.js（App Router）
- React
- TypeScript
- Tailwind CSS または CSS Modules（どちらかに統一）
- Supabase（Database / Auth / Storage）
- @supabase/supabase-js
- @supabase/ssr
- Zod（バリデーション）
- Vitest + Testing Library（単体/コンポーネントテスト）
- Playwright（E2E）

### 3. ルーティング設計（App Router）

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

管理系ページは middleware で認証チェックし、未認証の場合は /admin/login にリダイレクトする。

### 4. 認証設計（admin 1人）

- 前提: 管理者アカウントは1つのみ
- Supabase Auth の email/password ログインを使用
- セッションは @supabase/ssr で Cookie 連携（httpOnly）
- middleware でセッション検証し、/admin 配下を保護
- profiles テーブルの role 列で admin 判定する（admin 以外は管理画面拒否）
- 初期運用では admin ユーザーを1件だけ作成し、追加作成しない

### 5. Supabaseセキュリティ設計（RLS）

- posts テーブルは RLS を有効化
- 公開投稿（is_published = true）は anon で SELECT を許可
- 投稿の INSERT / UPDATE / DELETE は admin ロールのみ許可
- profiles は本人参照のみ許可、role更新は service role 経由のみ
- service role key は Next.js の server 側だけで使用し、client bundle に含めない

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
  - Server Component から Supabase クライアント（server）を利用して取得
- 管理ページ
  - Server Action または Route Handler で CUD 実行
- バリデーション
  - 入力値とAPI入出力は Zod で検証
- キャッシュ
  - 投稿更新時に revalidatePath を実行して一覧・詳細を再生成

### 8. API設計（Route Handler）

- POST /api/auth/sign-in
  - Supabase Auth でログイン
- POST /api/auth/sign-out
  - ログアウト
- GET /api/posts
  - 公開投稿一覧
- GET /api/posts/[slug]
  - 投稿詳細
- POST /api/admin/posts
  - 投稿作成（要認証 + role=admin）
- PATCH /api/admin/posts/[id]
  - 投稿更新（要認証 + role=admin）
- DELETE /api/admin/posts/[id]
  - 投稿削除（要認証 + role=admin）

### 9. エラーハンドリング方針

- 入力エラーは 400 系で返却し、フォーム項目ごとに表示
- 未認証は 401、権限不足は 403
- 想定外エラーは 500 とし、UIでは共通メッセージを表示
- app/error.tsx と app/not-found.tsx を実装して体験を統一

### 10. テスト方針

- 単体テスト
  - lib, services, validation
- コンポーネントテスト
  - 管理フォーム、投稿カード
- E2E
  - ログイン -> 投稿作成 -> 公開ページで表示確認

## ファイル構造（App Router 案）

```text
.
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── posts/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── posts/
│   │   │       ├── page.tsx
│   │   │       ├── new/
│   │   │       │   └── page.tsx
│   │   │       └── [id]/edit/
│   │   │           └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── sign-in/route.ts
│   │       │   └── sign-out/route.ts
│   │       ├── posts/
│   │       │   ├── route.ts
│   │       │   └── [slug]/route.ts
│   │       └── admin/posts/
│   │           ├── route.ts
│   │           └── [id]/route.ts
│   ├── features/
│   │   ├── posts/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── actions/
│   │   │   ├── schemas/
│   │   │   └── types.ts
│   │   ├── auth/
│   │   │   ├── services/
│   │   │   ├── actions/
│   │   │   ├── schemas/
│   │   │   └── types.ts
│   │   └── profile/
│   │       ├── components/
│   │       ├── services/
│   │       └── types.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   └── admin.ts
│   │   ├── auth.ts
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── middleware.ts
│   └── styles/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 実装ルール（初期）

- app 配下はルート定義とページ責務に限定する
- ビジネスロジックは features と lib に寄せる
- 入出力スキーマは features/*/schemas に集約する
- admin 保護は middleware と server 側チェックを併用する
- Client Component は本当に必要な箇所だけ use client を付ける
- Supabase key は用途を分離する
	- NEXT_PUBLIC_SUPABASE_URL
	- NEXT_PUBLIC_SUPABASE_ANON_KEY
	- SUPABASE_SERVICE_ROLE_KEY（server only）

## 今後の拡張候補

- 下書き保存
- タグ・カテゴリ
- Markdownエディタ
- OGP画像自動生成
