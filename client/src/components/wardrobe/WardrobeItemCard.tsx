import * as React from "react"
import type { WardrobeItem } from "../../types/wardrobe"
import { cn } from "../../lib/utils"

interface WardrobeItemCardProps extends React.HTMLAttributes<HTMLDivElement> {
    item: WardrobeItem
    index?: number
}

const WardrobeItemCard = React.forwardRef<HTMLDivElement, WardrobeItemCardProps>(
    ({ className, item, index = 0, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "group relative overflow-hidden rounded-2xl cursor-pointer animate-slide-up",
                    className
                )}
                style={{
                    animationDelay: `${index * 0.06}s`,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                }}
                {...props}
            >
                {/* Image */}
                <div className="aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-[#111118] to-[#1a1a24]">
                    {item.imageUrl ? (
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3"
                            style={{ color: 'rgba(255,255,255,0.2)' }}>
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                            </svg>
                            <span className="text-xs font-medium capitalize">{item.category}</span>
                        </div>
                    )}
                </div>

                {/* Hover overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Content */}
                <div style={{
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                }}>
                    <h3 style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#e2e8f0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {item.name}
                    </h3>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '6px',
                        fontSize: '12px',
                        color: '#64748b',
                    }}>
                        <span style={{
                            textTransform: 'capitalize',
                            background: 'rgba(139, 92, 246, 0.1)',
                            color: '#a78bfa',
                            padding: '2px 10px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: 500,
                            border: '1px solid rgba(139, 92, 246, 0.15)',
                        }}>
                            {item.category}
                        </span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', color: '#94a3b8' }}>
                            {item.wearCount > 0 ? `${item.wearCount}× worn` : 'New'}
                        </span>
                    </div>
                </div>

                {/* "New" badge */}
                {item.wearCount === 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        padding: '3px 10px',
                        borderRadius: '99px',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                    }}
                        className="animate-scale-in"
                    >
                        New
                    </div>
                )}
            </div>
        )
    }
)
WardrobeItemCard.displayName = "WardrobeItemCard"

export { WardrobeItemCard }
