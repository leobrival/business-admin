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
		"GET, POST, OPTIONS",
	)
	res.setHeader("Access-Control-Allow-Headers", "Content-Type")

	if (req.method === "OPTIONS") return res.status(200).end()

	const sql = getDb()

	try {
		if (req.method === "GET") {
			// Dashboard stats mode
			if (req.query.stats === "true") {
				const processes = await sql`
					SELECT p.*,
						(SELECT COUNT(*) FROM process_tools pt WHERE pt.process_id = p.id) as tool_count,
						(SELECT COUNT(*) FROM sources s WHERE s.process_id = p.id) as source_count
					FROM processes p ORDER BY p.updated_at DESC
				`
				const tools =
					await sql`SELECT COUNT(*) as count FROM tools`
				const sources =
					await sql`SELECT COUNT(*) as count FROM sources`

				const byStatus: Record<string, number> = {}
				const byCategory: Record<string, number> = {}
				for (const p of processes) {
					byStatus[p.status] =
						(byStatus[p.status] || 0) + 1
					const cat = p.category || "Uncategorized"
					byCategory[cat] = (byCategory[cat] || 0) + 1
				}

				return res.json({
					total_processes: processes.length,
					total_tools: Number(tools[0].count),
					total_sources: Number(sources[0].count),
					by_status: byStatus,
					by_category: byCategory,
					recent_processes: processes.slice(0, 5),
				})
			}

			// List with optional filters
			const { status, category } = req.query
			let rows
			if (status && category) {
				rows = await sql`
					SELECT p.*,
						(SELECT COUNT(*) FROM process_tools pt WHERE pt.process_id = p.id) as tool_count,
						(SELECT COUNT(*) FROM sources s WHERE s.process_id = p.id) as source_count
					FROM processes p
					WHERE p.status = ${status as string} AND p.category = ${category as string}
					ORDER BY p.updated_at DESC
				`
			} else if (status) {
				rows = await sql`
					SELECT p.*,
						(SELECT COUNT(*) FROM process_tools pt WHERE pt.process_id = p.id) as tool_count,
						(SELECT COUNT(*) FROM sources s WHERE s.process_id = p.id) as source_count
					FROM processes p
					WHERE p.status = ${status as string}
					ORDER BY p.updated_at DESC
				`
			} else if (category) {
				rows = await sql`
					SELECT p.*,
						(SELECT COUNT(*) FROM process_tools pt WHERE pt.process_id = p.id) as tool_count,
						(SELECT COUNT(*) FROM sources s WHERE s.process_id = p.id) as source_count
					FROM processes p
					WHERE p.category = ${category as string}
					ORDER BY p.updated_at DESC
				`
			} else {
				rows = await sql`
					SELECT p.*,
						(SELECT COUNT(*) FROM process_tools pt WHERE pt.process_id = p.id) as tool_count,
						(SELECT COUNT(*) FROM sources s WHERE s.process_id = p.id) as source_count
					FROM processes p
					ORDER BY p.updated_at DESC
				`
			}
			return res.json(rows)
		}

		if (req.method === "POST") {
			const { name, description, category, status, content, loom_link } =
				req.body
			if (!name) {
				return res
					.status(400)
					.json({ error: "Name is required" })
			}
			if (
				content &&
				content.split("\n").length > 500
			) {
				return res
					.status(400)
					.json({ error: "Content must not exceed 500 lines" })
			}
			const slug = toSlug(name)
			const rows = await sql`
				INSERT INTO processes (name, slug, description, category, status, content, loom_link)
				VALUES (${name}, ${slug}, ${description || null}, ${category || null}, ${status || "draft"}, ${content || null}, ${loom_link || null})
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
