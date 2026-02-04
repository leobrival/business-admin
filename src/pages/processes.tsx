import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Process } from "@/lib/types"
import { ProcessList } from "@/components/processes/process-list"
import { ProcessForm } from "@/components/processes/process-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"

const statuses = ["all", "draft", "active", "review", "deprecated", "archived"]

export default function ProcessesPage() {
	const queryClient = useQueryClient()
	const [statusFilter, setStatusFilter] = useState("all")
	const [showForm, setShowForm] = useState(false)
	const [editing, setEditing] = useState<Process | null>(null)

	const { data: processes, isLoading } = useQuery({
		queryKey: [
			"processes",
			statusFilter === "all" ? undefined : statusFilter,
		],
		queryFn: () =>
			api.getProcesses(
				statusFilter === "all" ? undefined : statusFilter,
			),
	})

	const createMutation = useMutation({
		mutationFn: api.createProcess,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["processes"] })
			setShowForm(false)
		},
	})

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<Process> }) =>
			api.updateProcess(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["processes"] })
			setEditing(null)
		},
	})

	const deleteMutation = useMutation({
		mutationFn: api.deleteProcess,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["processes"] })
		},
	})

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Processes</h2>
				<Button onClick={() => setShowForm(true)}>
					<Plus className="mr-1 h-4 w-4" />
					New Process
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<Select
					value={statusFilter}
					onValueChange={setStatusFilter}
				>
					<SelectTrigger className="w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{statuses.map((s) => (
							<SelectItem key={s} value={s}>
								{s === "all" ? "All statuses" : s}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
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
						<ProcessList
							processes={processes || []}
							onEdit={(p) => setEditing(p)}
							onDelete={(id) => deleteMutation.mutate(id)}
						/>
					)}
				</CardContent>
			</Card>

			{/* Create Dialog */}
			<Dialog open={showForm} onOpenChange={setShowForm}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>New Process</DialogTitle>
					</DialogHeader>
					<ProcessForm
						onSubmit={(data) => createMutation.mutate(data)}
						onCancel={() => setShowForm(false)}
						loading={createMutation.isPending}
					/>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog
				open={editing !== null}
				onOpenChange={(open) => {
					if (!open) setEditing(null)
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Process</DialogTitle>
					</DialogHeader>
					{editing && (
						<ProcessForm
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
