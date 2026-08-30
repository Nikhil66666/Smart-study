import { useState, useEffect, useRef } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getDashboardSummary, getSubjectProgress } from "../../services/dashboardService";
import { chatWithAI, getDailyMotivation } from "../../services/aiService";

/* ─── Inject Keyframes for animations ─────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("ai-fullpage-kf")) {
    const st = document.createElement("style");
    st.id = "ai-fullpage-kf";
    st.textContent = `
        @keyframes ai-fade-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ai-pulse-dot { 0%,80%,100% { transform:scale(0); } 40% { transform:scale(1); } }
        @keyframes ai-spin { to { transform:rotate(360deg); } }
        @keyframes ai-glow-border { 0%,100% { border-color: rgba(168,85,247,0.4); } 50% { border-color: rgba(168,85,247,0.8); } }
    `;
    document.head.appendChild(st);
}

const COACH_MODES = [
    { id: "general", name: "General Coach", icon: "🤖", desc: "Overall study advice & questions" },
    { id: "priority", name: "Exam Priorities", icon: "🎯", desc: "Focus on weak & urgent topics" },
    { id: "timetable", name: "Timetable Optimizer", icon: "⏱️", desc: "Schedule & time management" },
    { id: "concept", name: "Concept Tutor", icon: "📖", desc: "Explain difficult study topics" },
    { id: "recall", name: "Active Recall", icon: "⚡", desc: "Quiz me & test my retention" },
];

const DEFAULT_SESSIONS = [
    {
        id: "sess-1",
        title: "Study Plan & Target Review",
        time: "Today",
        mode: "general",
        messages: [
            {
                id: "msg-1",
                role: "ai",
                text: "👋 **Welcome to your AI Study Assistant!**\n\nI have analyzed your exam schedule and current study progress. Select a study mode or ask me anything to get started!",
                time: "Just now",
            },
        ],
    },
    {
        id: "sess-2",
        title: "Weak Subjects Analysis",
        time: "Yesterday",
        mode: "priority",
        messages: [
            {
                id: "msg-2",
                role: "ai",
                text: "Here are recommendations for the subjects where you have the highest remaining hours. Let's break down your next study block.",
                time: "Yesterday",
            },
        ],
    },
];

export default function AIAssistantPage() {
    const [summary, setSummary] = useState(null);
    const [subjectProgress, setSubjectProgress] = useState([]);
    const [quote, setQuote] = useState(null);
    const [quoteLoading, setQuoteLoading] = useState(true);

    // Sessions & Chat State (persisted to localStorage)
    const [sessions, setSessions] = useState(() => {
        try {
            const saved = localStorage.getItem("smart_study_ai_sessions");
            return saved ? JSON.parse(saved) : DEFAULT_SESSIONS;
        } catch {
            return DEFAULT_SESSIONS;
        }
    });

    const [activeSessionId, setActiveSessionId] = useState(() => {
        return sessions[0]?.id || "sess-1";
    });

    const [selectedMode, setSelectedMode] = useState("general");
    const [input, setInput] = useState("");
    const [thinking, setThinking] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Persist sessions
    useEffect(() => {
        try {
            localStorage.setItem("smart_study_ai_sessions", JSON.stringify(sessions));
        } catch (e) {
            console.error("Failed to save sessions to localStorage:", e);
        }
    }, [sessions]);

    // Load user dashboard & study progress
    useEffect(() => {
        let isMounted = true;
        async function loadContext() {
            try {
                const [summaryData, subjectsData] = await Promise.all([
                    getDashboardSummary().catch(() => null),
                    getSubjectProgress().catch(() => []),
                ]);

                if (!isMounted) return;
                setSummary(summaryData);
                setSubjectProgress(subjectsData || []);

                getDailyMotivation({ summary: summaryData, subjectProgress: subjectsData || [] })
                    .then((q) => {
                        if (isMounted) setQuote(q);
                    })
                    .catch(() => {
                        if (isMounted) {
                            setQuote({
                                quote: "Continuous small efforts create monumental academic success.",
                                insight: "Prioritize focused blocks and stay consistent with your timetable.",
                            });
                        }
                    })
                    .finally(() => {
                        if (isMounted) setQuoteLoading(false);
                    });
            } catch (err) {
                console.error("Context load error:", err);
                if (isMounted) setQuoteLoading(false);
            }
        }

        loadContext();
        return () => {
            isMounted = false;
        };
    }, []);

    // Auto scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [sessions, activeSessionId, thinking]);

    const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

    // Create New Chat Session
    const handleNewChat = () => {
        const newId = `sess-${Date.now()}`;
        const newSess = {
            id: newId,
            title: "New Conversation",
            time: "Just now",
            mode: selectedMode,
            messages: [
                {
                    id: `msg-${Date.now()}`,
                    role: "ai",
                    text: `👋 **New Study Session started.** (Mode: **${COACH_MODES.find((m) => m.id === selectedMode)?.name}**)\n\nWhat would you like to focus on right now?`,
                    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            ],
        };

        setSessions((prev) => [newSess, ...prev]);
        setActiveSessionId(newId);
        setTimeout(() => textareaRef.current?.focus(), 100);
    };

    // Delete Chat Session
    const handleDeleteSession = (e, sessionId) => {
        e.stopPropagation();
        if (sessions.length <= 1) {
            handleNewChat();
            return;
        }
        const updated = sessions.filter((s) => s.id !== sessionId);
        setSessions(updated);
        if (activeSessionId === sessionId) {
            setActiveSessionId(updated[0].id);
        }
    };

    // Send message to AI
    const handleSend = async (customPrompt) => {
        const textToSend = (customPrompt || input).trim();
        if (!textToSend || thinking) return;

        setInput("");

        const userMsg = {
            id: `user-${Date.now()}`,
            role: "user",
            text: textToSend,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        // Append user message to active session
        setSessions((prev) =>
            prev.map((sess) => {
                if (sess.id === activeSessionId) {
                    const isFirstUserMsg = sess.messages.filter((m) => m.role === "user").length === 0;
                    const newTitle = isFirstUserMsg ? textToSend.slice(0, 32) + (textToSend.length > 32 ? "…" : "") : sess.title;
                    return {
                        ...sess,
                        title: newTitle,
                        messages: [...sess.messages, userMsg],
                    };
                }
                return sess;
            })
        );

        setThinking(true);

        try {
            const studyContext = { summary, subjectProgress };
            const currentMessages = activeSession?.messages || [];
            const chatHistory = [...currentMessages, userMsg].map((m) => ({ role: m.role, text: m.text }));

            // Mode prompt adjustment
            let modeAugmentedPrompt = textToSend;
            if (selectedMode === "priority") {
                modeAugmentedPrompt = `[MODE: Focus strictly on identifying weak subjects, highest-impact topics, and urgent revision priorities] ${textToSend}`;
            } else if (selectedMode === "timetable") {
                modeAugmentedPrompt = `[MODE: Focus on timetable schedule optimization, hourly breakdown, and daily study blocks] ${textToSend}`;
            } else if (selectedMode === "recall") {
                modeAugmentedPrompt = `[MODE: Quiz the student with interactive active-recall questions and test their memory on the topics] ${textToSend}`;
            }

            const response = await chatWithAI(modeAugmentedPrompt, studyContext, chatHistory);

            const aiMsg = {
                id: `ai-${Date.now()}`,
                role: "ai",
                text: response || "I'm ready! What's next on your study plan?",
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };

            setSessions((prev) =>
                prev.map((sess) => {
                    if (sess.id === activeSessionId) {
                        return {
                            ...sess,
                            messages: [...sess.messages, aiMsg],
                        };
                    }
                    return sess;
                })
            );
        } catch (err) {
            console.error("AI chat error:", err);
            const errorMsg = {
                id: `ai-err-${Date.now()}`,
                role: "ai",
                text: `⚠️ **Error connecting to AI:** ${err?.message || "Please check your network and try again."}`,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setSessions((prev) =>
                prev.map((sess) => {
                    if (sess.id === activeSessionId) {
                        return {
                            ...sess,
                            messages: [...sess.messages, errorMsg],
                        };
                    }
                    return sess;
                })
            );
        } finally {
            setThinking(false);
        }
    };

    // Copy to clipboard
    const copyToClipboard = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Markdown Formatter
    const renderFormattedText = (text) => {
        const lines = text.split("\n");
        return lines.map((line, idx) => {
            let formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                return (
                    <li
                        key={idx}
                        style={{ marginLeft: "1.2rem", marginBottom: "0.25rem" }}
                        dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-*]\s+/, "") }}
                    />
                );
            }
            if (line.trim() === "") {
                return <div key={idx} style={{ height: "0.5rem" }} />;
            }
            return (
                <p
                    key={idx}
                    style={{ margin: "0 0 0.35rem 0", lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: formatted }}
                />
            );
        });
    };

    const overallProgress = Math.min(Math.max(Number(summary?.overall_progress ?? 0), 0), 100);

    // Filter sessions by search
    const filteredSessions = sessions.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <MainLayout studyData={{ summary, subjectProgress }}>
            {/* ── Page Header ── */}
            <div style={S.pageHeader} className="app-page-header">
                <div>
                    <div style={S.badge}>
                        <span>✦</span> Gemini 2.5 Flash
                    </div>
                    <h1 style={S.pageTitle}>AI Study Assistant</h1>
                    <p style={S.pageSubtitle}>
                        Your intelligent study partner with personalized insights, multi-session history, and strategy coaching.
                    </p>
                </div>

                <div style={S.headerStats}>
                    <div style={S.statusBadge}>
                        <div style={S.statusDot} />
                        <span>Online · Connected</span>
                    </div>
                    <div style={S.progressMiniBadge}>
                        <span>Progress: <strong>{overallProgress}%</strong></span>
                    </div>
                </div>
            </div>

            {/* ── AI Workspace: Left Sidebar + Right Chat Container ── */}
            <div style={S.workspaceContainer} className="ai-workspace-layout">
                {/* ══════════════════════════════════════════════
                    LEFT SIDEBAR: Sessions, Modes & Daily Insight
                   ══════════════════════════════════════════════ */}
                <aside style={S.aiSidebar} className="ai-left-sidebar">
                    {/* New Chat Action Button */}
                    <button
                        onClick={handleNewChat}
                        style={S.newChatBtn}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 4px 20px rgba(168,85,247,0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 10px rgba(168,85,247,0.25)";
                        }}
                    >
                        <span>＋</span>
                        <span>New Study Chat</span>
                    </button>

                    {/* Mode Selector */}
                    <div style={S.sectionBlock}>
                        <p style={S.sectionTitle}>STUDY COACH MODES</p>
                        <div style={S.modeList}>
                            {COACH_MODES.map((mode) => {
                                const isSelected = selectedMode === mode.id;
                                return (
                                    <button
                                        key={mode.id}
                                        onClick={() => setSelectedMode(mode.id)}
                                        style={{
                                            ...S.modeItem,
                                            background: isSelected ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.03)",
                                            borderColor: isSelected ? "rgba(168,85,247,0.6)" : "rgba(255,255,255,0.06)",
                                            color: isSelected ? "#f3f4f6" : "#9ca3af",
                                        }}
                                    >
                                        <span style={{ fontSize: "1.1rem" }}>{mode.icon}</span>
                                        <div style={{ flex: 1, textAlign: "left" }}>
                                            <p style={{ ...S.modeName, color: isSelected ? "#e9d5ff" : "#d1d5db" }}>
                                                {mode.name}
                                            </p>
                                            <p style={S.modeDesc}>{mode.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chat Sessions History */}
                    <div style={{ ...S.sectionBlock, flex: 1, display: "flex", flexDirection: "column", minHeight: "180px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <p style={S.sectionTitle}>CHAT SESSIONS ({sessions.length})</p>
                        </div>

                        {/* Search in sessions */}
                        {sessions.length > 3 && (
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search sessions..."
                                style={S.searchInput}
                            />
                        )}

                        <div style={S.sessionList}>
                            {filteredSessions.map((sess) => {
                                const isActive = sess.id === activeSessionId;
                                return (
                                    <div
                                        key={sess.id}
                                        onClick={() => setActiveSessionId(sess.id)}
                                        style={{
                                            ...S.sessionCard,
                                            background: isActive ? "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(99,102,241,0.2))" : "rgba(255,255,255,0.02)",
                                            borderColor: isActive ? "#a855f7" : "rgba(255,255,255,0.06)",
                                        }}
                                    >
                                        <span style={{ fontSize: "0.95rem" }}>💬</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ ...S.sessionTitle, color: isActive ? "#ffffff" : "#d1d5db" }}>
                                                {sess.title}
                                            </p>
                                            <p style={S.sessionTime}>{sess.messages.length} messages · {sess.time}</p>
                                        </div>

                                        <button
                                            onClick={(e) => handleDeleteSession(e, sess.id)}
                                            style={S.deleteSessionBtn}
                                            title="Delete session"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Daily Motivation Mini-Card at bottom of sidebar */}
                    <div style={S.motivationMiniCard}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>
                            <span style={{ fontSize: "0.85rem" }}>✨</span>
                            <span style={S.motivationMiniTag}>DAILY MOTIVATION</span>
                        </div>
                        {quoteLoading ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <div style={S.spinnerSmall} />
                                <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>Loading quote…</span>
                            </div>
                        ) : (
                            <p style={S.motivationMiniQuote}>"{quote?.quote}"</p>
                        )}
                    </div>
                </aside>

                {/* ══════════════════════════════════════════════
                    MAIN RIGHT WORKSPACE: Active Conversation Chat
                   ══════════════════════════════════════════════ */}
                <main style={S.chatArea} className="ai-chat-area">
                    {/* Top Chat Bar */}
                    <div style={S.chatHeaderBar}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={S.chatHeaderAvatar}>
                                {COACH_MODES.find((m) => m.id === selectedMode)?.icon || "🤖"}
                            </div>
                            <div>
                                <h2 style={S.chatHeaderTitle}>{activeSession?.title || "AI Study Chat"}</h2>
                                <p style={S.chatHeaderMode}>
                                    Mode: <strong>{COACH_MODES.find((m) => m.id === selectedMode)?.name}</strong> · Context Connected
                                </p>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                                onClick={() => {
                                    setSessions((prev) =>
                                        prev.map((s) => {
                                            if (s.id === activeSessionId) {
                                                return {
                                                    ...s,
                                                    messages: [
                                                        {
                                                            id: `msg-${Date.now()}`,
                                                            role: "ai",
                                                            text: "Chat cleared! What shall we cover next?",
                                                            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                                                        },
                                                    ],
                                                };
                                            }
                                            return s;
                                        })
                                    );
                                }}
                                style={S.actionIconBtn}
                                title="Clear current messages"
                            >
                                🗑️ Clear
                            </button>
                        </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div style={S.messagesContainer}>
                        {activeSession?.messages.map((m) => {
                            const isUser = m.role === "user";
                            return (
                                <div
                                    key={m.id}
                                    style={{
                                        ...S.messageRow,
                                        justifyContent: isUser ? "flex-end" : "flex-start",
                                    }}
                                >
                                    {!isUser && <div style={S.botAvatar}>🤖</div>}

                                    <div style={isUser ? S.userBubble : S.aiBubble}>
                                        <div style={S.bubbleContent}>{renderFormattedText(m.text)}</div>

                                        <div style={S.bubbleFooter}>
                                            <span style={S.msgTime}>{m.time}</span>
                                            {!isUser && (
                                                <button
                                                    onClick={() => copyToClipboard(m.id, m.text)}
                                                    style={S.copyBtn}
                                                >
                                                    {copiedId === m.id ? "✓ Copied" : "📋 Copy"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {isUser && <div style={S.userAvatar}>👤</div>}
                                </div>
                            );
                        })}

                        {/* Thinking Bubble */}
                        {thinking && (
                            <div style={{ ...S.messageRow, justifyContent: "flex-start" }}>
                                <div style={S.botAvatar}>🤖</div>
                                <div style={S.thinkingBubble}>
                                    <span style={{ fontSize: "0.82rem", color: "#c084fc", fontWeight: 600 }}>
                                        AI Coach is formulating advice
                                    </span>
                                    <div style={S.dotsWrap}>
                                        <span style={{ ...S.dot, animationDelay: "0s" }} />
                                        <span style={{ ...S.dot, animationDelay: "0.2s" }} />
                                        <span style={{ ...S.dot, animationDelay: "0.4s" }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Suggested Quick Prompt Chips (when few messages) */}
                    {activeSession?.messages.length <= 2 && (
                        <div style={S.quickChipsRow}>
                            <button
                                onClick={() => handleSend("What subjects should I prioritize studying today based on my required hours?")}
                                style={S.chipBtn}
                            >
                                🎯 Prioritize Today's Study
                            </button>
                            <button
                                onClick={() => handleSend("Analyze my current subject progress and tell me where I am falling behind.")}
                                style={S.chipBtn}
                            >
                                📊 Analyze Weak Subjects
                            </button>
                            <button
                                onClick={() => handleSend("Give me 3 high-impact active recall questions for my upcoming exam.")}
                                style={S.chipBtn}
                            >
                                ⚡ Quiz Me with Questions
                            </button>
                        </div>
                    )}

                    {/* Chat Input Bar */}
                    <div style={S.inputBar}>
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={`Ask your ${COACH_MODES.find((m) => m.id === selectedMode)?.name}... (Press Enter to send, Shift+Enter for newline)`}
                            style={S.textarea}
                            rows={2}
                            disabled={thinking}
                        />

                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || thinking}
                            style={{
                                ...S.sendBtn,
                                opacity: !input.trim() || thinking ? 0.45 : 1,
                                cursor: !input.trim() || thinking ? "not-allowed" : "pointer",
                            }}
                        >
                            <span>Send</span>
                            <span style={{ fontSize: "1.1rem" }}>➤</span>
                        </button>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}

/* ─────────────────────────────────────────────
   Style Tokens (Refined Dark Glassmorphism)
───────────────────────────────────────────── */
const S = {
    pageHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "1.25rem",
        gap: "1rem",
        flexWrap: "wrap",
    },

    badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.25rem 0.7rem",
        borderRadius: "9999px",
        background: "rgba(168,85,247,0.12)",
        border: "1px solid rgba(168,85,247,0.3)",
        color: "#a855f7",
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: "0.4rem",
    },

    pageTitle: {
        fontSize: "1.75rem",
        fontWeight: 800,
        color: "#f9fafb",
        margin: 0,
        fontFamily: "'Inter', sans-serif",
    },

    pageSubtitle: {
        fontSize: "0.85rem",
        color: "#9ca3af",
        marginTop: "0.25rem",
    },

    headerStats: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
    },

    statusBadge: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "#111827",
        border: "1px solid rgba(34,197,94,0.3)",
        borderRadius: "9999px",
        padding: "0.4rem 0.85rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "#4ade80",
    },

    statusDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#22c55e",
        boxShadow: "0 0 6px #22c55e",
    },

    progressMiniBadge: {
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "9999px",
        padding: "0.4rem 0.85rem",
        fontSize: "0.75rem",
        color: "#d1d5db",
    },

    workspaceContainer: {
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: "1.25rem",
        minHeight: "calc(100vh - 14rem)",
        alignItems: "stretch",
    },

    /* ── Left Sidebar Inside AI Page ── */
    aiSidebar: {
        background: "#0d1120",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1.25rem",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    },

    newChatBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "0.75rem 1rem",
        borderRadius: "0.85rem",
        background: "linear-gradient(135deg, #a855f7, #6366f1)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.88rem",
        border: "none",
        cursor: "pointer",
        transition: "all 0.18s",
        boxShadow: "0 2px 10px rgba(168,85,247,0.25)",
    },

    sectionBlock: {
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
    },

    sectionTitle: {
        fontSize: "0.68rem",
        fontWeight: 800,
        color: "#6b7280",
        letterSpacing: "0.08em",
        margin: "0 0 0.25rem 0.2rem",
    },

    modeList: {
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
    },

    modeItem: {
        display: "flex",
        alignItems: "center",
        gap: "0.65rem",
        padding: "0.55rem 0.75rem",
        borderRadius: "0.75rem",
        border: "1px solid",
        cursor: "pointer",
        transition: "all 0.15s",
        width: "100%",
    },

    modeName: {
        fontSize: "0.8rem",
        fontWeight: 700,
        margin: 0,
    },

    modeDesc: {
        fontSize: "0.68rem",
        color: "#6b7280",
        margin: "0.1rem 0 0 0",
    },

    searchInput: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "0.6rem",
        padding: "0.4rem 0.65rem",
        fontSize: "0.75rem",
        color: "#f3f4f6",
        outline: "none",
        marginBottom: "0.4rem",
    },

    sessionList: {
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
        overflowY: "auto",
        maxHeight: "220px",
        paddingRight: "0.2rem",
    },

    sessionCard: {
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.55rem 0.75rem",
        borderRadius: "0.75rem",
        border: "1px solid",
        cursor: "pointer",
        transition: "all 0.15s",
    },

    sessionTitle: {
        fontSize: "0.78rem",
        fontWeight: 600,
        margin: 0,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    sessionTime: {
        fontSize: "0.65rem",
        color: "#6b7280",
        margin: "0.1rem 0 0 0",
    },

    deleteSessionBtn: {
        background: "transparent",
        border: "none",
        color: "#6b7280",
        fontSize: "0.7rem",
        cursor: "pointer",
        padding: "0.2rem",
        borderRadius: "0.3rem",
        transition: "color 0.15s",
    },

    motivationMiniCard: {
        background: "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(17,24,39,0.9))",
        border: "1px solid rgba(168,85,247,0.25)",
        borderRadius: "0.85rem",
        padding: "0.75rem 0.85rem",
        marginTop: "auto",
    },

    motivationMiniTag: {
        fontSize: "0.62rem",
        fontWeight: 800,
        color: "#c084fc",
        letterSpacing: "0.06em",
    },

    motivationMiniQuote: {
        fontSize: "0.76rem",
        color: "#e5e7eb",
        fontStyle: "italic",
        lineHeight: 1.4,
        margin: 0,
    },

    spinnerSmall: {
        width: "0.9rem",
        height: "0.9rem",
        border: "2px solid rgba(168,85,247,0.2)",
        borderTopColor: "#a855f7",
        borderRadius: "50%",
        animation: "ai-spin 0.7s linear infinite",
    },

    /* ── Right Chat Area ── */
    chatArea: {
        background: "#0d1120",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1.25rem",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 4px 25px rgba(0,0,0,0.3)",
    },

    chatHeaderBar: {
        padding: "1rem 1.25rem",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    chatHeaderAvatar: {
        width: "2.4rem",
        height: "2.4rem",
        borderRadius: "0.75rem",
        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.2rem",
        boxShadow: "0 0 12px rgba(124,58,237,0.4)",
    },

    chatHeaderTitle: {
        fontSize: "0.98rem",
        fontWeight: 700,
        color: "#f9fafb",
        margin: 0,
    },

    chatHeaderMode: {
        fontSize: "0.72rem",
        color: "#9ca3af",
        margin: "0.15rem 0 0 0",
    },

    actionIconBtn: {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#9ca3af",
        borderRadius: "0.6rem",
        padding: "0.35rem 0.75rem",
        fontSize: "0.72rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
    },

    messagesContainer: {
        flex: 1,
        overflowY: "auto",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxHeight: "520px",
        minHeight: "360px",
    },

    messageRow: {
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        animation: "ai-fade-in 0.22s ease both",
    },

    botAvatar: {
        width: "2rem",
        height: "2rem",
        borderRadius: "0.5rem",
        background: "rgba(168,85,247,0.2)",
        border: "1px solid rgba(168,85,247,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
        flexShrink: 0,
    },

    userAvatar: {
        width: "2rem",
        height: "2rem",
        borderRadius: "0.5rem",
        background: "rgba(99,102,241,0.2)",
        border: "1px solid rgba(99,102,241,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
        flexShrink: 0,
    },

    aiBubble: {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "0.25rem 1rem 1rem 1rem",
        padding: "0.85rem 1.15rem",
        maxWidth: "80%",
        color: "#f3f4f6",
        fontSize: "0.88rem",
        lineHeight: 1.6,
    },

    userBubble: {
        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
        borderRadius: "1rem 0.25rem 1rem 1rem",
        padding: "0.85rem 1.15rem",
        maxWidth: "80%",
        color: "#ffffff",
        fontSize: "0.88rem",
        lineHeight: 1.55,
        boxShadow: "0 4px 15px rgba(124,58,237,0.25)",
    },

    bubbleContent: {
        wordBreak: "break-word",
    },

    bubbleFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "0.45rem",
        paddingTop: "0.35rem",
        borderTop: "1px solid rgba(255,255,255,0.06)",
    },

    msgTime: {
        fontSize: "0.68rem",
        color: "#6b7280",
    },

    copyBtn: {
        background: "transparent",
        border: "none",
        color: "#a855f7",
        fontSize: "0.7rem",
        fontWeight: 600,
        cursor: "pointer",
        padding: "0.1rem 0.3rem",
    },

    thinkingBubble: {
        background: "rgba(168,85,247,0.1)",
        border: "1px solid rgba(168,85,247,0.25)",
        borderRadius: "0.25rem 1rem 1rem 1rem",
        padding: "0.75rem 1.1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
    },

    dotsWrap: {
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
    },

    dot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#c084fc",
        animation: "ai-pulse-dot 1.2s ease-in-out infinite",
    },

    quickChipsRow: {
        display: "flex",
        gap: "0.5rem",
        padding: "0 1.25rem 0.75rem 1.25rem",
        flexWrap: "wrap",
    },

    chipBtn: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "9999px",
        padding: "0.4rem 0.8rem",
        fontSize: "0.75rem",
        color: "#d1d5db",
        cursor: "pointer",
        transition: "all 0.15s",
    },

    inputBar: {
        padding: "1rem 1.25rem",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.25)",
        display: "flex",
        gap: "0.75rem",
        alignItems: "flex-end",
    },

    textarea: {
        flex: 1,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "0.875rem",
        padding: "0.75rem 1rem",
        color: "#f9fafb",
        fontSize: "0.88rem",
        resize: "none",
        outline: "none",
        fontFamily: "'Inter', sans-serif",
        lineHeight: 1.4,
    },

    sendBtn: {
        padding: "0.75rem 1.35rem",
        borderRadius: "0.875rem",
        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
        border: "none",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.88rem",
        display: "flex",
        alignItems: "center",
        gap: "0.45rem",
        boxShadow: "0 4px 15px rgba(124,58,237,0.35)",
        transition: "all 0.15s",
        height: "46px",
    },
};
