import { useLocation } from "react-router-dom"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const routeLabels: Record<string, string> = {
	"/": "Dashboard",
	"/processes": "Processes",
	"/tools": "Tools",
	"/sources": "Sources",
}

export function Header() {
	const location = useLocation()
	const segments = location.pathname.split("/").filter(Boolean)

	const breadcrumbs: { label: string; href?: string }[] = [
		{ label: "Dashboard", href: "/" },
	]

	if (segments.length > 0) {
		const path = `/${segments[0]}`
		const label = routeLabels[path] || segments[0]
		if (path !== "/") {
			breadcrumbs.push({
				label,
				href: segments.length > 1 ? path : undefined,
			})
		}
		if (segments.length > 1) {
			breadcrumbs.push({ label: `#${segments[1]}` })
		}
	}

	return (
		<header className="flex h-14 items-center border-b border-border px-6">
			<Breadcrumb>
				<BreadcrumbList>
					{breadcrumbs.map((crumb, i) => (
						<BreadcrumbItem key={`${crumb.label}-${i}`}>
							{i > 0 && <BreadcrumbSeparator />}
							{crumb.href ? (
								<BreadcrumbLink href={crumb.href}>
									{crumb.label}
								</BreadcrumbLink>
							) : (
								<span className="text-foreground">
									{crumb.label}
								</span>
							)}
						</BreadcrumbItem>
					))}
				</BreadcrumbList>
			</Breadcrumb>
		</header>
	)
}
