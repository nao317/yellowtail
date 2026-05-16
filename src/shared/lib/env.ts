
// AppEnvという名前で環境変数の構造体を作成
type AppEnv = {
    supabaseUrl: string
    supabaseAnonKey: string
    turnstileSiteKey: string
}

// envファイルから環境変数を読みだす関数
function readRequiredEnv(name: string): string {
    const value = (import.meta.env as Record<string, string | undefined>)[name]
    // 環境変数が見つからなかったときのエラーハンドリング
    if (!value) {
        throw new Error(`[env] Missing required env: ${name}`)
    }
    // 取得した環境変数の値を返す
    return value
}

// 作成したreadRequiredEnv関数を作成して得られた値を構造体に代入
// 値を代入した構造体AppEnvをexport
export const env: AppEnv = {
    supabaseUrl: readRequiredEnv('VITE_SUPABASE_URL'),
    supabaseAnonKey: readRequiredEnv('VITE_SUPABASE_ANON_KEY'),
    turnstileSiteKey: readRequiredEnv('VITE_TURNSTILE_SITE_KEY'),
}
