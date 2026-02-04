import { neon } from "@neondatabase/serverless"

export function getDb() {
	const sql = neon(process.env.NEON_DATABASE_URL!)
	return sql
}

export function corsHeaders() {
	return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	}
}
