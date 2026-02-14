import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Save } from 'lucide-react';

import type { WardrobeItem } from "../../types/wardrobe";

interface PairingSuggestion {
    top?: WardrobeItem;
    bottom?: WardrobeItem;
    shoes?: WardrobeItem;
}

interface ItemDetailsModalProps {
    item: WardrobeItem;
    onClose: () => void;
    onUpdate: (item: WardrobeItem) => void;
    onDelete: (id: string) => void;
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#e2e8f0',
    outline: 'none',
    transition: 'border-color 0.2s ease',
};

export default function ItemDetailsModal({ item, onClose, onUpdate, onDelete }: ItemDetailsModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState<WardrobeItem>(item);
    const [pairings, setPairings] = useState<PairingSuggestion | null>(null);
    const [loadingPairings, setLoadingPairings] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/api/suggest-pairings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item })
        })
            .then(res => res.json())
            .then(data => {
                setPairings(data.data);
                setLoadingPairings(false);
            })
            .catch(err => {
                console.error('Failed to fetch pairings:', err);
                setLoadingPairings(false);
            });
    }, [item]);

    const handleSave = () => {
        onUpdate(editedItem);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedItem(item);
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (confirm(`Delete "${item.name}"?`)) {
            onDelete(item.id);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '0',
            }}
            className="md:p-5"
            onClick={onClose}
        >
            <div
                style={{
                    background: 'linear-gradient(180deg, #16161e, #111118)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    position: 'relative',
                    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                }}
                className="animate-scale-in w-full md:w-auto md:rounded-3xl rounded-t-3xl md:rounded-b-3xl fixed bottom-0 md:relative md:bottom-auto mb-0"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <h2 style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        margin: 0,
                        color: '#e2e8f0',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.01em',
                    }}>
                        {isEditing ? 'Edit Item' : 'Item Details'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            padding: '8px',
                            color: '#94a3b8',
                            display: 'flex',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.color = '#e2e8f0';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                            e.currentTarget.style.color = '#94a3b8';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {/* Image */}
                    <div className="w-full h-[200px] md:h-[300px] rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-[#111118] to-[#1a1a24] border border-white/5">
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </div>

                    {/* Details */}
                    <div style={{ marginBottom: '24px' }}>
                        {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</label>
                                    <input
                                        type="text"
                                        value={editedItem.name}
                                        onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                                    <select
                                        value={editedItem.category}
                                        onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
                                        style={{ ...inputStyle, appearance: 'none' as const }}
                                    >
                                        <option value="top">Top</option>
                                        <option value="bottom">Bottom</option>
                                        <option value="shoes">Shoes</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color</label>
                                    <input
                                        type="text"
                                        value={editedItem.color}
                                        onChange={(e) => setEditedItem({ ...editedItem, color: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Occasion</label>
                                    <select
                                        value={editedItem.occasion}
                                        onChange={(e) => setEditedItem({ ...editedItem, occasion: e.target.value })}
                                        style={{ ...inputStyle, appearance: 'none' as const }}
                                    >
                                        <option value="formal">Formal</option>
                                        <option value="casual">Casual</option>
                                        <option value="sport">Sport</option>
                                        <option value="family">Family</option>
                                        <option value="informal">Informal</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {[
                                    { label: 'Name', value: item.name },
                                    { label: 'Category', value: item.category },
                                    { label: 'Color', value: item.color },
                                    { label: 'Occasion', value: item.occasion },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 500, color: '#e2e8f0', textTransform: 'capitalize' }}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pairing Suggestions */}
                    {!isEditing && (
                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#e2e8f0' }}>Pairs well with:</h3>
                            {loadingPairings ? (
                                <p style={{ color: '#64748b', fontSize: '14px' }}>Loading suggestions...</p>
                            ) : pairings && (pairings.top || pairings.bottom || pairings.shoes) ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                    {[pairings.top, pairings.bottom, pairings.shoes].filter(Boolean).map((pairedItem, idx) => (
                                        pairedItem && (
                                            <div key={idx} style={{
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                                borderRadius: '14px',
                                                overflow: 'hidden',
                                                transition: 'all 0.3s ease',
                                            }}>
                                                <div style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    background: 'linear-gradient(135deg, #111118, #1a1a24)',
                                                }}>
                                                    <img
                                                        src={pairedItem.imageUrl}
                                                        alt={pairedItem.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div style={{ padding: '10px 12px' }}>
                                                    <p style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: '#e2e8f0' }}>{pairedItem.name}</p>
                                                    <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', textTransform: 'capitalize' }}>
                                                        {pairedItem.category}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#64748b', fontSize: '14px' }}>No pairing suggestions available</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px 24px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                }}>
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                style={{
                                    padding: '10px 22px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '10px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    color: '#e2e8f0',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                style={{
                                    padding: '10px 22px',
                                    border: 'none',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.5)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.3)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <Save size={16} />
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleDelete}
                                style={{
                                    padding: '10px 22px',
                                    border: '1px solid rgba(244, 63, 94, 0.3)',
                                    borderRadius: '10px',
                                    background: 'rgba(244, 63, 94, 0.08)',
                                    color: '#fb7185',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(244, 63, 94, 0.15)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(244, 63, 94, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    padding: '10px 22px',
                                    border: 'none',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.5)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.3)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <Edit2 size={16} />
                                Edit
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
