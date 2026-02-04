import type { Tool } from "@/lib/types"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, ExternalLink } from "lucide-react"
import { DescriptionTooltip } from "@/components/ui/description-tooltip"
import { ConfirmDelete } from "@/components/ui/confirm-delete"

interface ToolListProps {
	tools: Tool[]
	onEdit: (tool: Tool) => void
	onDelete: (id: number) => void
}

export function ToolList({ tools, onEdit, onDelete }: ToolListProps) {
	if (tools.length === 0) {
		return (
			<p className="py-8 text-center text-muted-foreground">
				No tools found.
			</p>
		)
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Category</TableHead>
					<TableHead>URL</TableHead>
					<TableHead className="text-center">
						Processes
					</TableHead>
					<TableHead className="text-right">
						Actions
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{tools.map((t) => (
					<TableRow key={t.id}>
						<TableCell className="font-medium">
							<DescriptionTooltip
								name={t.name}
								description={t.description}
							/>
						</TableCell>
						<TableCell>
							{t.category ? (
								<Badge variant="outline">
									{t.category}
								</Badge>
							) : (
								<span className="text-muted-foreground">
									—
								</span>
							)}
						</TableCell>
						<TableCell>
							{t.url ? (
								<a
									href={t.url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-blue-600 hover:underline"
								>
									Link
									<ExternalLink className="h-3 w-3" />
								</a>
							) : (
								"—"
							)}
						</TableCell>
						<TableCell className="text-center">
							{t.process_count ?? 0}
						</TableCell>
						<TableCell className="text-right">
							<div className="flex justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onEdit(t)}
								>
									<Pencil className="h-4 w-4" />
								</Button>
								<ConfirmDelete
									onConfirm={() => onDelete(t.id)}
									title="Delete tool?"
									description="This will permanently delete this tool and unlink it from all processes."
								/>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
