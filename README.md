# ポートフォリオサイト

Next.js App Router で実装する前提の初期設計書です。

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
- APIアクセスは Route Handler 経由に統一し、画面側は直接DBに触れない
- 管理者認証は単一アカウント前提でシンプルに保つ

### 2. 技術スタック（想定）

- Next.js（App Router）
- React
- TypeScript
- Tailwind CSS または CSS Modules（どちらかに統一）
- Zod（バリデーション）
- Prisma または Drizzle（DBアクセス）
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
- ログイン成功時に httpOnly Cookie へセッション情報を保存
- Cookieの検証は server 側で実施（middleware + Route Handler）
- クライアント側の状態管理は最小化し、認証判定は server 基準にする
- CSRF対策として SameSite 設定と Origin チェックを行う

### 5. データモデル（最小）

- User
	- id
	- username
	- passwordHash
	- role（admin固定）
	- createdAt

- Post
	- id
	- title
	- slug
	- excerpt
	- content
	- thumbnailUrl
	- isPublished
	- publishedAt
	- updatedAt

### 6. データ取得と更新

- 公開ページ
	- Server Component で直接サービス層を呼び出し、SSRで描画
- 管理ページ
	- 投稿作成/更新/削除は Server Action または /api/admin/* Route Handler で実行
- バリデーション
	- 入力値とAPI入出力は Zod で検証
- キャッシュ
	- 投稿更新時に revalidatePath を実行して一覧・詳細を再生成

### 7. API設計（Route Handler）

- POST /api/auth/login
	- ログイン処理
- POST /api/auth/logout
	- ログアウト処理
- GET /api/posts
	- 公開投稿一覧
- GET /api/posts/[slug]
	- 投稿詳細
- POST /api/admin/posts
	- 投稿作成（要認証）
- PATCH /api/admin/posts/[id]
	- 投稿更新（要認証）
- DELETE /api/admin/posts/[id]
	- 投稿削除（要認証）

### 8. エラーハンドリング方針

- 入力エラーは 400 系で返却し、フォーム項目ごとに表示
- 未認証は 401、権限不足は 403
- 想定外エラーは 500 とし、UIでは共通メッセージを表示
- app/error.tsx と app/not-found.tsx を実装して体験を統一

### 9. テスト方針

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
│   │       │   ├── login/route.ts
│   │       │   └── logout/route.ts
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
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── middleware.ts
│   └── styles/
├── prisma/
│   └── schema.prisma
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

## 今後の拡張候補

- 下書き保存
- タグ・カテゴリ
- Markdownエディタ
- OGP画像自動生成

