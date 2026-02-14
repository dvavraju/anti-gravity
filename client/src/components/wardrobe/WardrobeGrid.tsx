import * as React from "react"
import { Grid } from "../layout/Grid"
import { WardrobeItemCard } from "./WardrobeItemCard"
import type { WardrobeItem } from "../../types/wardrobe"

interface WardrobeGridProps {
    items: WardrobeItem[]
    onItemClick?: (item: WardrobeItem) => void
}

const WardrobeGrid: React.FC<WardrobeGridProps> = ({ items, onItemClick }) => {
    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-[var(--color-muted)]">
                No items in your wardrobe yet.
            </div>
        )
    }

    return (
        <Grid className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Overriding default grid responsive behavior slightly to fit cards better */}
            {items.map((item) => (
                <WardrobeItemCard key={item.id} item={item} onClick={() => onItemClick?.(item)} />
            ))}
        </Grid>
    )
}

export { WardrobeGrid }
