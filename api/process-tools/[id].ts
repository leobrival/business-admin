import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getDb } from "../_db"

export default async function handler(
	req: VercelRequest,
	res: VercelResponse,
) {
	res.setHeader("Access-Control-Allow-Origin", "*")
	res.setHeader(
		"Access-Control-Allow-Methods",
		"DELETE, OPTIONS",
	)
	res.setHeader("Access-Control-Allow-Headers", "Content-Type")

	if (req.method === "OPTIONS") return res.status(200).end()

	const id = Number(req.query.id)
	if (Number.isNaN(id))
		return res.status(400).json({ error: "Invalid ID" })

	const sql = getDb()

	try {
		if (req.method === "DELETE") {
			await sql`DELETE FROM process_tools WHERE id = ${id}`
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
