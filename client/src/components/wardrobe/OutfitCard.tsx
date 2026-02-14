import * as React from "react"
import type { Outfit } from "../../types/wardrobe"
import { Check, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence, type PanInfo, useMotionValue, useTransform } from "framer-motion"

interface OutfitCardProps {
    outfit: Outfit;
    outfitHistory: Outfit[];
    currentIndex: number;
    onNavigate: (direction: 'prev' | 'next') => void;
    onAccept: () => void;
    isLoading?: boolean;
}

interface SwipeableCardProps {
    itemOutfit: Outfit;
    isCurrent: boolean;
    direction: number;
    onDragEnd: (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
    onAccept: () => void;
    getLastWornText: (item: Outfit) => string;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
    itemOutfit,
    isCurrent,
    direction,
    onDragEnd,
    onAccept,
    getLastWornText
}) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-10, 10]);

    const canDrag = isCurrent;

    return (
        <motion.div
            layout
            custom={direction}
            variants={{
                enter: (dir: number) => ({
                    x: dir === 1 ? window.innerWidth : -window.innerWidth,
                    opacity: 0,
                    scale: 0.9,
                    zIndex: 10,
                }),
                center: {
                    zIndex: 10,
                    x: 0,
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    rotate: 0,
                },
                exit: (dir: number) => ({
                    zIndex: 10,
                    x: dir === 1 ? -window.innerWidth : window.innerWidth,
                    opacity: 0,
                    scale: 0.9,
                }),
                stack: {
                    zIndex: 5,
                    x: 0,
                    y: 12,
                    scale: 0.96,
                    opacity: 1,
                    rotate: 0,
                }
            }}
            initial={isCurrent && direction === -1 ? "enter" : undefined}
            animate={isCurrent ? "center" : "stack"}
            exit="exit"
            transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                scale: { duration: 0.2 },
                opacity: { duration: 0.2 },
                rotate: { duration: 0.2 }
            }}
            drag={canDrag ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={canDrag ? onDragEnd : undefined}
            style={{
                x,
                rotate,
                opacity: isCurrent ? 1 : 1, // Let variants handle opacity for stack/enter, but use transform for drag? modifying logic slightly
                position: 'absolute',
                width: '100%',
                maxWidth: '600px',
                height: '100%',
                background: isCurrent ? 'linear-gradient(135deg, #1e1e2a, #14141c)' : '#18181b',
                borderRadius: '28px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                cursor: canDrag ? 'grab' : 'default',
            }}
            whileTap={{ cursor: 'grabbing' }}
        >
            {/* Card Items Content */}
            <div className="flex-1 flex flex-col gap-3 p-4 md:p-5 overflow-y-auto">
                {[
                    itemOutfit.items.find(i => i.category === 'top'),
                    itemOutfit.items.find(i => i.category === 'bottom'),
                    itemOutfit.items.find(i => i.category === 'shoes')
                ].filter(Boolean).map((item, idx) => (
                    <div key={item!.id} className="flex relative rounded-2xl overflow-hidden bg-white/5 border border-white/5 min-h-[120px] md:min-h-[140px] shrink-0 transform transition-transform hover:scale-[1.01]">
                        <div className="w-[40%] bg-gradient-to-br from-gray-900 to-gray-800 relative">
                            {item!.imageUrl ? (
                                <img src={item!.imageUrl} alt={item!.name} className="w-full h-full object-cover select-none pointer-events-none" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-slate-500 text-xs">No Image</div>
                            )}
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-center gap-1.5">
                            <span
                                className="text-[10px] uppercase tracking-wider font-bold"
                                style={{ color: idx === 0 ? '#818cf8' : idx === 1 ? '#34d399' : '#fb923c' }}
                            >
                                {item!.category}
                            </span>
                            <h3 className="text-lg font-bold text-slate-200 leading-tight font-[Outfit]">
                                {item!.name}
                            </h3>
                            {item!.color && (
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: item!.color.toLowerCase() }} />
                                    <span className="text-xs text-slate-400 capitalize">{item!.color}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            {isCurrent && (
                <div className="p-5 pt-4 bg-black/20 backdrop-blur-sm border-t border-white/5 flex flex-col gap-4">
                    <div className="flex items-center justify-center gap-2">
                        <Clock size={14} className="text-slate-500" />
                        <span className="text-xs font-medium text-slate-500">{getLastWornText(itemOutfit)}</span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAccept(); }}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-violet-500/25 active:scale-95 transition-transform"
                    >
                        <Check size={20} strokeWidth={3} />
                        Wearing This Today
                    </button>
                </div>
            )}
        </motion.div>
    );
}

const OutfitCard: React.FC<OutfitCardProps> = ({ outfitHistory, currentIndex, onNavigate, onAccept }) => {
    // Direction tracking for animations
    const [direction, setDirection] = React.useState<number>(0);

    // We only render the current card and the one immediately after it (the stack)
    const visibleOutfits = outfitHistory.slice(currentIndex, currentIndex + 2);

    // Swipe handlers
    const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const swipeThreshold = 100;
        if (info.offset.x > swipeThreshold) {
            // Swipe Right -> Prev
            if (currentIndex > 0) {
                setDirection(-1);
                onNavigate('prev');
            }
        } else if (info.offset.x < -swipeThreshold) {
            // Swipe Left -> Next
            setDirection(1);
            onNavigate('next');
        }
    };

    const [now] = React.useState(() => Date.now());

    const getLastWornText = (itemOutfit: Outfit) => {
        const wornDates = itemOutfit.items
            .filter(i => i.lastWornDate)
            .map(i => new Date(i.lastWornDate!).getTime());

        if (wornDates.length === 0) return "Never worn before";
        const mostRecent = Math.max(...wornDates);
        const daysAgo = Math.floor((now - mostRecent) / (1000 * 60 * 60 * 24));
        if (daysAgo === 0) return "Worn today";
        if (daysAgo === 1) return "Yesterday";
        return `${daysAgo} days ago`;
    };

    return (
        <div className="relative w-full h-full flex flex-col overflow-hidden">
            {/* Card Stack Area */}
            <div className="flex-1 relative w-full flex items-center justify-center p-5">
                <AnimatePresence custom={direction} initial={false}>
                    {visibleOutfits.map((itemOutfit, index) => {
                        const absoluteIndex = currentIndex + index;
                        const isCurrent = absoluteIndex === currentIndex;

                        return (
                            <SwipeableCard
                                key={itemOutfit.id}
                                itemOutfit={itemOutfit}
                                isCurrent={isCurrent}
                                direction={direction}
                                onDragEnd={onDragEnd}
                                onAccept={onAccept}
                                getLastWornText={getLastWornText}
                            />
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="p-4 md:p-6 flex items-center justify-center gap-6 md:gap-8 pb-8 md:pb-6">
                <button
                    onClick={() => { setDirection(-1); onNavigate('prev'); }}
                    disabled={currentIndex === 0}
                    className="p-3 md:p-4 rounded-full bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors active:scale-95 touch-manipulation"
                >
                    <ChevronLeft className="text-slate-200 w-5 h-5 md:w-6 md:h-6" />
                </button>
                <div className="flex gap-2">
                    {outfitHistory.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-violet-500' : 'w-2 bg-white/20'}`} />
                    ))}
                </div>
                <button
                    onClick={() => { setDirection(1); onNavigate('next'); }}
                    className="p-3 md:p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors active:scale-95 touch-manipulation"
                >
                    <ChevronRight className="text-slate-200 w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>
        </div>
    )
}

export { OutfitCard };
