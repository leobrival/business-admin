import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"

interface DescriptionTooltipProps {
	name: string
	description: string | null | undefined
}

export function DescriptionTooltip({
	name,
	description,
}: DescriptionTooltipProps) {
	if (!description) {
		return <>{name}</>
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span className="cursor-help underline decoration-dotted">
					{name}
				</span>
			</TooltipTrigger>
			<TooltipContent className="max-w-xs">
				{description}
			</TooltipContent>
		</Tooltip>
	)
}
