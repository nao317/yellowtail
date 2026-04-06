# ポートフォリオサイト

Reactで実装するポートフォリオサイトの、初期設計メモです。

## 機能

- プロフィール表示
- 投稿機能（admin 1人のみ）
- 投稿一覧表示
- 投稿詳細表示

## 設計

### 1. 全体方針

- フロントエンドは React + TypeScript を採用
- UIとビジネスロジックを分離し、画面単位ではなく機能単位でディレクトリを分ける
- データ取得・更新はAPI層に集約し、コンポーネントから直接 fetch を呼ばない
- 管理者認証は「単一ユーザー前提」のシンプル設計にする

### 2. 技術スタック（想定）

- React
- TypeScript
- Vite
- React Router
- TanStack Query（サーバーデータ管理）
- Zod（フォーム・APIレスポンスのバリデーション）
- CSS Modules または Tailwind CSS（どちらかに統一）

### 3. 画面設計

- ホーム（プロフィール + 最新投稿）
- 投稿一覧ページ
- 投稿詳細ページ
- 管理者ログインページ
- 管理者ダッシュボード（投稿作成・編集・削除）

### 4. 認証設計（admin 1人）

- 前提: 管理者は1アカウントのみ
- ログイン成功後、アクセストークンを保存（httpOnly Cookie推奨）
- フロント側では認証状態を AuthContext で管理
- 管理者画面は ProtectedRoute でガード
- 一般公開ページは未ログインでも閲覧可能

### 5. データモデル（最小）

- User
	- id
	- username
	- role（admin固定）

- Post
	- id
	- title
	- slug
	- content
	- thumbnailUrl
	- publishedAt
	- updatedAt
	- isPublished

### 6. データフロー

- 画面コンポーネントは hooks を通じてデータを取得
- hooks は services/api を利用して通信
- APIレスポンスは schema で検証
- 正規化や表示変換は mappers で吸収

### 7. エラーハンドリング方針

- APIエラーは共通の ApiError 型に統一
- 401: ログイン画面へ誘導
- 403: 権限不足メッセージ表示
- 500: 再試行UI + 通知

### 8. テスト方針（最初の粒度）

- 単体テスト: utils / hooks
- コンポーネントテスト: 主要画面の描画と操作
- E2E: ログイン -> 投稿作成 -> 公開確認の最短導線

## ファイル構造（案）

```text
.
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── providers/
│   │   │   ├── QueryProvider.tsx
│   │   │   └── AuthProvider.tsx
│   │   └── router/
│   │       ├── index.tsx
│   │       └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── PostsPage.tsx
│   │   ├── PostDetailPage.tsx
│   │   ├── AdminLoginPage.tsx
│   │   └── AdminDashboardPage.tsx
│   ├── features/
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types.ts
│   │   ├── posts/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── schemas/
│   │   │   └── types.ts
│   │   └── auth/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── context/
│   │       └── types.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── lib/
│   │   │   ├── apiClient.ts
│   │   │   ├── env.ts
│   │   │   └── logger.ts
│   │   ├── constants/
│   │   ├── styles/
│   │   └── types/
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 命名・実装ルール（初期）

- 画面は pages、機能差分は features、共通は shared に置く
- hooks は useXxx 命名、型は types.ts に集約
- API通信は services 配下で完結させる
- ルーティング定義は app/router に一元管理

## 今後の拡張候補

- 下書き保存機能
- タグ・カテゴリ機能
- Markdownエディタ
- OGP自動生成

