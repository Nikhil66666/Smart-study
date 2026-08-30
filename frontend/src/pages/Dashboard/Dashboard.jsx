import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

import {
    getDashboardSummary,
    getSubjectProgress
} from "../../services/dashboardService";

import { getDailyMotivation } from "../../services/aiService";

/* ─── Inject Keyframes ───────────────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("db-kf")) {
    const st = document.createElement("style");
    st.id = "db-kf";
    st.textContent = `
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes db-fade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes ai-glow { 0%,100%{box-shadow:0 0 16px rgba(168,85,247,0.4)} 50%{box-shadow:0 0 32px rgba(168,85,247,0.8)} }
    `;
    document.head.appendChild(st);
}

function Dashboard() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subjectProgress, setSubjectProgress] = useState([]);
    const [error, setError] = useState(null);

    // AI motivation state
    const [aiQuote, setAiQuote] = useState(null);
    const [aiLoading, setAiLoading] = useState(true);

    const selectedExamId = localStorage.getItem("selectedExamId");

    // ---------------------------------------------
    // Load Dashboard Data
    // ---------------------------------------------
    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            try {
                setError(null);

                const [data, subjects] = await Promise.all([
                    getDashboardSummary(),
                    getSubjectProgress()
                ]);

                if (cancelled) return;

                setSummary(data);
                setSubjectProgress(subjects);

                // Fetch AI motivation in background
                getDailyMotivation({
                    summary: data,
                    subjectProgress: subjects,
                })
                    .then((q) => { if (!cancelled) setAiQuote(q); })
                    .catch(() => {
                        if (!cancelled) {
                            setAiQuote({
                                quote: "Small progress every day becomes big results.",
                                insight: "Stay consistent with your study plan and keep moving forward.",
                            });
                        }
                    })
                    .finally(() => { if (!cancelled) setAiLoading(false); });

            } catch (err) {
                console.error("Unable to load dashboard:", err);
                if (!cancelled) {
                    setError("Unable to load dashboard. Please make sure the backend is running.");
                    setAiLoading(false);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadDashboard();

        return () => { cancelled = true; };
    }, []);

    // Loading State
    if (loading) {
        return (
            <MainLayout>
                <div style={S.loadingWrap}>
                    <div style={S.spinner} />
                    <p style={{ color: "#9ca3af", marginTop: "1rem", fontWeight: 600 }}>Loading dashboard metrics…</p>
                </div>
            </MainLayout>
        );
    }

    // Error State
    if (error) {
        return (
            <MainLayout>
                <div style={S.loadingWrap}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⚠️</div>
                    <p style={{ color: "#ef4444", fontWeight: 700, fontSize: "1.1rem" }}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={S.retryBtn}
                    >
                        ↻ Refresh Dashboard
                    </button>
                </div>
            </MainLayout>
        );
    }

    const clampPercent = (value) => Math.min(Math.max(Number(value ?? 0), 0), 100);
    const overallProgress = clampPercent(summary?.overall_progress);
    const studyData = { summary, subjectProgress };

    return (
        <MainLayout studyData={studyData}>

            {/* ── Desktop Page Header ──────────────────────────── */}
            <div style={S.pageHeader} className="app-page-header">
                <div>
                    <div style={S.badge}>
                        <span>✦</span> Real-Time Analytics
                    </div>
                    <h1 style={S.pageTitle}>Dashboard Overview</h1>
                    <p style={S.pageSubtitle}>Track your exam preparation progress, daily targets, and AI guidance.</p>
                </div>

                <div style={S.headerActions}>
                    <div style={S.overallBadge}>
                        <span style={S.overallBadgeLabel}>Overall Completion</span>
                        <span style={S.overallBadgeVal}>{overallProgress}%</span>
                    </div>

                    <button
                        onClick={() => navigate("/ai-assistant")}
                        style={S.aiHeaderBtn}
                    >
                        <span>🤖</span>
                        <span>Ask AI Coach</span>
                    </button>
                </div>
            </div>

            {/* ── Summary Stats Grid (Desktop 4 Columns) ───────────────────── */}
            <div style={S.statsGrid} className="dash-stats-grid">
                <StatCard
                    label="Total Exams"
                    value={summary?.total_exams ?? 0}
                    color="#818cf8"
                    icon="📋"
                    sub="Active Targets"
                    gradient="linear-gradient(135deg, rgba(99,102,241,0.15), rgba(17,24,39,0.9))"
                    borderColor="rgba(99,102,241,0.3)"
                />
                <StatCard
                    label="Total Subjects"
                    value={summary?.total_subjects ?? 0}
                    color="#4ade80"
                    icon="📖"
                    sub="Curriculum modules"
                    gradient="linear-gradient(135deg, rgba(34,197,94,0.15), rgba(17,24,39,0.9))"
                    borderColor="rgba(34,197,94,0.3)"
                />
                <StatCard
                    label="Today's Target"
                    value={`${summary?.today_study_hours ?? 0} hrs`}
                    color="#fbbf24"
                    icon="⏰"
                    sub="Allocated schedule"
                    gradient="linear-gradient(135deg, rgba(245,158,11,0.15), rgba(17,24,39,0.9))"
                    borderColor="rgba(245,158,11,0.3)"
                />
                <StatCard
                    label="Completed Today"
                    value={`${summary?.completed_today_hours ?? 0} hrs`}
                    color="#c084fc"
                    icon="✅"
                    sub="Verified study time"
                    gradient="linear-gradient(135deg, rgba(168,85,247,0.15), rgba(17,24,39,0.9))"
                    borderColor="rgba(168,85,247,0.3)"
                />
            </div>

            {/* ── AI Daily Motivation Hero Banner ────────────── */}
            <div style={S.aiBannerCard}>
                <div style={S.aiBannerLeft}>
                    <div style={S.aiBannerIconWrap}>
                        <span style={{ fontSize: "1.6rem" }}>🤖</span>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                            <span style={S.aiBannerTag}>✨ AI DAILY MOTIVATION &amp; STRATEGY</span>
                            <span style={S.aiLiveDot} />
                        </div>

                        {aiLoading ? (
                            <div style={S.shimmerBlock} />
                        ) : (
                            <div style={{ animation: "db-fade 0.4s ease both" }}>
                                <p style={S.aiBannerQuote}>
                                    "{aiQuote?.quote}"
                                </p>
                                <p style={S.aiBannerInsight}>
                                    {aiQuote?.insight}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={S.aiBannerRight}>
                    <div style={S.progressRing}>
                        <svg width="72" height="72" viewBox="0 0 72 72">
                            <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="6" />
                            <circle
                                cx="36" cy="36" r="30"
                                fill="none"
                                stroke="url(#ringGrad)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 30}`}
                                strokeDashoffset={`${2 * Math.PI * 30 * (1 - overallProgress / 100)}`}
                                transform="rotate(-90 36 36)"
                                style={{ transition: "stroke-dashoffset 1s ease" }}
                            />
                            <defs>
                                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#a855f7" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div style={S.ringLabel}>
                            <span style={S.ringNum}>{overallProgress}%</span>
                            <span style={S.ringTxt}>done</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 2-Column Desktop Layout (Subjects + Action Hub) ── */}
            <div style={S.twoColDesktop} className="dash-desktop-grid">
                
                {/* ══ LEFT: Subject Preparation Progress (62%) ══ */}
                <div style={S.sectionCard}>
                    <div style={S.sectionHeader}>
                        <div>
                            <h2 style={S.sectionTitle}>Subject Preparation Progress</h2>
                            <p style={S.sectionSubtitle}>Detailed completion metrics by subject</p>
                        </div>
                        <span style={S.activeBadge}>
                            <span style={S.activeDot} /> {subjectProgress.length} Active Subjects
                        </span>
                    </div>

                    {subjectProgress.length === 0 ? (
                        <div style={S.emptyBox}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📖</div>
                            <p style={{ fontWeight: 600, color: "#9ca3af" }}>No subjects found</p>
                            <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.2rem" }}>
                                Add subjects from the Subjects page to start tracking preparation progress.
                            </p>
                            <button
                                onClick={() => navigate(selectedExamId ? `/subjects/${selectedExamId}` : "/exams")}
                                style={S.addSubjectBtn}
                            >
                                ＋ Manage Subjects
                            </button>
                        </div>
                    ) : (
                        <div style={S.subjectList}>
                            {subjectProgress.map((subject, idx) => {
                                const progress = clampPercent(subject.progress_percentage);
                                const colors = ["#818cf8", "#c084fc", "#4ade80", "#fbbf24", "#f472b6", "#2dd4bf"];
                                const color = colors[idx % colors.length];
                                return (
                                    <div key={subject.subject_id} style={S.subjectRow}>
                                        <div style={S.subjectMeta}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <div style={{
                                                    width: "10px", height: "10px",
                                                    borderRadius: "50%",
                                                    background: color,
                                                    flexShrink: 0,
                                                    boxShadow: `0 0 8px ${color}`,
                                                }} />
                                                <div>
                                                    <p style={S.subjectName}>{subject.subject_name}</p>
                                                    <p style={S.subjectHours}>
                                                        {subject.completed_hours} hrs completed · {subject.remaining_hours} hrs remaining
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <span style={{ ...S.percentTag, background: `${color}20`, color, borderColor: `${color}40` }}>
                                                    {progress}%
                                                </span>
                                                <p style={S.hoursDetail}>
                                                    {subject.completed_hours} / {subject.required_hours} hrs
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div style={S.subProgressTrack}>
                                            <div style={{
                                                ...S.subProgressFill,
                                                width: `${progress}%`,
                                                background: `linear-gradient(90deg, ${color}, ${color}99)`
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ══ RIGHT: Quick Action Hub & Study Strategy (38%) ══ */}
                <div style={S.rightColumn}>
                    {/* Overall Progress Snapshot Card */}
                    <div style={S.sideCard}>
                        <h3 style={S.sideCardTitle}>🎯 Total Hours Summary</h3>
                        <div style={S.hoursOverview}>
                            <div style={S.hoursNumBox}>
                                <span style={S.hoursBigNum}>{summary?.completed_hours ?? 0}</span>
                                <span style={S.hoursSub}>Completed Hrs</span>
                            </div>
                            <div style={S.hoursDivider}>/</div>
                            <div style={S.hoursNumBox}>
                                <span style={{ ...S.hoursBigNum, color: "#9ca3af" }}>{summary?.total_required_hours ?? 0}</span>
                                <span style={S.hoursSub}>Required Total</span>
                            </div>
                        </div>

                        <div style={S.progressTrack}>
                            <div style={{ ...S.progressFill, width: `${overallProgress}%` }} />
                        </div>
                    </div>

                    {/* Quick Navigation Action Tiles */}
                    <div style={S.sideCard}>
                        <h3 style={S.sideCardTitle}>⚡ Quick Shortcuts</h3>
                        <div style={S.actionTilesList}>
                            <button
                                onClick={() => navigate(selectedExamId ? `/study-plan/${selectedExamId}` : "/exams")}
                                style={S.actionTile}
                            >
                                <span style={{ fontSize: "1.2rem" }}>▦</span>
                                <div style={{ textAlign: "left" }}>
                                    <p style={S.actionTileTitle}>Daily Timetable</p>
                                    <p style={S.actionTileSub}>View &amp; complete today's sessions</p>
                                </div>
                                <span style={S.actionTileArrow}>→</span>
                            </button>

                            <button
                                onClick={() => navigate("/exams")}
                                style={S.actionTile}
                            >
                                <span style={{ fontSize: "1.2rem" }}>▣</span>
                                <div style={{ textAlign: "left" }}>
                                    <p style={S.actionTileTitle}>Exam Schedules</p>
                                    <p style={S.actionTileSub}>Add or review upcoming exam dates</p>
                                </div>
                                <span style={S.actionTileArrow}>→</span>
                            </button>

                            <button
                                onClick={() => navigate("/ai-assistant")}
                                style={S.actionTile}
                            >
                                <span style={{ fontSize: "1.2rem" }}>✦</span>
                                <div style={{ textAlign: "left" }}>
                                    <p style={S.actionTileTitle}>AI Study Coach</p>
                                    <p style={S.actionTileSub}>Ask questions &amp; analyze priorities</p>
                                </div>
                                <span style={S.actionTileArrow}>→</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

        </MainLayout>
    );
}

/* ── StatCard sub-component ──────────────────────────── */

function StatCard({ label, value, color, icon, sub, gradient, borderColor }) {
    return (
        <div style={{ ...S.statCard, background: gradient, borderColor }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <p style={S.statLabel}>{label}</p>
                <span style={{
                    width: "2.2rem", height: "2.2rem",
                    borderRadius: "0.6rem",
                    background: `${color}20`,
                    border: `1px solid ${color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem",
                }}>{icon}</span>
            </div>
            <p style={{ ...S.statValue, color }}>{value}</p>
            <p style={S.statSub}>{sub}</p>
        </div>
    );
}

/* ── Style tokens matching modern desktop theme ────────────────────────── */

const S = {
    loadingWrap: {
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "50vh",
    },

    spinner: {
        width: "2.8rem", height: "2.8rem",
        border: "3px solid rgba(168,85,247,0.2)",
        borderTopColor: "#a855f7",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },

    retryBtn: {
        marginTop: "1rem",
        padding: "0.6rem 1.25rem",
        borderRadius: "0.75rem",
        background: "#a855f7",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.85rem",
        border: "none",
        cursor: "pointer",
    },

    pageHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "1.5rem",
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
        fontSize: "1.85rem",
        fontWeight: 800,
        color: "#f9fafb",
        margin: 0,
        fontFamily: "'Inter', sans-serif",
    },

    pageSubtitle: {
        fontSize: "0.88rem",
        color: "#9ca3af",
        marginTop: "0.25rem",
    },

    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
    },

    overallBadge: {
        background: "#0d1120",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "0.85rem",
        padding: "0.55rem 1.15rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
    },

    overallBadgeLabel: {
        fontSize: "0.65rem",
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontWeight: 700,
    },

    overallBadgeVal: {
        fontSize: "1.2rem",
        fontWeight: 800,
        color: "#a855f7",
        fontFamily: "'Inter', sans-serif",
    },

    aiHeaderBtn: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.6rem 1.15rem",
        borderRadius: "0.85rem",
        background: "linear-gradient(135deg, #a855f7, #6366f1)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.85rem",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 2px 10px rgba(168,85,247,0.3)",
        transition: "all 0.15s",
    },

    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1.15rem",
        marginBottom: "1.25rem",
    },

    statCard: {
        borderRadius: "1.15rem",
        border: "1px solid",
        padding: "1.25rem 1.35rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        transition: "transform 0.2s, box-shadow 0.2s",
    },

    statLabel: {
        fontSize: "0.75rem",
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontWeight: 700,
        margin: 0,
    },

    statValue: {
        fontSize: "1.75rem",
        fontWeight: 800,
        margin: "0.2rem 0",
        fontFamily: "'Inter', sans-serif",
    },

    statSub: {
        fontSize: "0.72rem",
        color: "#6b7280",
        margin: 0,
    },

    /* AI Banner */
    aiBannerCard: {
        background: "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(17,24,39,0.95))",
        border: "1px solid rgba(168,85,247,0.35)",
        borderRadius: "1.25rem",
        padding: "1.35rem 1.5rem",
        marginBottom: "1.5rem",
        boxShadow: "0 4px 25px rgba(124,58,237,0.15)",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
    },

    aiBannerLeft: {
        flex: 1,
        display: "flex",
        alignItems: "flex-start",
        gap: "1.15rem",
    },

    aiBannerIconWrap: {
        width: "3.2rem",
        height: "3.2rem",
        borderRadius: "0.95rem",
        background: "linear-gradient(135deg, rgba(124,58,237,0.45), rgba(79,70,229,0.45))",
        border: "1px solid rgba(168,85,247,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 0 15px rgba(124,58,237,0.3)",
    },

    aiBannerTag: {
        fontSize: "0.66rem",
        fontWeight: 800,
        color: "#c084fc",
        letterSpacing: "0.08em",
    },

    aiLiveDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "#22c55e",
        boxShadow: "0 0 6px #22c55e",
    },

    aiBannerQuote: {
        fontSize: "1.05rem",
        fontWeight: 700,
        color: "#f3f4f6",
        margin: "0 0 0.3rem 0",
        lineHeight: 1.45,
        fontStyle: "italic",
    },

    aiBannerInsight: {
        fontSize: "0.8rem",
        color: "#9ca3af",
        margin: 0,
        lineHeight: 1.5,
    },

    shimmerBlock: {
        height: "3rem",
        borderRadius: "0.5rem",
        background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%)",
        backgroundSize: "400px 100%",
        animation: "shimmer 1.5s infinite",
    },

    aiBannerRight: {
        flexShrink: 0,
    },

    progressRing: {
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
    },

    ringLabel: {
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },

    ringNum: {
        fontSize: "0.85rem",
        fontWeight: 800,
        color: "#c084fc",
        lineHeight: 1,
    },

    ringTxt: {
        fontSize: "0.58rem",
        color: "#9ca3af",
        marginTop: "1px",
    },

    /* Desktop Two Columns */
    twoColDesktop: {
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr",
        gap: "1.35rem",
        alignItems: "start",
    },

    sectionCard: {
        background: "#0d1120",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1.25rem",
        padding: "1.35rem 1.5rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.25rem",
    },

    sectionTitle: {
        fontSize: "1.1rem",
        fontWeight: 700,
        color: "#f9fafb",
        margin: 0,
    },

    sectionSubtitle: {
        fontSize: "0.78rem",
        color: "#9ca3af",
        marginTop: "0.2rem",
    },

    activeBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.25rem 0.75rem",
        borderRadius: "9999px",
        background: "rgba(168,85,247,0.12)",
        color: "#c084fc",
        fontSize: "0.72rem",
        fontWeight: 700,
    },

    activeDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#c084fc",
    },

    emptyBox: {
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        border: "1px dashed rgba(255,255,255,0.08)",
        borderRadius: "0.85rem",
    },

    addSubjectBtn: {
        marginTop: "1rem",
        padding: "0.55rem 1.15rem",
        borderRadius: "0.65rem",
        background: "#a855f7",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.8rem",
        border: "none",
        cursor: "pointer",
    },

    subjectList: {
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
    },

    subjectRow: {
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "0.85rem",
        padding: "0.85rem 1.1rem",
        transition: "all 0.15s",
    },

    subjectMeta: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "0.55rem",
    },

    subjectName: {
        fontSize: "0.92rem",
        fontWeight: 700,
        color: "#f3f4f6",
        margin: 0,
    },

    subjectHours: {
        fontSize: "0.75rem",
        color: "#6b7280",
        margin: "0.15rem 0 0 0",
    },

    percentTag: {
        fontSize: "0.78rem",
        fontWeight: 700,
        padding: "0.2rem 0.6rem",
        borderRadius: "0.45rem",
        border: "1px solid",
    },

    hoursDetail: {
        fontSize: "0.7rem",
        color: "#6b7280",
        margin: "0.2rem 0 0 0",
    },

    subProgressTrack: {
        height: "0.45rem",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "9999px",
        overflow: "hidden",
    },

    subProgressFill: {
        height: "100%",
        borderRadius: "9999px",
        transition: "width 0.6s ease",
    },

    /* Right column */
    rightColumn: {
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
    },

    sideCard: {
        background: "#0d1120",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1.25rem",
        padding: "1.35rem 1.5rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    },

    sideCardTitle: {
        fontSize: "0.95rem",
        fontWeight: 700,
        color: "#f9fafb",
        margin: "0 0 1rem 0",
    },

    hoursOverview: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        marginBottom: "1rem",
    },

    hoursNumBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },

    hoursBigNum: {
        fontSize: "1.85rem",
        fontWeight: 800,
        color: "#c084fc",
        fontFamily: "'Inter', sans-serif",
    },

    hoursSub: {
        fontSize: "0.7rem",
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginTop: "0.2rem",
    },

    hoursDivider: {
        fontSize: "1.85rem",
        color: "rgba(255,255,255,0.15)",
        fontWeight: 300,
    },

    progressTrack: {
        height: "0.55rem",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "9999px",
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        background: "linear-gradient(90deg, #a855f7, #6366f1)",
        borderRadius: "9999px",
        transition: "width 0.6s ease",
    },

    actionTilesList: {
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
    },

    actionTile: {
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
        padding: "0.75rem 0.95rem",
        borderRadius: "0.85rem",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        color: "#e5e7eb",
        cursor: "pointer",
        transition: "all 0.18s",
        textAlign: "left",
        width: "100%",
    },

    actionTileTitle: {
        fontSize: "0.85rem",
        fontWeight: 700,
        color: "#f3f4f6",
        margin: 0,
    },

    actionTileSub: {
        fontSize: "0.72rem",
        color: "#9ca3af",
        margin: "0.15rem 0 0 0",
    },

    actionTileArrow: {
        marginLeft: "auto",
        fontSize: "0.95rem",
        color: "#a855f7",
        fontWeight: 700,
    },
};

export default Dashboard;