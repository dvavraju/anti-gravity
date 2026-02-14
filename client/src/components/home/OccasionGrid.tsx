import * as React from "react"
import { Shirt, Coffee, Users, Briefcase, Dumbbell, ArrowRight, Sparkles } from "lucide-react"

interface OccasionCardProps {
    title: string;
    icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    count?: number;
    onClick: () => void;
    index: number;
    featured?: boolean;
}

const OccasionCard: React.FC<OccasionCardProps> = ({ title, icon: Icon, color, gradientFrom, gradientTo, count, onClick, index, featured }) => {
    const [hovered, setHovered] = React.useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: featured ? '28px' : '22px',
                background: hovered
                    ? `linear-gradient(160deg, ${gradientFrom}18, ${gradientTo}10, rgba(255,255,255,0.02))`
                    : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${hovered ? `${color}35` : 'rgba(255, 255, 255, 0.05)'}`,
                borderRadius: '24px',
                cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                minHeight: featured ? '220px' : '160px',
                overflow: 'hidden',
                textAlign: 'left',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hovered ? `0 20px 50px ${color}15, 0 0 80px ${color}08` : 'none',
                animationDelay: `${index * 0.1}s`,
            }}
            className={`animate-slide-up ${featured ? 'md:col-span-2' : ''}`}
        >
            {/* Ambient glow */}
            <div style={{
                position: 'absolute',
                top: featured ? '-30px' : '-20px',
                right: featured ? '-30px' : '-20px',
                width: featured ? '180px' : '120px',
                height: featured ? '180px' : '120px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${color}${hovered ? '20' : '08'} 0%, transparent 70%)`,
                transition: 'all 0.5s ease',
                pointerEvents: 'none',
            }} />

            {/* Top row: icon + count */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: '100%',
                marginBottom: '16px',
            }}>
                <div style={{
                    width: featured ? '52px' : '44px',
                    height: featured ? '52px' : '44px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${gradientFrom}25, ${gradientTo}15)`,
                    border: `1px solid ${color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.4s ease',
                    transform: hovered ? 'scale(1.08)' : 'scale(1)',
                }}>
                    <Icon size={featured ? 24 : 20} color={color} strokeWidth={2} />
                </div>

                {count !== undefined && count > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: `${color}12`,
                        padding: '5px 12px',
                        borderRadius: '99px',
                        border: `1px solid ${color}18`,
                    }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: color, fontVariantNumeric: 'tabular-nums' }}>
                            {count}
                        </span>
                        <span style={{ fontSize: '11px', color: `${color}99`, fontWeight: 500 }}>
                            looks
                        </span>
                    </div>
                )}
                {(count === undefined || count === 0) && (
                    <div style={{
                        padding: '5px 12px',
                        borderRadius: '99px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                        <span style={{ fontSize: '11px', color: '#475569', fontWeight: 500 }}>
                            No looks yet
                        </span>
                    </div>
                )}
            </div>

            {/* Bottom: title + arrow */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                width: '100%',
            }}>
                <div>
                    <h3 style={{
                        fontSize: featured ? '26px' : '20px',
                        fontWeight: 700,
                        color: '#e2e8f0',
                        margin: 0,
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.03em',
                        lineHeight: 1.1,
                        transition: 'color 0.3s ease',
                    }}>
                        {title}
                    </h3>
                    {featured && (
                        <p style={{
                            margin: '8px 0 0 0',
                            fontSize: '13px',
                            color: '#64748b',
                            lineHeight: 1.4,
                        }}>
                            Your most styled category
                        </p>
                    )}
                </div>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: hovered ? `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${hovered ? 'transparent' : 'rgba(255,255,255,0.06)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: hovered ? 'translateX(4px)' : 'translateX(0)',
                    boxShadow: hovered ? `0 4px 20px ${color}40` : 'none',
                    flexShrink: 0,
                }}>
                    <ArrowRight size={16} color={hovered ? '#fff' : '#64748b'} strokeWidth={2.5} />
                </div>
            </div>
        </button>
    );
};

interface OccasionGridProps {
    onSelectOccasion: (occasion: string) => void;
}

const occasions = [
    { title: 'Formal', icon: Briefcase, color: '#818cf8', gradientFrom: '#6366f1', gradientTo: '#818cf8', value: 'formal' },
    { title: 'Casual', icon: Coffee, color: '#34d399', gradientFrom: '#059669', gradientTo: '#34d399', value: 'casual' },
    { title: 'Family', icon: Users, color: '#fb7185', gradientFrom: '#e11d48', gradientTo: '#fb7185', value: 'family' },
    { title: 'Sport', icon: Dumbbell, color: '#fb923c', gradientFrom: '#ea580c', gradientTo: '#fb923c', value: 'sport' },
    { title: 'Informal', icon: Shirt, color: '#c084fc', gradientFrom: '#7c3aed', gradientTo: '#c084fc', value: 'informal' },
];

const OccasionGrid: React.FC<OccasionGridProps> = ({ onSelectOccasion }) => {
    const [counts, setCounts] = React.useState<Record<string, number>>({});

    React.useEffect(() => {
        fetch('http://localhost:3001/api/wardrobe-analysis')
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setCounts(data.data);
                }
            })
            .catch(err => console.error("Failed to fetch wardrobe counts:", err));
    }, []);

    // Find the category with the most outfits for "featured"
    const maxCount = Math.max(...Object.values(counts), 0);
    const featuredValue = Object.entries(counts).find(([, v]) => v === maxCount && v > 0)?.[0] || 'formal';

    return (
        <div style={{ padding: '8px 0' }}>
            {/* Section Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '28px',
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                }}>
                    <Sparkles size={18} color="#fff" strokeWidth={2.5} />
                </div>
                <div>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        margin: 0,
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.03em',
                        color: '#e2e8f0',
                    }}>
                        Style Studio
                    </h2>
                    <p style={{
                        margin: '2px 0 0 0',
                        fontSize: '13px',
                        color: '#475569',
                        fontWeight: 500,
                    }}>
                        Pick an occasion, get outfit ideas
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {occasions.map((occasion, index) => (
                    <OccasionCard
                        key={occasion.value}
                        title={occasion.title}
                        icon={occasion.icon}
                        color={occasion.color}
                        gradientFrom={occasion.gradientFrom}
                        gradientTo={occasion.gradientTo}
                        count={counts[occasion.value]}
                        onClick={() => onSelectOccasion(occasion.value)}
                        index={index}
                        featured={occasion.value === featuredValue}
                    />
                ))}
            </div>
        </div>
    );
};

export { OccasionGrid, OccasionCard };
