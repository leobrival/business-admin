import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { Source } from "@/lib/types"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

interface SourceFormProps {
	initial?: Partial<Source>
	onSubmit: (data: Partial<Source>) => void
	onCancel: () => void
	loading?: boolean
	hideProcessSelect?: boolean
}

export function SourceForm({
	initial,
	onSubmit,
	onCancel,
	loading,
	hideProcessSelect,
}: SourceFormProps) {
	const [processId, setProcessId] = useState(
		initial?.process_id ? String(initial.process_id) : "",
	)
	const [title, setTitle] = useState(initial?.title || "")
	const [url, setUrl] = useState(initial?.url || "")
	const [type, setType] = useState(initial?.type || "")
	const [notes, setNotes] = useState(initial?.notes || "")

	const { data: processes } = useQuery({
		queryKey: ["processes"],
		queryFn: () => api.getProcesses(),
		enabled: !hideProcessSelect,
	})

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		onSubmit({
			process_id: initial?.process_id || Number(processId),
			title,
			url: url || null,
			type: type || null,
			notes: notes || null,
		})
	}

	const canSubmit =
		title && (hideProcessSelect || processId) && !loading

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{!hideProcessSelect && (
				<div className="space-y-2">
					<Label>Process *</Label>
					<Select
						value={processId}
						onValueChange={setProcessId}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select a process..." />
						</SelectTrigger>
						<SelectContent>
							{processes?.map((p) => (
								<SelectItem
									key={p.id}
									value={String(p.id)}
								>
									{p.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}
			<div className="space-y-2">
				<Label htmlFor="src-title">Title *</Label>
				<Input
					id="src-title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="src-url">URL</Label>
				<Input
					id="src-url"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="https://..."
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="src-type">Type</Label>
				<Input
					id="src-type"
					value={type}
					onChange={(e) => setType(e.target.value)}
					placeholder="e.g. document, video, article..."
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="src-notes">Notes</Label>
				<Input
					id="src-notes"
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
				/>
			</div>
			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={!canSubmit}>
					{loading ? "Saving..." : "Save"}
				</Button>
			</div>
		</form>
	)
}
