import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getDb } from "../_db"

export default async function handler(
	req: VercelRequest,
	res: VercelResponse,
) {
	res.setHeader("Access-Control-Allow-Origin", "*")
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, PUT, DELETE, OPTIONS",
	)
	res.setHeader("Access-Control-Allow-Headers", "Content-Type")

	if (req.method === "OPTIONS") return res.status(200).end()

	const id = Number(req.query.id)
	if (Number.isNaN(id))
		return res.status(400).json({ error: "Invalid ID" })

	const sql = getDb()

	try {
		if (req.method === "GET") {
			const tools = await sql`
				SELECT * FROM tools WHERE id = ${id}
			`
			if (tools.length === 0) {
				return res
					.status(404)
					.json({ error: "Tool not found" })
			}
			const processes = await sql`
				SELECT pt.*, p.name as process_name
				FROM process_tools pt
				JOIN processes p ON p.id = pt.process_id
				WHERE pt.tool_id = ${id}
				ORDER BY pt.created_at DESC
			`
			return res.json({ tool: tools[0], processes })
		}

		if (req.method === "PUT") {
			const { name, description, url, category } = req.body
			const rows = await sql`
				UPDATE tools
				SET name = COALESCE(${name ?? null}, name),
					description = COALESCE(${description ?? null}, description),
					url = COALESCE(${url ?? null}, url),
					category = COALESCE(${category ?? null}, category),
					updated_at = NOW()
				WHERE id = ${id}
				RETURNING *
			`
			if (rows.length === 0)
				return res
					.status(404)
					.json({ error: "Tool not found" })
			return res.json(rows[0])
		}

		if (req.method === "DELETE") {
			await sql`DELETE FROM process_tools WHERE tool_id = ${id}`
			await sql`DELETE FROM tools WHERE id = ${id}`
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
