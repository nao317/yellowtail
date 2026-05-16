import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (globalThis as any).process?.env?.SUPABASE_URL || (globalThis as any).process?.env?.VITE_SUPABASE_URL
const serviceKey = (globalThis as any).process?.env?.SUPABASE_SERVICE_KEY || (globalThis as any).process?.env?.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !serviceKey) {
	// It's okay for local/front-end-only runs; server handlers should ensure service key exists.
	// Avoid throwing at import time to keep DX simple.
}

export const supabaseAdmin = createClient(supabaseUrl ?? '', serviceKey ?? '')

