import * as React from "react"
import { Sparkles } from "lucide-react"

interface OccasionCardProps {
    title: string;
    image: string;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    count?: number;
    onClick: () => void;
    index: number;
    className?: string;
}

const OccasionCard: React.FC<OccasionCardProps> = ({ title, image, color, gradientFrom, gradientTo, count, onClick, index, className }) => {
    const [hovered, setHovered] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const isActive = hovered || isMobile;

    // Special size for 'Informal' category
    const isInformal = title === 'Informal';
    const iconSize = isInformal ? '175px' : '155px';
    const iconTop = isInformal ? '-45px' : '-40px';
    const iconRight = isInformal ? '-25px' : '-20px';


    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end', // Text at bottom
                padding: '16px',
                background: isActive
                    ? `linear-gradient(160deg, ${gradientFrom}18, ${gradientTo}10, rgba(255,255,255,0.02))`
                    : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${isActive ? `${color}35` : 'rgba(255, 255, 255, 0.05)'}`,
                borderRadius: '24px',
                cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                textAlign: 'left',
                transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isActive ? `0 20px 50px ${color}15, 0 0 80px ${color}08` : 'none',
                overflow: 'visible', // Allow icon to pop out
                animationDelay: `${index * 0.1}s`,
            }}
            className={`group animate-slide-up ${className || ''}`}
        >
            {/* Gradient Background Blob */}
            <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '24px',
                background: `radial-gradient(circle at top right, ${color}15, transparent 70%)`,
                opacity: isActive ? 1 : 0.5,
                transition: 'opacity 0.5s ease',
            }} />

            {/* 3D Pop-out Icon */}
            <div style={{
                position: 'absolute',
                top: iconTop,
                right: iconRight,
                width: iconSize,
                height: iconSize,
                filter: isActive ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.45))' : 'drop-shadow(0 10px 20px rgba(0,0,0,0.35))',
                transform: isActive ? 'scale(1.1) translateY(-8px) rotate(5deg)' : 'scale(1) rotate(0deg)',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy transition
                zIndex: 10,
            }}>

                <img
                    src={image}
                    alt={title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    }}
                />
            </div>

            {/* Counts pill (top left) */}
            <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'rgba(23, 23, 30, 0.6)',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: '99px',
                border: '1px solid rgba(255,255,255,0.08)',
                zIndex: 5,
            }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    {count || 0}
                </span>
            </div>

            {/* Title */}
            <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#e2e8f0',
                margin: '36px 0 0 0', // Spacing for icon
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
                zIndex: 5,
                position: 'relative',
            }}>
                {title}
            </h3>
        </button>
    );
};

interface OccasionGridProps {
    onSelectOccasion: (occasion: string) => void;
}

// Use new icons where available, fallback to old
import iconFormal from '../../assets/3d/formal_new.png';
import iconCasual from '../../assets/3d/casual_new.png';
import iconFamily from '../../assets/3d/family_new.png';
import iconSport from '../../assets/3d/sport_new.png';
import iconInformal from '../../assets/3d/informal_new.png';




const occasions = [
    { title: 'Formal', image: iconFormal, color: '#818cf8', gradientFrom: '#6366f1', gradientTo: '#818cf8', value: 'formal' },
    { title: 'Casual', image: iconCasual, color: '#34d399', gradientFrom: '#059669', gradientTo: '#34d399', value: 'casual' },
    { title: 'Family', image: iconFamily, color: '#fb7185', gradientFrom: '#e11d48', gradientTo: '#fb7185', value: 'family' },
    { title: 'Sport', image: iconSport, color: '#fb923c', gradientFrom: '#ea580c', gradientTo: '#fb923c', value: 'sport' },
    { title: 'Informal', image: iconInformal, color: '#c084fc', gradientFrom: '#7c3aed', gradientTo: '#c084fc', value: 'informal' },
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

    return (
        <div style={{ padding: '8px 0' }}>
            {/* Section Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingLeft: '4px'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                }}>
                    <Sparkles size={16} color="#fff" strokeWidth={2.5} />
                </div>
                <div>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        margin: 0,
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.02em',
                        color: '#e2e8f0',
                    }}>
                        Style Studio
                    </h2>
                </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 gap-4 pb-4">
                {occasions.map((occasion, index) => {
                    // Bento Logic:
                    // Index 0, 1: Top row (standard)
                    // Index 2: Tall item (left col, span 2 rows)
                    // Index 3: Middle right (standard)
                    // Index 4: Bottom right (standard)

                    let gridClass = "min-h-[160px]";
                    if (index === 2) gridClass = "row-span-2 min-h-[336px]"; // Tall item

                    return (
                        <OccasionCard
                            key={occasion.value}
                            title={occasion.title}
                            image={occasion.image}
                            color={occasion.color}
                            gradientFrom={occasion.gradientFrom}
                            gradientTo={occasion.gradientTo}
                            count={counts[occasion.value]}
                            onClick={() => onSelectOccasion(occasion.value)}
                            index={index}
                            className={gridClass}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export { OccasionGrid, OccasionCard };

