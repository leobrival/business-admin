import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { GitBranch, Wrench, FileText } from "lucide-react"

const statusColors: Record<string, string> = {
	active: "bg-green-100 text-green-800",
	draft: "bg-gray-100 text-gray-800",
	review: "bg-yellow-100 text-yellow-800",
	deprecated: "bg-red-100 text-red-800",
	archived: "bg-blue-100 text-blue-800",
}

export default function DashboardPage() {
	const { data, isLoading } = useQuery({
		queryKey: ["dashboard"],
		queryFn: api.getDashboardStats,
	})

	if (isLoading) {
		return (
			<div className="space-y-6">
				<h2 className="text-2xl font-bold">Dashboard</h2>
				<div className="grid grid-cols-3 gap-4">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-28" />
					))}
				</div>
				<div className="grid grid-cols-2 gap-4">
					<Skeleton className="h-48" />
					<Skeleton className="h-48" />
				</div>
			</div>
		)
	}

	if (!data) return null

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold">Dashboard</h2>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Processes
						</CardTitle>
						<GitBranch className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{data.total_processes}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Tools
						</CardTitle>
						<Wrench className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{data.total_tools}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Sources
						</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{data.total_sources}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>By Status</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{Object.entries(data.by_status).map(
								([status, count]) => (
									<Badge
										key={status}
										variant="secondary"
										className={
											statusColors[status] || ""
										}
									>
										{status}: {count}
									</Badge>
								),
							)}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>By Category</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{Object.entries(data.by_category).map(
								([category, count]) => (
									<Badge
										key={category}
										variant="outline"
									>
										{category}: {count}
									</Badge>
								),
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Recently Updated</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{data.recent_processes.map((p) => (
							<Link
								key={p.id}
								to={`/processes/${p.id}`}
								className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted"
							>
								<div>
									<span className="font-medium">
										{p.name}
									</span>
									{p.category && (
										<span className="ml-2 text-sm text-muted-foreground">
											{p.category}
										</span>
									)}
								</div>
								<Badge
									className={
										statusColors[p.status] || ""
									}
								>
									{p.status}
								</Badge>
							</Link>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
