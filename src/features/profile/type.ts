export type ProfileRole = 'admin'

// Profileの構造体を作成
export type Profile = {
    id: string
    username: string
    role: ProfileRole
    createdAt: string
}

// ProfileRow構造体を作成
export type ProfileRow = {
    id: string
    username: string
    role: ProfileRole
    created_at: string
}
