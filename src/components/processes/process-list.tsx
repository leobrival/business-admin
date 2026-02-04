import { Link } from "react-router-dom"
import type { Process } from "@/lib/types"
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
import { Pencil, Eye } from "lucide-react"
import { DescriptionTooltip } from "@/components/ui/description-tooltip"
import { ConfirmDelete } from "@/components/ui/confirm-delete"

const statusColors: Record<string, string> = {
	active: "bg-green-100 text-green-800",
	draft: "bg-gray-100 text-gray-800",
	review: "bg-yellow-100 text-yellow-800",
	deprecated: "bg-red-100 text-red-800",
	archived: "bg-blue-100 text-blue-800",
}

interface ProcessListProps {
	processes: Process[]
	onEdit: (process: Process) => void
	onDelete: (id: number) => void
}

export function ProcessList({
	processes,
	onEdit,
	onDelete,
}: ProcessListProps) {
	if (processes.length === 0) {
		return (
			<p className="py-8 text-center text-muted-foreground">
				No processes found.
			</p>
		)
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Category</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className="text-center">
						Tools
					</TableHead>
					<TableHead className="text-center">
						Sources
					</TableHead>
					<TableHead className="text-right">
						Actions
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{processes.map((p) => (
					<TableRow key={p.id}>
						<TableCell className="font-medium">
							<DescriptionTooltip
								name={p.name}
								description={p.description}
							/>
						</TableCell>
						<TableCell>
							{p.category || (
								<span className="text-muted-foreground">
									—
								</span>
							)}
						</TableCell>
						<TableCell>
							<Badge
								className={
									statusColors[p.status] || ""
								}
							>
								{p.status}
							</Badge>
						</TableCell>
						<TableCell className="text-center">
							{p.tool_count ?? 0}
						</TableCell>
						<TableCell className="text-center">
							{p.source_count ?? 0}
						</TableCell>
						<TableCell className="text-right">
							<div className="flex justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									asChild
								>
									<Link
										to={`/processes/${p.id}`}
									>
										<Eye className="h-4 w-4" />
									</Link>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onEdit(p)}
								>
									<Pencil className="h-4 w-4" />
								</Button>
								<ConfirmDelete
									onConfirm={() => onDelete(p.id)}
									title="Delete process?"
									description="This will permanently delete this process and all its linked tools and sources."
								/>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
