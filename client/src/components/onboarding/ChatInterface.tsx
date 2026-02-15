import * as React from "react"
import { Send, Camera, Loader2, Check, X } from "lucide-react"
import type { WardrobeItem } from "../../types/wardrobe"

interface Message {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    image?: string;
    action?: {
        type: 'confirm_item';
        data: Partial<WardrobeItem>;
    };
}

interface ChatInterfaceProps {
    onComplete: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onComplete }) => {
    const [messages, setMessages] = React.useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hi! I'm your personal AI Stylist. 📸 Upload a photo of a clothing item, and I'll analyze it for you."
        }
    ]);
    const [inputValue, setInputValue] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");

        setIsLoading(true);
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I can best help if you upload a photo of your clothes! Tap the camera icon."
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;

            const userMsgId = Date.now().toString();
            setMessages(prev => [...prev, {
                id: userMsgId,
                role: 'user',
                content: "Here's an item:",
                image: base64String
            }]);
            setIsLoading(true);

            try {
                const res = await fetch('/api/analyze-item', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: base64String })
                });

                const data = await res.json();
                if (data.error) throw new Error(data.error);

                const item = data.data;

                const pairingsRes = await fetch('/api/suggest-pairings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newItem: item })
                });

                const pairingsData = await pairingsRes.json();
                const pairings = pairingsData.data || { tops: [], bottoms: [], shoes: [] };

                let pairingText = '';
                const allPairings = [...pairings.tops, ...pairings.bottoms, ...pairings.shoes];
                if (allPairings.length > 0) {
                    pairingText = `\n\n✨ **This pairs well with:**\n${allPairings.map(p => `• ${p.name}`).join('\n')}`;
                }

                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `I've analyzed this item:\n\n**${item.name}**\n• Category: ${item.subCategory} (${item.category})\n• Color: ${item.color}\n• Occasion: ${item.occasion}${pairingText}\n\nShall I add this to your wardrobe?`,
                    action: {
                        type: 'confirm_item',
                        data: { ...item, imageUrl: base64String }
                    }
                }]);

            } catch (error) {
                console.error(error);
                setMessages(prev => [...prev, {
                    id: (Date.now() + 2).toString(),
                    role: 'assistant',
                    content: "Sorry, I couldn't analyze that image. Please try again."
                }]);
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleConfirmItem = async (itemData: Partial<WardrobeItem>) => {
        setIsLoading(true);
        try {
            const res = await fetch('/wardrobe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
            if (!res.ok) throw new Error('Failed to save');

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Great! I've added the **${itemData.name}** to your **${itemData.occasion}** collection. Upload another one?`
            }]);
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Failed to save the item to the database."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100dvh',
            width: '100%',
            maxWidth: '672px',
            background: '#0d0d14',
            borderRadius: '0',
            overflow: 'hidden',
            border: 'none',
        }}
            className="md:!h-[640px] md:!rounded-2xl md:!border md:!border-white/[0.08]"
            style-media-md={{
                boxShadow: '0 32px 64px rgba(0, 0, 0, 0.5)',
            }}
        >
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)',
                padding: '18px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
                <div>
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '18px',
                        color: '#e2e8f0',
                        margin: 0,
                        letterSpacing: '-0.01em',
                    }}>AI Stylist</h2>
                    <p style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        margin: 0,
                        marginTop: '2px',
                    }}>Powered by Gemini AI</p>
                </div>
                <button
                    onClick={onComplete}
                    style={{
                        padding: '6px 16px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '9999px',
                        color: '#e2e8f0',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                >
                    Exit Chat
                </button>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: 'linear-gradient(180deg, #0d0d14, #0a0a10)',
            }}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        style={{
                            display: 'flex',
                            width: '100%',
                            flexDirection: 'column',
                            alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                    >
                        <div
                            style={{
                                maxWidth: '80%',
                                borderRadius: '18px',
                                padding: '14px 18px',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                marginBottom: '4px',
                                ...(message.role === 'user'
                                    ? {
                                        background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
                                        color: '#ffffff',
                                        borderBottomRightRadius: '6px',
                                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
                                    }
                                    : {
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: '#e2e8f0',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                        borderBottomLeftRadius: '6px',
                                    }
                                ),
                            }}
                        >
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Upload"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        maxHeight: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '12px',
                                        marginBottom: '10px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                    }}
                                />
                            )}
                            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                        </div>

                        {message.action?.type === 'confirm_item' && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button
                                    onClick={() => message.action?.data && handleConfirmItem(message.action.data)}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        padding: '8px 18px', borderRadius: '9999px',
                                        background: 'linear-gradient(135deg, #059669, #10b981)',
                                        color: 'white', fontSize: '13px', fontWeight: 600,
                                        border: 'none', cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Check size={14} /> Yes, Add It
                                </button>
                                <button
                                    onClick={() => setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Okay, I won't add it. Let's try another one." }])}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        padding: '8px 18px', borderRadius: '9999px',
                                        background: 'rgba(244, 63, 94, 0.1)',
                                        color: '#fb7185', fontSize: '13px', fontWeight: 600,
                                        border: '1px solid rgba(244, 63, 94, 0.2)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <X size={14} /> No
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '18px',
                            borderBottomLeftRadius: '6px',
                            padding: '14px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}>
                            <Loader2 className="animate-spin" size={16} style={{ color: '#a78bfa' }} />
                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                padding: '16px 20px',
                background: 'rgba(10, 10, 15, 0.9)',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                            e.currentTarget.style.color = '#a78bfa';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.color = '#94a3b8';
                        }}
                    >
                        <Camera size={18} />
                    </button>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '9999px',
                            padding: '10px 18px',
                            fontSize: '14px',
                            color: '#e2e8f0',
                            outline: 'none',
                        }}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputValue.trim()}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: inputValue.trim()
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                : 'rgba(255, 255, 255, 0.06)',
                            border: 'none',
                            color: inputValue.trim() ? 'white' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: inputValue.trim() ? 'pointer' : 'default',
                            flexShrink: 0,
                            transition: 'all 0.3s ease',
                            boxShadow: inputValue.trim() ? '0 4px 16px rgba(99, 102, 241, 0.3)' : 'none',
                        }}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export { ChatInterface };
