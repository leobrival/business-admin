import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Source } from "@/lib/types"
import { SourceList } from "@/components/sources/source-list"
import { SourceForm } from "@/components/sources/source-form"
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

export default function SourcesPage() {
	const queryClient = useQueryClient()
	const [showForm, setShowForm] = useState(false)
	const [editing, setEditing] = useState<Source | null>(null)

	const { data: sources, isLoading } = useQuery({
		queryKey: ["sources"],
		queryFn: () => api.getSources(),
	})

	const createMutation = useMutation({
		mutationFn: api.createSource,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sources"] })
			setShowForm(false)
		},
	})

	const updateMutation = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number
			data: Partial<Source>
		}) => api.updateSource(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sources"] })
			setEditing(null)
		},
	})

	const deleteMutation = useMutation({
		mutationFn: api.deleteSource,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sources"] })
		},
	})

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Sources</h2>
				<Button onClick={() => setShowForm(true)}>
					<Plus className="mr-1 h-4 w-4" />
					New Source
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
						<SourceList
							sources={sources || []}
							onEdit={(s) => setEditing(s)}
							onDelete={(id) =>
								deleteMutation.mutate(id)
							}
						/>
					)}
				</CardContent>
			</Card>

			<Dialog open={showForm} onOpenChange={setShowForm}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>New Source</DialogTitle>
					</DialogHeader>
					<SourceForm
						onSubmit={(data) =>
							createMutation.mutate(data)
						}
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
						<DialogTitle>Edit Source</DialogTitle>
					</DialogHeader>
					{editing && (
						<SourceForm
							initial={editing}
							onSubmit={(data) =>
								updateMutation.mutate({
									id: editing.id,
									data,
								})
							}
							onCancel={() => setEditing(null)}
							loading={updateMutation.isPending}
							hideProcessSelect
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
