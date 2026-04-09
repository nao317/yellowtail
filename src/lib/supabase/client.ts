// supabaseを使うためのライブラリをimport 
import { createClient } from '@supabase/supabase-js'
import { env } from '../../shared/lib/env'

// supabaseのクライアントをexport
// supabaseUrl, supabaseAnonKeyはlib/envで定義したAppEnv構造体を参照
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey)
