import type { VercelRequest, VercelResponse } from "@vercel/node"
import { neon } from "@neondatabase/serverless"
import { lint } from "markdownlint/promise"
import { applyFixes } from "markdownlint"

function getDb() {
	return neon(process.env.NEON_DATABASE_URL!)
}

const lintConfig = {
	default: true,
	MD013: false,
	MD033: false,
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
			const processes = await sql`
				SELECT id, name, content FROM processes
				WHERE content IS NOT NULL AND content != '' AND deleted_at IS NULL
				ORDER BY name
			`

			const results = []
			for (const p of processes) {
				const lintResults = await lint({
					strings: { [String(p.id)]: p.content as string },
					config: lintConfig,
				})

				const issues = (lintResults[String(p.id)] || []).map(
					(r: {
						lineNumber: number
						ruleNames: string[]
						ruleDescription: string
						ruleInformation: string
						errorDetail: string | null
						errorContext: string | null
						fixInfo: unknown
					}) => ({
						line: r.lineNumber,
						rule: r.ruleNames[0],
						description: r.ruleDescription,
						detail: r.errorDetail || null,
						context: r.errorContext || null,
						fixable: !!r.fixInfo,
					}),
				)

				if (issues.length > 0) {
					results.push({
						process_id: p.id,
						process_name: p.name,
						issues,
					})
				}
			}

			return res.json({
				results,
				total: processes.length,
				withIssues: results.length,
			})
		}

		if (req.method === "POST") {
			const { action, process_id } = req.body

			if (action !== "fix" || !process_id) {
				return res
					.status(400)
					.json({ error: "Invalid request. Expected action=fix and process_id." })
			}

			const rows = await sql`
				SELECT id, content FROM processes WHERE id = ${process_id}
			`

			if (rows.length === 0) {
				return res.status(404).json({ error: "Process not found" })
			}

			const content = rows[0].content as string
			if (!content) {
				return res.json({ success: true, fixed: 0 })
			}

			const lintResults = await lint({
				strings: { content },
				config: lintConfig,
			})

			const errors = lintResults.content || []
			if (errors.length === 0) {
				return res.json({ success: true, fixed: 0 })
			}

			const fixed = applyFixes(content, errors)

			await sql`
				UPDATE processes SET content = ${fixed}, updated_at = NOW()
				WHERE id = ${process_id}
			`

			return res.json({ success: true, fixed: errors.length })
		}

		return res.status(405).json({ error: "Method not allowed" })
	} catch (error) {
		console.error("Lint API Error:", error)
		return res.status(500).json({
			error:
				error instanceof Error
					? error.message
					: "Internal server error",
		})
	}
}
