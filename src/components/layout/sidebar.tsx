import { NavLink } from "react-router-dom"
import {
	LayoutDashboard,
	GitBranch,
	Wrench,
	FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
	{ to: "/", label: "Dashboard", icon: LayoutDashboard },
	{ to: "/processes", label: "Processes", icon: GitBranch },
	{ to: "/tools", label: "Tools", icon: Wrench },
	{ to: "/sources", label: "Sources", icon: FileText },
]

export function Sidebar() {
	return (
		<aside className="flex w-64 flex-col border-r border-sidebar-border bg-sidebar-background">
			<div className="flex h-14 items-center border-b border-sidebar-border px-6">
				<h1 className="text-lg font-semibold text-sidebar-foreground">
					Business Admin
				</h1>
			</div>
			<nav className="flex-1 space-y-1 p-3">
				{links.map((link) => (
					<NavLink
						key={link.to}
						to={link.to}
						end={link.to === "/"}
						className={({ isActive }) =>
							cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
								isActive
									? "bg-sidebar-accent text-sidebar-accent-foreground"
									: "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
							)
						}
					>
						<link.icon className="h-4 w-4" />
						{link.label}
					</NavLink>
				))}
			</nav>
		</aside>
	)
}
