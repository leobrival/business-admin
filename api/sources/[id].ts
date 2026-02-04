import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getDb } from "../_db"

export default async function handler(
	req: VercelRequest,
	res: VercelResponse,
) {
	res.setHeader("Access-Control-Allow-Origin", "*")
	res.setHeader(
		"Access-Control-Allow-Methods",
		"PUT, DELETE, OPTIONS",
	)
	res.setHeader("Access-Control-Allow-Headers", "Content-Type")

	if (req.method === "OPTIONS") return res.status(200).end()

	const id = Number(req.query.id)
	if (Number.isNaN(id))
		return res.status(400).json({ error: "Invalid ID" })

	const sql = getDb()

	try {
		if (req.method === "PUT") {
			const { title, url, type, notes } = req.body
			const rows = await sql`
				UPDATE sources
				SET title = COALESCE(${title ?? null}, title),
					url = COALESCE(${url ?? null}, url),
					type = COALESCE(${type ?? null}, type),
					notes = COALESCE(${notes ?? null}, notes)
				WHERE id = ${id}
				RETURNING *
			`
			if (rows.length === 0)
				return res
					.status(404)
					.json({ error: "Source not found" })
			return res.json(rows[0])
		}

		if (req.method === "DELETE") {
			await sql`DELETE FROM sources WHERE id = ${id}`
			return res.json({ success: true })
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
