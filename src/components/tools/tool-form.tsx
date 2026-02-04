import { useState } from "react"
import type { Tool } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ToolFormProps {
	initial?: Partial<Tool>
	onSubmit: (data: Partial<Tool>) => void
	onCancel: () => void
	loading?: boolean
}

export function ToolForm({
	initial,
	onSubmit,
	onCancel,
	loading,
}: ToolFormProps) {
	const [name, setName] = useState(initial?.name || "")
	const [description, setDescription] = useState(
		initial?.description || "",
	)
	const [url, setUrl] = useState(initial?.url || "")
	const [category, setCategory] = useState(
		initial?.category || "",
	)

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		onSubmit({
			name,
			description: description || null,
			url: url || null,
			category: category || null,
		})
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="tool-name">Name *</Label>
				<Input
					id="tool-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="tool-description">Description</Label>
				<Textarea
					id="tool-description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={3}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="tool-url">URL</Label>
				<Input
					id="tool-url"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="https://..."
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="tool-category">Category</Label>
				<Input
					id="tool-category"
					value={category}
					onChange={(e) => setCategory(e.target.value)}
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
				<Button type="submit" disabled={!name || loading}>
					{loading ? "Saving..." : "Save"}
				</Button>
			</div>
		</form>
	)
}
