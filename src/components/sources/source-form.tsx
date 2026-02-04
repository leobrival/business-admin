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
	const [name, setName] = useState(initial?.name || "")
	const [url, setUrl] = useState(initial?.url || "")
	const [type, setType] = useState(initial?.type || "")
	const [description, setDescription] = useState(
		initial?.description || "",
	)

	const { data: processes } = useQuery({
		queryKey: ["processes"],
		queryFn: () => api.getProcesses(),
		enabled: !hideProcessSelect,
	})

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		onSubmit({
			process_id: initial?.process_id || Number(processId),
			name,
			url: url || null,
			type: type || "document",
			description: description || null,
		})
	}

	const canSubmit =
		name && type && (hideProcessSelect || processId) && !loading

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
				<Label htmlFor="src-name">Name *</Label>
				<Input
					id="src-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
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
				<Label htmlFor="src-type">Type *</Label>
				<Input
					id="src-type"
					value={type}
					onChange={(e) => setType(e.target.value)}
					placeholder="e.g. document, video, article..."
					required
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="src-description">Description</Label>
				<Input
					id="src-description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
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
