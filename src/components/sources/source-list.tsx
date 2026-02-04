import { Link } from "react-router-dom"
import type { Source } from "@/lib/types"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ExternalLink } from "lucide-react"

interface SourceListProps {
	sources: Source[]
	onEdit: (source: Source) => void
	onDelete: (id: number) => void
}

export function SourceList({
	sources,
	onEdit,
	onDelete,
}: SourceListProps) {
	if (sources.length === 0) {
		return (
			<p className="py-8 text-center text-muted-foreground">
				No sources found.
			</p>
		)
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Title</TableHead>
					<TableHead>Process</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>URL</TableHead>
					<TableHead className="text-right">
						Actions
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{sources.map((s) => (
					<TableRow key={s.id}>
						<TableCell className="font-medium">
							{s.title}
						</TableCell>
						<TableCell>
							<Link
								to={`/processes/${s.process_id}`}
								className="text-blue-600 hover:underline"
							>
								{s.process_name || `#${s.process_id}`}
							</Link>
						</TableCell>
						<TableCell>
							{s.type || (
								<span className="text-muted-foreground">
									—
								</span>
							)}
						</TableCell>
						<TableCell>
							{s.url ? (
								<a
									href={s.url}
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
						<TableCell className="text-right">
							<div className="flex justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onEdit(s)}
								>
									<Pencil className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onDelete(s.id)}
								>
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
