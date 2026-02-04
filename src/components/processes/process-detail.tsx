import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Process, ProcessTool, Source } from "@/lib/types"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Plus, ExternalLink } from "lucide-react"
import { DescriptionTooltip } from "@/components/ui/description-tooltip"
import { ConfirmDelete } from "@/components/ui/confirm-delete"

const statusColors: Record<string, string> = {
	active: "bg-green-100 text-green-800",
	draft: "bg-gray-100 text-gray-800",
	review: "bg-yellow-100 text-yellow-800",
	deprecated: "bg-red-100 text-red-800",
	archived: "bg-blue-100 text-blue-800",
}

interface ProcessDetailViewProps {
	process: Process
	tools: ProcessTool[]
	sources: Source[]
}

export function ProcessDetailView({
	process,
	tools,
	sources,
}: ProcessDetailViewProps) {
	const queryClient = useQueryClient()
	const [showLinkTool, setShowLinkTool] = useState(false)
	const [showAddSource, setShowAddSource] = useState(false)
	const [selectedToolId, setSelectedToolId] = useState("")
	const [sourceForm, setSourceForm] = useState({
		name: "",
		url: "",
		type: "",
		description: "",
	})

	const { data: allTools } = useQuery({
		queryKey: ["tools"],
		queryFn: api.getTools,
		enabled: showLinkTool,
	})

	const linkToolMutation = useMutation({
		mutationFn: (toolId: number) =>
			api.linkTool({
				process_id: process.id,
				tool_id: toolId,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["process", process.id],
			})
			setShowLinkTool(false)
			setSelectedToolId("")
		},
	})

	const unlinkToolMutation = useMutation({
		mutationFn: api.unlinkTool,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["process", process.id],
			})
		},
	})

	const addSourceMutation = useMutation({
		mutationFn: (data: Partial<Source>) =>
			api.createSource({ ...data, process_id: process.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["process", process.id],
			})
			setShowAddSource(false)
			setSourceForm({ name: "", url: "", type: "", description: "" })
		},
	})

	const deleteSourceMutation = useMutation({
		mutationFn: api.deleteSource,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["process", process.id],
			})
		},
	})

	const linkedToolIds = new Set(tools.map((t) => t.tool_id))
	const availableTools = allTools?.filter(
		(t) => !linkedToolIds.has(t.id),
	)

	return (
		<div className="space-y-6">
			<div>
				<div className="flex items-center gap-3">
					<h2 className="text-2xl font-bold">{process.name}</h2>
					<Badge className={statusColors[process.status] || ""}>
						{process.status}
					</Badge>
				</div>
				{process.category && (
					<p className="mt-1 text-sm text-muted-foreground">
						Category: {process.category}
					</p>
				)}
				{process.description && (
					<p className="mt-2 text-muted-foreground">
						{process.description}
					</p>
				)}
				{process.content && (
					<Card className="mt-4">
						<CardHeader>
							<CardTitle className="text-base">Content</CardTitle>
						</CardHeader>
						<CardContent>
							<pre className="whitespace-pre-wrap text-sm">
								{process.content}
							</pre>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Tools Section */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Linked Tools ({tools.length})</CardTitle>
					<Button
						size="sm"
						onClick={() => setShowLinkTool(true)}
					>
						<Plus className="mr-1 h-4 w-4" />
						Link Tool
					</Button>
				</CardHeader>
				<CardContent>
					{tools.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No tools linked yet.
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Tool</TableHead>
									<TableHead>Description</TableHead>
									<TableHead className="w-16" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{tools.map((pt) => (
									<TableRow key={pt.id}>
										<TableCell className="font-medium">
											<DescriptionTooltip
												name={pt.tool_name || ""}
												description={pt.tool_description}
											/>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{pt.tool_description || "—"}
										</TableCell>
										<TableCell>
											<ConfirmDelete
												onConfirm={() =>
													unlinkToolMutation.mutate(
														pt.id,
													)
												}
												title="Unlink tool?"
												description="This will remove the link between this tool and the process."
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Sources Section */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Sources ({sources.length})</CardTitle>
					<Button
						size="sm"
						onClick={() => setShowAddSource(true)}
					>
						<Plus className="mr-1 h-4 w-4" />
						Add Source
					</Button>
				</CardHeader>
				<CardContent>
					{sources.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No sources yet.
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Title</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>URL</TableHead>
									<TableHead className="w-16" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{sources.map((s) => (
									<TableRow key={s.id}>
										<TableCell className="font-medium">
											{s.name}
										</TableCell>
										<TableCell>
											{s.type || "—"}
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
										<TableCell>
											<ConfirmDelete
												onConfirm={() =>
													deleteSourceMutation.mutate(
														s.id,
													)
												}
												title="Delete source?"
												description="This will permanently delete this source."
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Link Tool Dialog */}
			<Dialog open={showLinkTool} onOpenChange={setShowLinkTool}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Link a Tool</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<Select
							value={selectedToolId}
							onValueChange={setSelectedToolId}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a tool..." />
							</SelectTrigger>
							<SelectContent>
								{availableTools?.map((t) => (
									<SelectItem
										key={t.id}
										value={String(t.id)}
									>
										{t.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => setShowLinkTool(false)}
							>
								Cancel
							</Button>
							<Button
								disabled={
									!selectedToolId ||
									linkToolMutation.isPending
								}
								onClick={() =>
									linkToolMutation.mutate(
										Number(selectedToolId),
									)
								}
							>
								Link
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Add Source Dialog */}
			<Dialog open={showAddSource} onOpenChange={setShowAddSource}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Source</DialogTitle>
					</DialogHeader>
					<form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault()
							addSourceMutation.mutate({
								name: sourceForm.name,
								url: sourceForm.url || null,
								type: sourceForm.type || "document",
								description: sourceForm.description || null,
							})
						}}
					>
						<div className="space-y-2">
							<Label htmlFor="source-name">Name *</Label>
							<Input
								id="source-name"
								value={sourceForm.name}
								onChange={(e) =>
									setSourceForm((f) => ({
										...f,
										name: e.target.value,
									}))
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="source-url">URL</Label>
							<Input
								id="source-url"
								value={sourceForm.url}
								onChange={(e) =>
									setSourceForm((f) => ({
										...f,
										url: e.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="source-type">Type</Label>
							<Input
								id="source-type"
								value={sourceForm.type}
								onChange={(e) =>
									setSourceForm((f) => ({
										...f,
										type: e.target.value,
									}))
								}
								placeholder="e.g. document, video, article..."
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="source-description">Description</Label>
							<Input
								id="source-description"
								value={sourceForm.description}
								onChange={(e) =>
									setSourceForm((f) => ({
										...f,
										description: e.target.value,
									}))
								}
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowAddSource(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={
									!sourceForm.name ||
									addSourceMutation.isPending
								}
							>
								Add
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
