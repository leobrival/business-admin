import type { VercelRequest, VercelResponse } from "@vercel/node"
import { neon } from "@neondatabase/serverless"

function getDb() {
	return neon(process.env.NEON_DATABASE_URL!)
}

function toSlug(name: string): string {
	return name
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 50)
}

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
			const processes = await sql`
				SELECT * FROM processes WHERE id = ${id}
			`
			if (processes.length === 0) {
				return res
					.status(404)
					.json({ error: "Process not found" })
			}
			const tools = await sql`
				SELECT pt.*, t.name as tool_name, t.description as tool_description
				FROM process_tools pt
				JOIN tools t ON t.id = pt.tool_id
				WHERE pt.process_id = ${id}
				ORDER BY pt.created_at DESC
			`
			const sources = await sql`
				SELECT * FROM sources WHERE process_id = ${id} ORDER BY created_at DESC
			`
			return res.json({
				process: processes[0],
				tools,
				sources,
			})
		}

		if (req.method === "PUT") {
			const { name, description, category, status, content, loom_link } =
				req.body
			if (
				content &&
				content.split("\n").length > 500
			) {
				return res
					.status(400)
					.json({ error: "Content must not exceed 500 lines" })
			}
			const slug = name ? toSlug(name) : null
			const rows = await sql`
				UPDATE processes
				SET name = COALESCE(${name ?? null}, name),
					slug = COALESCE(${slug}, slug),
					description = COALESCE(${description ?? null}, description),
					category = COALESCE(${category ?? null}, category),
					status = COALESCE(${status ?? null}, status),
					content = COALESCE(${content ?? null}, content),
					loom_link = COALESCE(${loom_link ?? null}, loom_link),
					updated_at = NOW()
				WHERE id = ${id}
				RETURNING *
			`
			if (rows.length === 0)
				return res
					.status(404)
					.json({ error: "Process not found" })
			return res.json(rows[0])
		}

		if (req.method === "DELETE") {
			await sql`DELETE FROM process_tools WHERE process_id = ${id}`
			await sql`DELETE FROM sources WHERE process_id = ${id}`
			await sql`DELETE FROM processes WHERE id = ${id}`
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
