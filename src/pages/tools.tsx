import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Tool } from "@/lib/types"
import { ToolList } from "@/components/tools/tool-list"
import { ToolForm } from "@/components/tools/tool-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"

export default function ToolsPage() {
	const queryClient = useQueryClient()
	const [showForm, setShowForm] = useState(false)
	const [editing, setEditing] = useState<Tool | null>(null)

	const { data: tools, isLoading } = useQuery({
		queryKey: ["tools"],
		queryFn: api.getTools,
	})

	const createMutation = useMutation({
		mutationFn: api.createTool,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tools"] })
			setShowForm(false)
		},
	})

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<Tool> }) =>
			api.updateTool(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tools"] })
			setEditing(null)
		},
	})

	const deleteMutation = useMutation({
		mutationFn: api.deleteTool,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tools"] })
		},
	})

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Tools</h2>
				<Button onClick={() => setShowForm(true)}>
					<Plus className="mr-1 h-4 w-4" />
					New Tool
				</Button>
			</div>

			<Card>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="space-y-2 p-6">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-12" />
							))}
						</div>
					) : (
						<ToolList
							tools={tools || []}
							onEdit={(t) => setEditing(t)}
							onDelete={(id) => deleteMutation.mutate(id)}
						/>
					)}
				</CardContent>
			</Card>

			<Dialog open={showForm} onOpenChange={setShowForm}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>New Tool</DialogTitle>
					</DialogHeader>
					<ToolForm
						onSubmit={(data) => createMutation.mutate(data)}
						onCancel={() => setShowForm(false)}
						loading={createMutation.isPending}
					/>
				</DialogContent>
			</Dialog>

			<Dialog
				open={editing !== null}
				onOpenChange={(open) => {
					if (!open) setEditing(null)
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Tool</DialogTitle>
					</DialogHeader>
					{editing && (
						<ToolForm
							initial={editing}
							onSubmit={(data) =>
								updateMutation.mutate({
									id: editing.id,
									data,
								})
							}
							onCancel={() => setEditing(null)}
							loading={updateMutation.isPending}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
