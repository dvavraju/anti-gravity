import * as React from "react"
import { Home, ShoppingBag } from "lucide-react"

interface BottomNavProps {
    activeTab: 'home' | 'wardrobe';
    onTabChange: (tab: 'home' | 'wardrobe') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '72px',
            background: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 50,
        }}>
            <button
                onClick={() => onTabChange('home')}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 32px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: activeTab === 'home' ? '#a78bfa' : 'rgba(255, 255, 255, 0.35)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                }}
            >
                {activeTab === 'home' && (
                    <div style={{
                        position: 'absolute',
                        top: '-1px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '24px',
                        height: '3px',
                        borderRadius: '0 0 4px 4px',
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)',
                    }} />
                )}
                <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 1.8} />
                <span style={{
                    fontSize: '11px',
                    fontWeight: activeTab === 'home' ? 600 : 400,
                    letterSpacing: '0.02em',
                }}>
                    Home
                </span>
            </button>

            <button
                onClick={() => onTabChange('wardrobe')}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 32px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: activeTab === 'wardrobe' ? '#a78bfa' : 'rgba(255, 255, 255, 0.35)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                }}
            >
                {activeTab === 'wardrobe' && (
                    <div style={{
                        position: 'absolute',
                        top: '-1px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '24px',
                        height: '3px',
                        borderRadius: '0 0 4px 4px',
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)',
                    }} />
                )}
                <ShoppingBag size={22} strokeWidth={activeTab === 'wardrobe' ? 2.5 : 1.8} />
                <span style={{
                    fontSize: '11px',
                    fontWeight: activeTab === 'wardrobe' ? 600 : 400,
                    letterSpacing: '0.02em',
                }}>
                    Wardrobe
                </span>
            </button>
        </nav>
    );
};

export { BottomNav };
