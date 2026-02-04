export interface Process {
	id: number
	name: string
	description: string | null
	category: string | null
	status: "active" | "draft" | "review" | "deprecated" | "archived"
	steps: string | null
	created_at: string
	updated_at: string
	tool_count?: number
	source_count?: number
}

export interface Tool {
	id: number
	name: string
	description: string | null
	url: string | null
	category: string | null
	created_at: string
	updated_at: string
	process_count?: number
}

export interface Source {
	id: number
	process_id: number
	title: string
	url: string | null
	type: string | null
	notes: string | null
	created_at: string
	process_name?: string
}

export interface ProcessTool {
	id: number
	process_id: number
	tool_id: number
	notes: string | null
	created_at: string
	tool_name?: string
	tool_description?: string | null
	process_name?: string
}

export interface DashboardStats {
	total_processes: number
	total_tools: number
	total_sources: number
	by_status: Record<string, number>
	by_category: Record<string, number>
	recent_processes: Process[]
}
