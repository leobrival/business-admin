import { Routes, Route, Navigate } from "react-router-dom"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import DashboardPage from "@/pages/dashboard"
import ProcessesPage from "@/pages/processes"
import ProcessDetailPage from "@/pages/process-detail"
import ToolsPage from "@/pages/tools"
import SourcesPage from "@/pages/sources"

export default function App() {
	return (
		<div className="flex h-screen">
			<Sidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<Header />
				<main className="flex-1 overflow-y-auto p-6">
					<Routes>
						<Route path="/" element={<DashboardPage />} />
						<Route
							path="/processes"
							element={<ProcessesPage />}
						/>
						<Route
							path="/processes/:id"
							element={<ProcessDetailPage />}
						/>
						<Route
							path="/tools"
							element={<ToolsPage />}
						/>
						<Route
							path="/sources"
							element={<SourcesPage />}
						/>
						<Route
							path="*"
							element={<Navigate to="/" replace />}
						/>
					</Routes>
				</main>
			</div>
		</div>
	)
}
