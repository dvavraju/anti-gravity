import * as React from "react";
import { Sparkles } from "lucide-react";
import type { WardrobeItem } from "../../types/wardrobe";
import iconFormal from "../../assets/3d/icon_formal.png";
import iconCasual from "../../assets/3d/icon_casual.png";
import iconFamily from "../../assets/3d/icon_family.png";
import iconSport from "../../assets/3d/icon_sport.png";
import iconInformal from "../../assets/3d/icon_informal.png";

interface OccasionCardProps {
        title: string;
        image: string;
        color: string;
        gradientFrom: string;
        gradientTo: string;
        count?: number;
        onClick: () => void;
        className?: string;
        disabled?: boolean;
        fullWidth?: boolean;
}

const OccasionCard: React.FC<OccasionCardProps> = ({
        title,
        image,
        color,
        gradientFrom,
        gradientTo,
        count,
        onClick,
        className,
        disabled,
        fullWidth,
}) => {
        const [hovered, setHovered] = React.useState(false);
        const [isMobile, setIsMobile] = React.useState(false);

        React.useEffect(() => {
                const checkMobile = () => setIsMobile(window.innerWidth < 768);
                checkMobile();
                window.addEventListener("resize", checkMobile);
                return () => window.removeEventListener("resize", checkMobile);
        }, []);

        const isActive = !disabled && (hovered || isMobile);

        const borderColor = disabled
                ? "rgba(255, 255, 255, 0.03)"
                : isActive
                        ? `${color}35`
                        : "rgba(255, 255, 255, 0.05)";

        const boxShadow = isActive
                ? `0 20px 50px ${color}15, 0 0 80px ${color}08`
                : "none";

        const background = disabled
                ? "rgba(255, 255, 255, 0.01)"
                : isActive
                        ? `linear-gradient(160deg, ${gradientFrom}18, ${gradientTo}10, rgba(255,255,255,0.02))`
                        : "rgba(255, 255, 255, 0.02)";

        return (
                <button
                        onClick={disabled ? undefined : onClick}
                        onMouseEnter={() => !disabled && setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        style={{
                                position: "relative",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                padding: "16px",
                                background,
                                border: `1px solid ${borderColor}`,
                                borderRadius: "24px",
                                cursor: disabled ? "not-allowed" : "pointer",
                                transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                                textAlign: "left",
                                transform: isActive ? "translateY(-4px)" : "translateY(0)",
                                boxShadow,
                                overflow: "visible",
                                opacity: disabled ? 0.4 : 1,
                                gridColumn: fullWidth ? "1 / -1" : undefined,
                                minHeight: "150px",
                        }}
                        className={className}
                        disabled={disabled}
                >
                        {/* 3D Icon */}
                        <div
                                style={{
                                        position: "absolute",
                                        top: "-40px",
                                        right: "-20px",
                                        width: "155px",
                                        height: "155px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        opacity: disabled ? 0.15 : isActive ? 1 : 0.6,
                                        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                                        transform: isActive ? "scale(1.12) rotate(-5deg)" : "scale(1) rotate(0deg)",
                                        filter: disabled
                                                ? "grayscale(1)"
                                                : isActive
                                                        ? "drop-shadow(0 8px 20px rgba(0,0,0,0.4))"
                                                        : "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                                        pointerEvents: "none",
                                        zIndex: 1,
                                }}
                        >
                                <img
                                        src={image}
                                        alt={title}
                                        style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                        }}
                                />
                        </div>

                        {/* Content */}
                        <div style={{ position: "relative", zIndex: 2 }}>
                                {/* Badge */}
                                <div
                                        style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "4px",
                                                padding: "3px 8px",
                                                borderRadius: "8px",
                                                background: disabled ? "rgba(255,255,255,0.04)" : `${color}18`,
                                                marginBottom: "6px",
                                        }}
                                >
                                        <Sparkles size={10} color={disabled ? "#888" : color} />
                                        <span
                                                style={{
                                                        fontSize: "11px",
                                                        fontWeight: 600,
                                                        color: disabled ? "#888" : color,
                                                        letterSpacing: "0.5px",
                                                        textTransform: "uppercase",
                                                }}
                                        >
                                                {disabled
                                                        ? "No outfits"
                                                        : `${count ?? 0} outfit${(count ?? 0) !== 1 ? "s" : ""}`}
                                        </span>
                                </div>

                                {/* Title */}
                                <div
                                        style={{
                                                fontSize: "15px",
                                                fontWeight: 700,
                                                color: disabled ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.92)",
                                                letterSpacing: "-0.3px",
                                        }}
                                >
                                        {title}
                                </div>
                        </div>
                </button>
        );
};

interface OccasionGridProps {
        onSelectOccasion: (occasion: string) => void;
        wardrobeItems: WardrobeItem[];
}

const occasions = [
        {
                title: "Formal",
                value: "formal",
                image: iconFormal,
                color: "#818cf8",
                gradientFrom: "#6366f1",
                gradientTo: "#818cf8",
        },
        {
                title: "Casual",
                value: "casual",
                image: iconCasual,
                color: "#34d399",
                gradientFrom: "#059669",
                gradientTo: "#34d399",
        },
        {
                title: "Family",
                value: "family",
                image: iconFamily,
                color: "#fb7185",
                gradientFrom: "#e11d48",
                gradientTo: "#fb7185",
        },
        {
                title: "Sport",
                value: "sport",
                image: iconSport,
                color: "#fb923c",
                gradientFrom: "#ea580c",
                gradientTo: "#fb923c",
        },
        {
                title: "Informal",
                value: "informal",
                image: iconInformal,
                color: "#c084fc",
                gradientFrom: "#7c3aed",
                gradientTo: "#c084fc",
        },
];

export const OccasionGrid: React.FC<OccasionGridProps> = ({
        onSelectOccasion,
        wardrobeItems,
}) => {
        const counts = React.useMemo(() => {
                const result: Record<string, number> = {};
                for (const occasion of occasions) {
                        const occasionItems = wardrobeItems.filter(
                                (item) => item.occasion?.toLowerCase() === occasion.value
                        );
                        const tops = occasionItems.filter((i) => i.category === "top").length;
                        const bottoms = occasionItems.filter((i) => i.category === "bottom").length;
                        const shoes = occasionItems.filter((i) => i.category === "shoes").length;
                        result[occasion.value] = tops * bottoms * shoes;
                }
                return result;
        }, [wardrobeItems]);

        const isOdd = occasions.length % 2 !== 0;

        return (
                <div
                        style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "12px",
                                padding: "0 0 12px 0",
                        }}
                >
                        {occasions.map((occasion, index) => {
                                const count = counts[occasion.value] ?? 0;
                                const isDisabled = count === 0;
                                const isLast = index === occasions.length - 1;

                                return (
                                        <OccasionCard
                                                key={occasion.value}
                                                title={occasion.title}
                                                image={occasion.image}
                                                color={occasion.color}
                                                gradientFrom={occasion.gradientFrom}
                                                gradientTo={occasion.gradientTo}
                                                count={count}
                                                onClick={() => onSelectOccasion(occasion.value)}
                                                disabled={isDisabled}
                                                fullWidth={isLast && isOdd}
                                        />
                                );
                        })}
                </div>
        );
};
