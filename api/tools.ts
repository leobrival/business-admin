import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getDb, toSlug } from "./_db"

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
			const rows = await sql`
				SELECT t.*,
					(SELECT COUNT(*) FROM process_tools pt WHERE pt.tool_id = t.id) as process_count
				FROM tools t
				ORDER BY t.name ASC
			`
			return res.json(rows)
		}

		if (req.method === "POST") {
			const { name, description, url, category } = req.body
			if (!name) {
				return res
					.status(400)
					.json({ error: "Name is required" })
			}
			const slug = toSlug(name)
			const rows = await sql`
				INSERT INTO tools (name, slug, description, url, category)
				VALUES (${name}, ${slug}, ${description || null}, ${url || null}, ${category || null})
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
