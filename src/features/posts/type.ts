export type Post = {
	id: string
	title: string
	slug?: string | null
	content?: string | null
	excerpt?: string | null
	thumbnail_url?: string | null
	is_published?: boolean | null
	created_at?: string | null
	updated_at?: string | null
	published_at?: string | null
}

export type PostFormValues = {
	title: string
	slug: string
	content: string
	thumbnail_url: string
	is_published: boolean
}
