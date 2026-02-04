import { neon } from "@neondatabase/serverless"

export function getDb() {
	const sql = neon(process.env.NEON_DATABASE_URL!)
	return sql
}

export function toSlug(name: string): string {
	return name
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 50)
}
