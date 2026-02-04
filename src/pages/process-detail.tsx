import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ProcessDetailView } from "@/components/processes/process-detail"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ProcessDetailPage() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const processId = Number(id)

	const { data, isLoading, error } = useQuery({
		queryKey: ["process", processId],
		queryFn: () => api.getProcess(processId),
		enabled: !Number.isNaN(processId),
	})

	return (
		<div className="space-y-6">
			<Button
				variant="ghost"
				onClick={() => navigate("/processes")}
			>
				<ArrowLeft className="mr-1 h-4 w-4" />
				Back to Processes
			</Button>

			{isLoading && (
				<div className="space-y-4">
					<Skeleton className="h-10 w-64" />
					<Skeleton className="h-32" />
					<Skeleton className="h-48" />
				</div>
			)}

			{error && (
				<p className="text-destructive">
					Failed to load process.
				</p>
			)}

			{data && (
				<ProcessDetailView
					process={data.process}
					tools={data.tools}
					sources={data.sources}
				/>
			)}
		</div>
	)
}
