import { supabase } from './supabase/client'
import type { Profile, ProfileRow } from '../features/profile/type'

export async function fetchAdminProfile(): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, role, created_at')
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle<ProfileRow>()

    if (error) {
        throw new Error(error.message)
    }

    if (!data) {
        return null
    }

    return {
        id: data.id,
        username: data.username,
        role: data.role,
        createdAt: data.created_at,
    }
}
