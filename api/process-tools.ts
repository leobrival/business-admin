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
					SELECT pt.*, t.name as tool_name, t.description as tool_description
					FROM process_tools pt
					JOIN tools t ON t.id = pt.tool_id
					WHERE pt.process_id = ${Number(process_id)}
					ORDER BY pt.created_at DESC
				`
			} else {
				rows = await sql`
					SELECT pt.*, t.name as tool_name, p.name as process_name
					FROM process_tools pt
					JOIN tools t ON t.id = pt.tool_id
					JOIN processes p ON p.id = pt.process_id
					ORDER BY pt.created_at DESC
				`
			}
			return res.json(rows)
		}

		if (req.method === "POST") {
			const { process_id, tool_id, notes } = req.body
			if (!process_id || !tool_id) {
				return res.status(400).json({
					error: "process_id and tool_id are required",
				})
			}
			// Check if link already exists
			const existing = await sql`
				SELECT id FROM process_tools
				WHERE process_id = ${process_id} AND tool_id = ${tool_id}
			`
			if (existing.length > 0) {
				return res.status(409).json({
					error: "This tool is already linked to this process",
				})
			}
			const rows = await sql`
				INSERT INTO process_tools (process_id, tool_id, notes)
				VALUES (${process_id}, ${tool_id}, ${notes || null})
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
