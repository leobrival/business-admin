import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"
import type { LintResult } from "@/lib/types"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	GitBranch,
	Wrench,
	FileText,
	FileCheck,
	ChevronDown,
	ChevronRight,
	Loader2,
} from "lucide-react"
import { DescriptionTooltip } from "@/components/ui/description-tooltip"

const statusColors: Record<string, string> = {
	active: "bg-green-100 text-green-800",
	draft: "bg-gray-100 text-gray-800",
	review: "bg-yellow-100 text-yellow-800",
	deprecated: "bg-red-100 text-red-800",
	archived: "bg-blue-100 text-blue-800",
}

export default function DashboardPage() {
	const queryClient = useQueryClient()
	const [showLint, setShowLint] = useState(false)
	const [lintResults, setLintResults] = useState<LintResult[]>([])
	const [lintSummary, setLintSummary] = useState({ total: 0, withIssues: 0 })
	const [expandedProcess, setExpandedProcess] = useState<number | null>(null)

	const { data, isLoading } = useQuery({
		queryKey: ["dashboard"],
		queryFn: api.getDashboardStats,
	})

	const lintMutation = useMutation({
		mutationFn: api.lintMarkdown,
		onSuccess: (res) => {
			setLintResults(res.results)
			setLintSummary({ total: res.total, withIssues: res.withIssues })
			setShowLint(true)
		},
	})

	const fixMutation = useMutation({
		mutationFn: api.fixMarkdown,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["dashboard"] })
			lintMutation.mutate()
		},
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
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Dashboard</h2>
				<Button
					variant="outline"
					size="sm"
					onClick={() => lintMutation.mutate()}
					disabled={lintMutation.isPending}
				>
					{lintMutation.isPending ? (
						<Loader2 className="mr-1 h-4 w-4 animate-spin" />
					) : (
						<FileCheck className="mr-1 h-4 w-4" />
					)}
					Lint Markdown
				</Button>
			</div>

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
										<DescriptionTooltip
											name={p.name}
											description={p.description}
										/>
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

			{/* Lint Markdown Dialog */}
			<Dialog open={showLint} onOpenChange={setShowLint}>
				<DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Markdown Lint Results</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						{lintSummary.withIssues} of {lintSummary.total} processes
						with content have issues.
					</p>
					{lintResults.length === 0 ? (
						<p className="py-4 text-center text-sm text-muted-foreground">
							All processes are clean!
						</p>
					) : (
						<div className="space-y-2">
							{lintResults.map((r) => (
								<div
									key={r.process_id}
									className="rounded-md border"
								>
									<button
										type="button"
										className="flex w-full items-center justify-between p-3 text-left hover:bg-muted"
										onClick={() =>
											setExpandedProcess(
												expandedProcess === r.process_id
													? null
													: r.process_id,
											)
										}
									>
										<div className="flex items-center gap-2">
											{expandedProcess === r.process_id ? (
												<ChevronDown className="h-4 w-4" />
											) : (
												<ChevronRight className="h-4 w-4" />
											)}
											<span className="font-medium">
												{r.process_name}
											</span>
											<Badge variant="secondary">
												{r.issues.length} issue
												{r.issues.length > 1
													? "s"
													: ""}
											</Badge>
										</div>
										{r.issues.some((i) => i.fixable) && (
											<Button
												variant="outline"
												size="sm"
												disabled={fixMutation.isPending}
												onClick={(e) => {
													e.stopPropagation()
													fixMutation.mutate(
														r.process_id,
													)
												}}
											>
												{fixMutation.isPending ? (
													<Loader2 className="mr-1 h-3 w-3 animate-spin" />
												) : null}
												Auto-fix
											</Button>
										)}
									</button>
									{expandedProcess === r.process_id && (
										<div className="border-t px-3 pb-3">
											<table className="mt-2 w-full text-sm">
												<thead>
													<tr className="text-left text-muted-foreground">
														<th className="pb-1 pr-3">
															Line
														</th>
														<th className="pb-1 pr-3">
															Rule
														</th>
														<th className="pb-1">
															Description
														</th>
													</tr>
												</thead>
												<tbody>
													{r.issues.map(
														(issue, idx) => (
															<tr
																key={idx}
																className="border-t"
															>
																<td className="py-1 pr-3 tabular-nums">
																	{issue.line}
																</td>
																<td className="py-1 pr-3 font-mono text-xs">
																	{issue.rule}
																</td>
																<td className="py-1">
																	{
																		issue.description
																	}
																	{issue.detail && (
																		<span className="ml-1 text-muted-foreground">
																			({issue.detail})
																		</span>
																	)}
																</td>
															</tr>
														),
													)}
												</tbody>
											</table>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
