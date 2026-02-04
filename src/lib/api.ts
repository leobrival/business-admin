import type {
	Process,
	Tool,
	Source,
	ProcessTool,
	DashboardStats,
} from "./types"

const BASE = "/api"

async function request<T>(
	path: string,
	options?: RequestInit,
): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		headers: { "Content-Type": "application/json" },
		...options,
	})
	if (!res.ok) {
		const body = await res.json().catch(() => ({}))
		throw new Error(
			(body as { error?: string }).error ||
				`Request failed: ${res.status}`,
		)
	}
	return res.json()
}

// Processes
export const api = {
	// Dashboard
	getDashboardStats: () => request<DashboardStats>("/processes?stats=true"),

	// Processes
	getProcesses: (status?: string, category?: string) => {
		const params = new URLSearchParams()
		if (status) params.set("status", status)
		if (category) params.set("category", category)
		const qs = params.toString()
		return request<Process[]>(`/processes${qs ? `?${qs}` : ""}`)
	},
	getProcess: (id: number) =>
		request<{
			process: Process
			tools: ProcessTool[]
			sources: Source[]
		}>(`/processes/${id}`),
	createProcess: (data: Partial<Process>) =>
		request<Process>("/processes", {
			method: "POST",
			body: JSON.stringify(data),
		}),
	updateProcess: (id: number, data: Partial<Process>) =>
		request<Process>(`/processes/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		}),
	deleteProcess: (id: number) =>
		request<{ success: boolean }>(`/processes/${id}`, {
			method: "DELETE",
		}),

	// Tools
	getTools: () => request<Tool[]>("/tools"),
	getTool: (id: number) =>
		request<{ tool: Tool; processes: ProcessTool[] }>(`/tools/${id}`),
	createTool: (data: Partial<Tool>) =>
		request<Tool>("/tools", {
			method: "POST",
			body: JSON.stringify(data),
		}),
	updateTool: (id: number, data: Partial<Tool>) =>
		request<Tool>(`/tools/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		}),
	deleteTool: (id: number) =>
		request<{ success: boolean }>(`/tools/${id}`, {
			method: "DELETE",
		}),

	// Sources
	getSources: (processId?: number) => {
		const qs = processId ? `?process_id=${processId}` : ""
		return request<Source[]>(`/sources${qs}`)
	},
	createSource: (data: Partial<Source>) =>
		request<Source>("/sources", {
			method: "POST",
			body: JSON.stringify(data),
		}),
	updateSource: (id: number, data: Partial<Source>) =>
		request<Source>(`/sources/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		}),
	deleteSource: (id: number) =>
		request<{ success: boolean }>(`/sources/${id}`, {
			method: "DELETE",
		}),

	// Process-Tools links
	getProcessTools: (processId?: number) => {
		const qs = processId ? `?process_id=${processId}` : ""
		return request<ProcessTool[]>(`/process-tools${qs}`)
	},
	linkTool: (data: {
		process_id: number
		tool_id: number
		notes?: string
	}) =>
		request<ProcessTool>("/process-tools", {
			method: "POST",
			body: JSON.stringify(data),
		}),
	unlinkTool: (id: number) =>
		request<{ success: boolean }>(`/process-tools/${id}`, {
			method: "DELETE",
		}),
}
