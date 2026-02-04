import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getDb } from "./_db"

export default async function handler(
	req: VercelRequest,
	res: VercelResponse,
) {
	res.setHeader("Access-Control-Allow-Origin", "*")
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, OPTIONS",
	)
	res.setHeader("Access-Control-Allow-Headers", "Content-Type")

	if (req.method === "OPTIONS") return res.status(200).end()

	const sql = getDb()

	try {
		if (req.method === "GET") {
			const { process_id } = req.query
			let rows
			if (process_id) {
				rows = await sql`
					SELECT s.*, p.name as process_name
					FROM sources s
					JOIN processes p ON p.id = s.process_id
					WHERE s.process_id = ${Number(process_id)}
					ORDER BY s.created_at DESC
				`
			} else {
				rows = await sql`
					SELECT s.*, p.name as process_name
					FROM sources s
					JOIN processes p ON p.id = s.process_id
					ORDER BY s.created_at DESC
				`
			}
			return res.json(rows)
		}

		if (req.method === "POST") {
			const { process_id, name, url, type, description } = req.body
			if (!process_id || !name || !type) {
				return res.status(400).json({
					error: "process_id, name, and type are required",
				})
			}
			const rows = await sql`
				INSERT INTO sources (process_id, name, url, type, description)
				VALUES (${process_id}, ${name}, ${url || null}, ${type}, ${description || null})
				RETURNING *
			`
			return res.status(201).json(rows[0])
		}

		return res.status(405).json({ error: "Method not allowed" })
	} catch (error) {
		console.error("API Error:", error)
		return res.status(500).json({
			error:
				error instanceof Error
					? error.message
					: "Internal server error",
		})
	}
}
