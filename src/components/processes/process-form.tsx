import { useState } from "react"
import type { Process } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

interface ProcessFormProps {
	initial?: Partial<Process>
	onSubmit: (data: Partial<Process>) => void
	onCancel: () => void
	loading?: boolean
}

const statuses = [
	"draft",
	"active",
	"review",
	"deprecated",
	"archived",
] as const

export function ProcessForm({
	initial,
	onSubmit,
	onCancel,
	loading,
}: ProcessFormProps) {
	const [name, setName] = useState(initial?.name || "")
	const [description, setDescription] = useState(
		initial?.description || "",
	)
	const [category, setCategory] = useState(
		initial?.category || "",
	)
	const [status, setStatus] = useState(
		initial?.status || "draft",
	)
	const [content, setContent] = useState(initial?.content || "")

	const contentLineCount = content ? content.split("\n").length : 0
	const contentOverLimit = contentLineCount > 500

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		onSubmit({
			name,
			description: description || null,
			category: category || null,
			status,
			content: content || null,
		})
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Name *</Label>
				<Input
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={3}
				/>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="category">Category</Label>
					<Input
						id="category"
						value={category}
						onChange={(e) => setCategory(e.target.value)}
					/>
				</div>
				<div className="space-y-2">
					<Label>Status</Label>
					<Select value={status} onValueChange={(v) => setStatus(v as Process["status"])}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{statuses.map((s) => (
								<SelectItem key={s} value={s}>
									{s}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="content">Content</Label>
					<span
						className={`text-xs ${contentOverLimit ? "text-destructive font-medium" : "text-muted-foreground"}`}
					>
						{contentLineCount} / 500 lines
					</span>
				</div>
				<Textarea
					id="content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					rows={4}
					placeholder="Process content..."
				/>
				{contentOverLimit && (
					<p className="text-xs text-destructive">
						Content must not exceed 500 lines.
					</p>
				)}
			</div>
			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={!name || loading || contentOverLimit}>
					{loading ? "Saving..." : "Save"}
				</Button>
			</div>
		</form>
	)
}
