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
        const gridSystemClasses = "grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8";

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
