import * as React from "react";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";

interface AuthScreenProps {
    onAuth: (token: string, userName: string) => void;
}

type Mode = "login" | "signup";

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth }) => {
    const [mode, setMode] = React.useState<Mode>("login");
    const [name, setName] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            onAuth(data.token, data.user.name);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = () => {
        setMode(m => m === "login" ? "signup" : "login");
        setError(null);
        setName("");
        setPassword("");
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            fontFamily: "Inter, system-ui, sans-serif",
        }}>
            {/* Background glow effects */}
            <div style={{
                position: "fixed",
                top: "20%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "600px",
                height: "600px",
                background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            <div style={{
                width: "100%",
                maxWidth: "420px",
                position: "relative",
                zIndex: 1,
            }}>
                {/* Logo / Brand */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "64px",
                        height: "64px",
                        borderRadius: "20px",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)",
                        boxShadow: "0 12px 32px rgba(139,92,246,0.4)",
                        marginBottom: "20px",
                    }}>
                        <Sparkles size={28} color="white" />
                    </div>
                    <h1 style={{
                        margin: 0,
                        fontFamily: "Outfit, sans-serif",
                        fontSize: "28px",
                        fontWeight: 700,
                        color: "#e2e8f0",
                        letterSpacing: "-0.03em",
                    }}>
                        Wardrobe AI
                    </h1>
                    <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b" }}>
                        Your personal AI stylist
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "24px",
                    padding: "32px",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
                }}>
                    {/* Tab switcher */}
                    <div style={{
                        display: "flex",
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: "12px",
                        padding: "4px",
                        marginBottom: "28px",
                    }}>
                        {(["login", "signup"] as Mode[]).map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(null); }}
                                style={{
                                    flex: 1,
                                    padding: "8px",
                                    borderRadius: "9px",
                                    border: "none",
                                    background: mode === m
                                        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                                        : "transparent",
                                    color: mode === m ? "white" : "#64748b",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    boxShadow: mode === m ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                                }}
                            >
                                {m === "login" ? "Log In" : "Create Account"}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {/* Name field */}
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px" }}>
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Your name"
                                required
                                autoComplete="username"
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "12px",
                                    color: "#e2e8f0",
                                    fontSize: "15px",
                                    outline: "none",
                                    boxSizing: "border-box",
                                    transition: "border-color 0.2s",
                                }}
                                onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.6)"}
                                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                            />
                        </div>

                        {/* Password field */}
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px" }}>
                                Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="At least 4 characters"
                                    required
                                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                                    style={{
                                        width: "100%",
                                        padding: "12px 44px 12px 16px",
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "12px",
                                        color: "#e2e8f0",
                                        fontSize: "15px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        transition: "border-color 0.2s",
                                    }}
                                    onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.6)"}
                                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    style={{
                                        position: "absolute",
                                        right: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        color: "#64748b",
                                        cursor: "pointer",
                                        padding: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                padding: "10px 14px",
                                background: "rgba(244,63,94,0.08)",
                                border: "1px solid rgba(244,63,94,0.2)",
                                borderRadius: "10px",
                                fontSize: "13px",
                                color: "#fb7185",
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim() || !password}
                            style={{
                                width: "100%",
                                padding: "13px",
                                background: isLoading || !name.trim() || !password
                                    ? "rgba(255,255,255,0.06)"
                                    : "linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)",
                                border: "none",
                                borderRadius: "12px",
                                color: isLoading || !name.trim() || !password ? "#64748b" : "white",
                                fontSize: "15px",
                                fontWeight: 700,
                                cursor: isLoading || !name.trim() || !password ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: !isLoading && name.trim() && password
                                    ? "0 8px 24px rgba(139,92,246,0.35)"
                                    : "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                marginTop: "4px",
                            }}
                        >
                            {isLoading ? (
                                <><Loader2 size={16} className="animate-spin" /> Loading...</>
                            ) : (
                                mode === "login" ? "Log In" : "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Switch mode link */}
                    <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#64748b" }}>
                        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                            onClick={switchMode}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#a78bfa",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "13px",
                                padding: 0,
                            }}
                        >
                            {mode === "login" ? "Sign up" : "Log in"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export { AuthScreen };
