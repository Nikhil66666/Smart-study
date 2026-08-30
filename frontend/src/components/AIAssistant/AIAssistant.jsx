import { useState, useEffect, useRef } from "react";
import { chatWithAI, getDailyMotivation } from "../../services/aiService";

/* ─── inject keyframes once ─────────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("ai-kf")) {
    const st = document.createElement("style");
    st.id = "ai-kf";
    st.textContent = `
        @keyframes ai-slide-in  { from { transform: translateX(110%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        @keyframes ai-fade-up   { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ai-pulse-dot { 0%,80%,100% { transform:scale(0); } 40% { transform:scale(1); } }
        @keyframes ai-glow      { 0%,100% { box-shadow:0 0 16px rgba(168,85,247,0.4);} 50%{box-shadow:0 0 32px rgba(168,85,247,0.8);} }
        @keyframes ai-spin      { to { transform:rotate(360deg); } }
    `;
    document.head.appendChild(st);
}

const SUGGESTIONS = [
    "What should I study today?",
    "Which subject needs the most attention?",
    "Give me a study tip for today.",
    "How am I doing overall?",
    "Help me create a focus plan.",
];

export default function AIAssistant({ open, onClose, studyData = {} }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput]       = useState("");
    const [thinking, setThinking] = useState(false);
    const [quote, setQuote]       = useState(null);
    const [quoteLoading, setQuoteLoading] = useState(true);
    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    /* ── Load daily motivation once when panel opens ─────────────────── */
    useEffect(() => {
        if (!open) return;
        setQuoteLoading(true);
        getDailyMotivation(studyData)
            .then(setQuote)
            .catch(() =>
                setQuote({
                    quote: "Every study session brings you closer to your goal.",
                    insight: "Stay consistent and trust the process.",
                })
            )
            .finally(() => setQuoteLoading(false));

        // Seed welcome message
        setMessages([
            {
                id: Date.now(),
                role: "ai",
                text: "👋 Hi! I'm your AI Study Coach. I've analysed your progress and I'm here to help. Ask me anything about your study plan!",
            },
        ]);
    }, [open]);

    /* ── Auto-scroll ─────────────────────────────────────────────────── */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, thinking]);

    /* ── Focus input when open ───────────────────────────────────────── */
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 400);
    }, [open]);

    const sendMessage = async (text) => {
        const msg = (text || input).trim();
        if (!msg || thinking) return;
        setInput("");

        const userMsg = { id: Date.now(), role: "user", text: msg };
        setMessages((prev) => [...prev, userMsg]);
        setThinking(true);

        try {
            const history = messages.map((m) => ({ role: m.role, text: m.text }));
            const reply = await chatWithAI(msg, studyData, history);
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, role: "ai", text: reply },
            ]);
        } catch (err) {
            console.error("[AIAssistant] chat error:", err);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: "ai",
                    text: `⚠️ API Error: ${err?.message || "Unknown error"}`,
                },
            ]);
        } finally {
            setThinking(false);
        }
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    backdropFilter: "blur(4px)",
                    zIndex: 990,
                }}
            />

            {/* Drawer */}
            <aside style={S.drawer}>

                {/* ── Header ── */}
                <div style={S.header}>
                    <div style={S.headerLeft}>
                        <div style={S.avatarWrap}>
                            <span style={{ fontSize: "1.3rem" }}>🤖</span>
                        </div>
                        <div>
                            <p style={S.headerName}>AI Study Coach</p>
                            <p style={S.headerSub}>
                                <span style={S.greenDot} /> Online · Powered by Gemini
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={S.closeBtn}>✕</button>
                </div>

                {/* ── Daily Motivation Card ── */}
                <div style={S.motivCard}>
                    {quoteLoading ? (
                        <div style={S.quoteLoader}>
                            <div style={S.spinner} />
                            <span style={{ fontSize: "0.78rem", color: "#9ca3af", marginLeft: "0.5rem" }}>
                                Generating your daily motivation…
                            </span>
                        </div>
                    ) : (
                        <>
                            <div style={S.motivHeader}>
                                <span style={S.motivTag}>✨ Daily Motivation</span>
                            </div>
                            <p style={S.quoteText}>"{quote?.quote}"</p>
                            <p style={S.insightText}>{quote?.insight}</p>
                        </>
                    )}
                </div>

                {/* ── Messages ── */}
                <div style={S.messages}>
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            style={{
                                ...S.messageWrap,
                                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                            }}
                        >
                            {m.role === "ai" && (
                                <div style={S.aiBubbleAvatar}>🤖</div>
                            )}
                            <div
                                style={
                                    m.role === "user"
                                        ? S.userBubble
                                        : S.aiBubble
                                }
                            >
                                {m.text}
                            </div>
                        </div>
                    ))}

                    {/* Thinking indicator */}
                    {thinking && (
                        <div style={{ ...S.messageWrap, justifyContent: "flex-start" }}>
                            <div style={S.aiBubbleAvatar}>🤖</div>
                            <div style={S.thinkingBubble}>
                                <span style={{ ...S.dot3, animationDelay: "0s" }} />
                                <span style={{ ...S.dot3, animationDelay: "0.2s" }} />
                                <span style={{ ...S.dot3, animationDelay: "0.4s" }} />
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* ── Suggestions ── */}
                {messages.length < 3 && (
                    <div style={S.suggestions}>
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                style={S.suggestionChip}
                                onClick={() => sendMessage(s)}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = "rgba(168,85,247,0.2)";
                                    e.currentTarget.style.borderColor = "#a855f7";
                                    e.currentTarget.style.color = "#e9d5ff";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                    e.currentTarget.style.color = "#9ca3af";
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Input ── */}
                <div style={S.inputRow}>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Ask your study coach…"
                        style={S.input}
                        disabled={thinking}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || thinking}
                        style={{
                            ...S.sendBtn,
                            opacity: (!input.trim() || thinking) ? 0.45 : 1,
                        }}
                    >
                        ➤
                    </button>
                </div>

            </aside>
        </>
    );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const S = {
    drawer: {
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "min(420px, 95vw)",
        background: "linear-gradient(160deg, #0d1120 0%, #0b0f19 100%)",
        borderLeft: "1px solid rgba(168,85,247,0.25)",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.6)",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        animation: "ai-slide-in 0.35s cubic-bezier(0.22,1,0.36,1) both",
        fontFamily: "'Inter', sans-serif",
    },

    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 1.25rem",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(168,85,247,0.06)",
        flexShrink: 0,
    },

    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
    },

    avatarWrap: {
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "ai-glow 3s ease-in-out infinite",
        flexShrink: 0,
    },

    headerName: {
        fontWeight: 700,
        fontSize: "0.95rem",
        color: "#f9fafb",
        margin: 0,
    },

    headerSub: {
        fontSize: "0.72rem",
        color: "#6b7280",
        margin: 0,
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
        marginTop: "2px",
    },

    greenDot: {
        display: "inline-block",
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "#22c55e",
    },

    closeBtn: {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#9ca3af",
        borderRadius: "0.5rem",
        width: "2rem",
        height: "2rem",
        cursor: "pointer",
        fontSize: "0.8rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    motivCard: {
        margin: "0.75rem",
        background: "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(79,70,229,0.12))",
        border: "1px solid rgba(168,85,247,0.3)",
        borderRadius: "0.875rem",
        padding: "0.875rem 1rem",
        flexShrink: 0,
    },

    quoteLoader: {
        display: "flex",
        alignItems: "center",
        minHeight: "3rem",
    },

    spinner: {
        width: "1.25rem",
        height: "1.25rem",
        border: "2px solid rgba(168,85,247,0.2)",
        borderTopColor: "#a855f7",
        borderRadius: "50%",
        animation: "ai-spin 0.7s linear infinite",
        flexShrink: 0,
    },

    motivHeader: {
        marginBottom: "0.4rem",
    },

    motivTag: {
        fontSize: "0.65rem",
        fontWeight: 700,
        color: "#c084fc",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
    },

    quoteText: {
        fontSize: "0.9rem",
        fontWeight: 700,
        color: "#f3f4f6",
        margin: 0,
        lineHeight: 1.45,
        fontStyle: "italic",
    },

    insightText: {
        fontSize: "0.75rem",
        color: "#9ca3af",
        margin: 0,
        marginTop: "0.4rem",
        lineHeight: 1.5,
    },

    messages: {
        flex: 1,
        overflowY: "auto",
        padding: "0.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.65rem",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(168,85,247,0.3) transparent",
    },

    messageWrap: {
        display: "flex",
        alignItems: "flex-end",
        gap: "0.5rem",
        animation: "ai-fade-up 0.25s ease both",
    },

    aiBubbleAvatar: {
        fontSize: "1rem",
        flexShrink: 0,
        marginBottom: "2px",
    },

    aiBubble: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "0.875rem 0.875rem 0.875rem 0.2rem",
        padding: "0.65rem 0.875rem",
        fontSize: "0.83rem",
        color: "#e5e7eb",
        maxWidth: "82%",
        lineHeight: 1.55,
    },

    userBubble: {
        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
        borderRadius: "0.875rem 0.875rem 0.2rem 0.875rem",
        padding: "0.65rem 0.875rem",
        fontSize: "0.83rem",
        color: "#fff",
        maxWidth: "82%",
        lineHeight: 1.55,
        boxShadow: "0 2px 12px rgba(124,58,237,0.3)",
    },

    thinkingBubble: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "0.875rem",
        padding: "0.75rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
    },

    dot3: {
        display: "inline-block",
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "#a855f7",
        animation: "ai-pulse-dot 1.2s ease-in-out infinite",
    },

    suggestions: {
        padding: "0 0.75rem 0.5rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.4rem",
        flexShrink: 0,
    },

    suggestionChip: {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#9ca3af",
        borderRadius: "9999px",
        padding: "0.35rem 0.75rem",
        fontSize: "0.72rem",
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: "'Inter', sans-serif",
    },

    inputRow: {
        display: "flex",
        gap: "0.5rem",
        padding: "0.75rem",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
        background: "rgba(0,0,0,0.2)",
    },

    input: {
        flex: 1,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "0.75rem",
        padding: "0.65rem 0.875rem",
        color: "#f9fafb",
        fontSize: "0.85rem",
        outline: "none",
        fontFamily: "'Inter', sans-serif",
        transition: "border-color 0.15s",
    },

    sendBtn: {
        width: "2.75rem",
        height: "2.75rem",
        borderRadius: "0.75rem",
        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
        border: "none",
        color: "#fff",
        fontSize: "1rem",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 4px 15px rgba(124,58,237,0.4)",
        transition: "opacity 0.15s",
    },
};
