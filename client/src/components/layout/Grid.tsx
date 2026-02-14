import * as React from "react"
import { cn } from "../../lib/utils"

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    cols?: number // default to strict system if not overridden
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
    ({ className, children, ...props }, ref) => {
        // Default grid behavior as per design system
        // Mobile: 4 cols, Tablet: 8 cols, Desktop: 12 cols
        // Mobile: 2 cols, Tablet: 3-4 cols, Desktop: 4-6 cols
        // Grid system optimized for visual balance
        const gridSystemClasses = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6";

        return (
            <div
                ref={ref}
                className={cn(gridSystemClasses, className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
Grid.displayName = "Grid"

export { Grid }
