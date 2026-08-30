import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import MainLayout from "../../layouts/MainLayout";

import {
    getStudyPlan,
    generateStudyPlan,
    completeStudyPlan,
    getStudyPlanSummary
} from "../../services/studyPlanService";

/* ─── inject keyframes once ───────────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("sp-kf")) {
    const st = document.createElement("style");
    st.id = "sp-kf";
    st.textContent = `
        @keyframes spin        { to { transform:rotate(360deg); } }
        @keyframes sp-fade-in  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sp-shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes sp-pulse    { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes sp-pop      { 0%{transform:scale(0.95);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes ai-glow     { 0%,100%{box-shadow:0 0 16px rgba(168,85,247,0.4)} 50%{box-shadow:0 0 32px rgba(168,85,247,0.8)} }
    `;
    document.head.appendChild(st);
}

/* Subject colour palette */
const PALETTE = [
    { bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.5)",  text: "#818cf8", dot: "#6366f1" },
    { bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.5)",  text: "#c084fc", dot: "#a855f7" },
    { bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.4)",   text: "#4ade80", dot: "#22c55e" },
    { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.4)",  text: "#fbbf24", dot: "#f59e0b" },
    { bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.4)",  text: "#f472b6", dot: "#ec4899" },
    { bg: "rgba(20,184,166,0.12)", border: "rgba(20,184,166,0.4)",  text: "#2dd4bf", dot: "#14b8a6" },
    { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.4)",   text: "#f87171", dot: "#ef4444" },
    { bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.4)",  text: "#fb923c", dot: "#f97316" },
];

/* Map subject names → consistent colours */
const colourMap = {};
let colourIdx = 0;
function getColour(name) {
    if (!colourMap[name]) {
        colourMap[name] = PALETTE[colourIdx % PALETTE.length];
        colourIdx++;
    }
    return colourMap[name];
}

function StudyPlan() {

    const { examId } = useParams();

    const [plans, setPlans]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [generating, setGenerating] = useState(false);
    const [summary, setSummary]       = useState(null);
    const [activeDate, setActiveDate] = useState(null);

    const sectionRefs = useRef({});

    // --------------------------------------------------
    // Load Study Plan
    // --------------------------------------------------

    const loadPlan = async () => {
        try {
            const data = await getStudyPlan(examId);
            setPlans(data);
            const summaryData = await getStudyPlanSummary(examId);
            setSummary(summaryData);
        } catch (error) {
            console.error("Unable to load study plan:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPlan(); }, [examId]);

    // --------------------------------------------------
    // Generate Study Plan
    // --------------------------------------------------

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            const result = await generateStudyPlan(examId);
            alert(result.message);
            await loadPlan();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.detail || "Unable to generate study plan");
        } finally {
            setGenerating(false);
        }
    };

    // --------------------------------------------------
    // Complete Study Session
    // --------------------------------------------------

    const handleComplete = async (planId) => {
        try {
            await completeStudyPlan(planId);
            await loadPlan();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.detail || "Unable to complete study session");
        }
    };

    // --------------------------------------------------
    // Scroll to date section
    // --------------------------------------------------

    const scrollToDate = (date) => {
        setActiveDate(date);
        const el = sectionRefs.current[date];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // --------------------------------------------------
    // Loading state
    // --------------------------------------------------

    if (loading) {
        return (
            <MainLayout>
                <div style={S.loadingWrap}>
                    <div style={S.spinner} />
                    <p style={{ color: "#6b7280", marginTop: "1rem" }}>Loading your study plan…</p>
                </div>
            </MainLayout>
        );
    }

    // --------------------------------------------------
    // Group plans by date
    // --------------------------------------------------

    const groupedPlans = plans.reduce((groups, plan) => {
        const date = plan.study_date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(plan);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedPlans).sort();
    const today       = new Date().toISOString().slice(0, 10);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    };

    const isPast  = (d) => d < today;
    const isToday = (d) => d === today;

    const studyData = { summary };

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    return (

        <MainLayout studyData={studyData}>

            {/* ── Page header ──────────────────────────── */}
            <div style={S.pageHeader} className="app-page-header">

                <div>
                    <h1 style={S.pageTitle}>Study Plan</h1>
                    <p style={S.pageSubtitle}>Your personalised daily study timetable</p>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    style={{ ...S.generateBtn, opacity: generating ? 0.55 : 1 }}
                    onMouseEnter={e => { if (!generating) e.currentTarget.style.background = "#7c3aed"; }}
                    onMouseLeave={e => { if (!generating) e.currentTarget.style.background = "#a855f7"; }}
                >
                    {generating ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ ...S.btnSpinner }} />Generating…
                        </span>
                    ) : "⚡ Generate Plan"}
                </button>

            </div>


            {/* ── Summary cards ────────────────────────── */}
            {summary && (
                <>
                    <div style={S.statsGrid}>
                        <StatCard label="Required Hours" value={`${summary.total_required_hours} hrs`} color="#6366f1" icon="📚" />
                        <StatCard label="Completed"       value={`${summary.completed_hours} hrs`}     color="#22c55e" icon="✅" />
                        <StatCard label="Remaining"       value={`${summary.remaining_hours} hrs`}     color="#f59e0b" icon="⏳" />
                        <StatCard label="Progress"        value={`${summary.progress_percentage}%`}    color="#a855f7" icon="📈" />
                    </div>

                    {/* Progress bar card */}
                    <div style={S.progressCard}>
                        <div style={S.progressHeader}>
                            <div>
                                <span style={S.progressLabel}>Overall Progress</span>
                                <span style={S.progressSub}> — keep it up!</span>
                            </div>
                            <span style={S.progressNum}>
                                {summary.completed_hours} / {summary.total_required_hours} hrs
                            </span>
                        </div>

                        <div style={S.progressTrack}>
                            <div style={{
                                ...S.progressFill,
                                width: `${Math.min(summary.progress_percentage, 100)}%`
                            }} />
                        </div>

                        <div style={S.progressFooter}>
                            <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                                {summary.progress_percentage}% completed
                            </span>
                            {summary.uncovered_hours > 0 && (
                                <span style={S.warningChip}>
                                    ⚠️ {summary.uncovered_hours} hrs uncovered
                                </span>
                            )}
                        </div>
                    </div>
                </>
            )}


            {/* ── No plan yet ──────────────────────────── */}
            {plans.length === 0 && (
                <div style={S.emptyCard}>
                    <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📋</div>
                    <h2 style={{ fontWeight: 700, fontSize: "1.3rem", marginBottom: "0.5rem", color: "#f9fafb" }}>
                        No Study Plan Yet
                    </h2>
                    <p style={{ color: "#9ca3af", marginBottom: "1.75rem" }}>
                        Generate a personalised study plan based on your subjects and available time.
                    </p>
                    <button
                        onClick={handleGenerate}
                        style={S.generateBtn}
                        onMouseEnter={e => e.currentTarget.style.background = "#7c3aed"}
                        onMouseLeave={e => e.currentTarget.style.background = "#a855f7"}
                    >
                        ⚡ Generate Study Plan
                    </button>
                </div>
            )}


            {/* ── Two-column layout: date sidebar + timeline ── */}
            {sortedDates.length > 0 && (

                <div style={S.twoCol} className="sp-two-col">

                    {/* ════ DATE SIDEBAR ════ */}
                    <aside style={S.dateSidebar} className="sp-date-sidebar">

                        <p style={S.sidebarTitle}>📅 Jump to Date</p>

                        <div style={S.dateList}>
                            {sortedDates.map((date) => {

                                const dailyPlans = groupedPlans[date];
                                const doneCount  = dailyPlans.filter(p => p.completed).length;
                                const totalCount = dailyPlans.length;
                                const allDone    = doneCount === totalCount;
                                const isAct      = activeDate === date;
                                const todayDate  = isToday(date);
                                const pastDate   = isPast(date) && !todayDate;

                                const statusColor = allDone    ? "#22c55e"
                                    : todayDate ? "#a855f7"
                                    : pastDate  ? "#374151"
                                    : "#6366f1";

                                return (
                                    <button
                                        key={date}
                                        onClick={() => scrollToDate(date)}
                                        style={{
                                            ...S.datePill,
                                            background:  isAct ? "rgba(168,85,247,0.15)" : "transparent",
                                            borderColor: isAct ? "#a855f7" : "rgba(255,255,255,0.06)",
                                            color:       isAct ? "#e9d5ff" : "#9ca3af",
                                        }}
                                        onMouseEnter={e => {
                                            if (!isAct) {
                                                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                                e.currentTarget.style.color = "#fff";
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!isAct) {
                                                e.currentTarget.style.background = "transparent";
                                                e.currentTarget.style.color = "#9ca3af";
                                            }
                                        }}
                                    >
                                        <span style={{ ...S.dot, background: statusColor }} />

                                        <span style={{ flex: 1, textAlign: "left" }}>
                                            {todayDate && <span style={S.todayBadge}>Today</span>}
                                            {formatDate(date)}
                                        </span>

                                        <span style={{
                                            ...S.pillCount,
                                            color: allDone ? "#4ade80" : "#4b5563",
                                        }}>{doneCount}/{totalCount}</span>
                                    </button>
                                );
                            })}
                        </div>

                    </aside>


                    {/* ════ TIMELINE ════ */}
                    <div style={S.planContent}>

                        {sortedDates.map((date, dateIndex) => {

                            const dailyPlans = groupedPlans[date];
                            const doneCount  = dailyPlans.filter(p => p.completed).length;
                            const totalHours = dailyPlans
                                .reduce((t, p) => t + Number(p.study_hours), 0)
                                .toFixed(1);

                            const todayDate  = isToday(date);
                            const pastDate   = isPast(date) && !todayDate;
                            const allDone    = doneCount === dailyPlans.length;

                            const dayProgressPct = dailyPlans.length
                                ? Math.round((doneCount / dailyPlans.length) * 100)
                                : 0;

                            return (

                                <div
                                    key={date}
                                    ref={el => sectionRefs.current[date] = el}
                                    style={{
                                        ...S.dayCard,
                                        borderColor: todayDate ? "rgba(168,85,247,0.5)"
                                            : allDone   ? "rgba(34,197,94,0.3)"
                                            : "rgba(255,255,255,0.06)",
                                        animation: `sp-pop 0.3s ease ${dateIndex * 0.04}s both`,
                                        opacity: pastDate && !allDone ? 0.8 : 1,
                                    }}
                                >

                                    {/* ── Day header ── */}
                                    <div style={{
                                        ...S.dayHeader,
                                        background: todayDate
                                            ? "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(17,24,39,0.9))"
                                            : allDone
                                            ? "rgba(34,197,94,0.06)"
                                            : "rgba(255,255,255,0.02)",
                                    }}>

                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            {/* Day status icon */}
                                            <div style={{
                                                width: "2.25rem", height: "2.25rem",
                                                borderRadius: "0.625rem",
                                                background: allDone    ? "rgba(34,197,94,0.2)"
                                                    : todayDate ? "rgba(168,85,247,0.2)"
                                                    : pastDate  ? "rgba(255,255,255,0.05)"
                                                    : "rgba(99,102,241,0.15)",
                                                border: `1px solid ${allDone ? "rgba(34,197,94,0.4)" : todayDate ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.08)"}`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: "1rem", flexShrink: 0,
                                            }}>
                                                {allDone ? "✓" : todayDate ? "⚡" : pastDate ? "◷" : "📅"}
                                            </div>

                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    {todayDate && <span style={S.todayTag}>Today</span>}
                                                    {pastDate  && <span style={S.pastTag}>Past</span>}
                                                    {allDone   && <span style={S.doneTag}>✓ Complete</span>}
                                                    <h2 style={S.dayTitle}>{formatDate(date)}</h2>
                                                </div>
                                                <p style={S.dayDate}>{date}</p>
                                            </div>
                                        </div>

                                        <div style={S.dayMeta}>
                                            <span style={S.metaChip}>⏱ {totalHours} hrs</span>
                                            <span style={{
                                                ...S.metaChip,
                                                background: allDone
                                                    ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                                                color: allDone ? "#4ade80" : "#9ca3af",
                                                borderColor: allDone ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)",
                                            }}>
                                                {doneCount}/{dailyPlans.length} done
                                            </span>
                                        </div>
                                    </div>

                                    {/* Day progress bar */}
                                    <div style={S.dayProgressTrack}>
                                        <div style={{
                                            height: "100%",
                                            borderRadius: "9999px",
                                            width: `${dayProgressPct}%`,
                                            background: allDone
                                                ? "linear-gradient(90deg,#22c55e,#16a34a)"
                                                : todayDate
                                                ? "linear-gradient(90deg,#a855f7,#6366f1)"
                                                : "linear-gradient(90deg,#374151,#4b5563)",
                                            transition: "width 0.6s ease",
                                        }} />
                                    </div>

                                    {/* ── Sessions timeline ── */}
                                    <div style={S.sessionList}>
                                        {dailyPlans.map((plan, idx) => {
                                            const c = getColour(plan.subject_name);
                                            const isLast = idx === dailyPlans.length - 1;
                                            return (
                                                <div key={plan.id} style={{ ...S.sessionRow, borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)" }}>

                                                    {/* Timeline line + dot */}
                                                    <div style={S.timelineSide}>
                                                        <div style={{
                                                            width: "12px", height: "12px",
                                                            borderRadius: "50%",
                                                            background: plan.completed ? "#22c55e" : c.dot,
                                                            flexShrink: 0,
                                                            boxShadow: plan.completed
                                                                ? "0 0 8px rgba(34,197,94,0.5)"
                                                                : `0 0 8px ${c.dot}60`,
                                                            zIndex: 1,
                                                        }} />
                                                        {!isLast && <div style={S.timelineLine} />}
                                                    </div>

                                                    {/* Subject pill */}
                                                    <div style={S.sessionBody}>
                                                        <div style={{
                                                            ...S.subjectPill,
                                                            background: plan.completed ? "rgba(34,197,94,0.1)" : c.bg,
                                                            borderColor: plan.completed ? "rgba(34,197,94,0.35)" : c.border,
                                                        }}>
                                                            <div style={{ flex: 1 }}>
                                                                <p style={{
                                                                    ...S.sessionSubject,
                                                                    color: plan.completed ? "#4ade80" : c.text,
                                                                    textDecoration: plan.completed ? "line-through" : "none",
                                                                }}>
                                                                    {plan.subject_name}
                                                                </p>
                                                                <div style={S.sessionMeta}>
                                                                    <span style={S.sessionHrsChip}>
                                                                        ⏱ {plan.study_hours} hrs
                                                                    </span>
                                                                    {plan.completed && (
                                                                        <span style={S.completedMiniChip}>✓ done</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {plan.completed ? (
                                                                <span style={S.completedBadge}>✓ Completed</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleComplete(plan.id)}
                                                                    style={S.completeBtn}
                                                                    onMouseEnter={e => e.currentTarget.style.background = "#7c3aed"}
                                                                    onMouseLeave={e => e.currentTarget.style.background = "#a855f7"}
                                                                >
                                                                    Mark Done
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                </div>
                                            );
                                        })}
                                    </div>

                                </div>

                            );
                        })}

                    </div>

                </div>

            )}

        </MainLayout>

    );

}


/* ── StatCard sub-component ────────────────────────── */

function StatCard({ label, value, color, icon }) {
    return (
        <div style={S.statCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.65rem" }}>
                <p style={S.statLabel}>{label}</p>
                <span style={{
                    width: "2rem", height: "2rem",
                    borderRadius: "0.5rem",
                    background: `${color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.9rem",
                }}>{icon}</span>
            </div>
            <p style={{ ...S.statValue, color }}>{value}</p>
        </div>
    );
}


/* ── Style tokens ──────────────────────────────────── */

const S = {

    loadingWrap: {
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "40vh",
    },

    spinner: {
        width: "2.5rem", height: "2.5rem",
        border: "3px solid rgba(168,85,247,0.2)",
        borderTopColor: "#a855f7",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },

    btnSpinner: {
        display: "inline-block",
        width: "0.9rem", height: "0.9rem",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
    },

    pageHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
    },

    pageTitle: {
        fontSize: "1.85rem",
        fontWeight: 800,
        color: "#f9fafb",
        margin: 0,
        fontFamily: "'Inter', sans-serif",
    },

    pageSubtitle: {
        fontSize: "0.9rem",
        color: "#6b7280",
        marginTop: "0.2rem",
    },

    generateBtn: {
        padding: "0.65rem 1.4rem",
        borderRadius: "0.75rem",
        background: "#a855f7",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.88rem",
        border: "none",
        cursor: "pointer",
        transition: "background 0.18s",
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 4px 15px rgba(168,85,247,0.25)",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
    },

    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1rem",
        marginBottom: "1rem",
    },

    statCard: {
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1rem",
        padding: "1.25rem 1.5rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    },

    statLabel: {
        fontSize: "0.78rem",
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: 0,
    },

    statValue: {
        fontSize: "1.7rem",
        fontWeight: 800,
        margin: 0,
        fontFamily: "'Inter', sans-serif",
    },

    progressCard: {
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1rem",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.5rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    },

    progressHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "0.75rem",
    },

    progressLabel: { fontWeight: 700, color: "#f9fafb", fontSize: "0.95rem" },
    progressSub:   { fontWeight: 400, color: "#6b7280", fontSize: "0.85rem" },
    progressNum:   { fontSize: "0.85rem", color: "#6b7280" },

    progressTrack: {
        height: "0.6rem",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "9999px",
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        background: "linear-gradient(90deg, #a855f7, #6366f1)",
        borderRadius: "9999px",
        transition: "width 0.6s ease",
        boxShadow: "0 0 10px rgba(168,85,247,0.4)",
    },

    progressFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "0.6rem",
    },

    warningChip: {
        padding: "0.2rem 0.6rem",
        borderRadius: "9999px",
        background: "rgba(251,146,60,0.15)",
        border: "1px solid rgba(251,146,60,0.3)",
        color: "#fb923c",
        fontSize: "0.72rem",
        fontWeight: 600,
    },

    emptyCard: {
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1.25rem",
        padding: "3.5rem",
        textAlign: "center",
    },

    /* Two-col */
    twoCol: {
        display: "grid",
        gridTemplateColumns: "270px 1fr",
        gap: "1.5rem",
        alignItems: "start",
    },

    dateSidebar: {
        background: "#0d1120",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1.25rem",
        padding: "1.15rem",
        position: "sticky",
        top: "6rem",
        maxHeight: "calc(100vh - 8rem)",
        overflowY: "auto",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(168,85,247,0.3) transparent",
    },

    sidebarTitle: {
        fontSize: "0.72rem",
        fontWeight: 800,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "0.85rem",
        padding: "0 0.25rem",
    },

    dateList: {
        display: "flex",
        flexDirection: "column",
        gap: "0.2rem",
    },

    datePill: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.55rem 0.65rem",
        borderRadius: "0.6rem",
        border: "1px solid",
        cursor: "pointer",
        fontSize: "0.78rem",
        fontFamily: "'Inter', sans-serif",
        transition: "all 0.15s",
        textAlign: "left",
        width: "100%",
    },

    dot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        flexShrink: 0,
    },

    todayBadge: {
        display: "block",
        fontSize: "0.6rem",
        fontWeight: 700,
        color: "#c084fc",
        letterSpacing: "0.05em",
        marginBottom: "1px",
        textTransform: "uppercase",
    },

    pillCount: {
        fontSize: "0.65rem",
        flexShrink: 0,
        fontWeight: 600,
    },

    planContent: {
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
    },

    /* ── Day card ── */
    dayCard: {
        background: "#111827",
        border: "1px solid",
        borderRadius: "1.25rem",
        overflow: "hidden",
        scrollMarginTop: "6rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    },

    dayHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 1.25rem",
    },

    dayTitle: {
        fontSize: "1rem",
        fontWeight: 700,
        color: "#f9fafb",
        margin: 0,
    },

    dayDate: {
        fontSize: "0.72rem",
        color: "#4b5563",
        margin: 0,
        marginTop: "2px",
    },

    dayMeta: {
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
    },

    metaChip: {
        padding: "0.25rem 0.65rem",
        borderRadius: "9999px",
        fontSize: "0.72rem",
        fontWeight: 600,
        background: "rgba(255,255,255,0.06)",
        color: "#9ca3af",
        border: "1px solid rgba(255,255,255,0.08)",
    },

    todayTag: {
        padding: "0.15rem 0.5rem",
        borderRadius: "9999px",
        background: "rgba(168,85,247,0.2)",
        color: "#c084fc",
        fontSize: "0.6rem",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        border: "1px solid rgba(168,85,247,0.3)",
    },

    pastTag: {
        padding: "0.15rem 0.5rem",
        borderRadius: "9999px",
        background: "rgba(255,255,255,0.05)",
        color: "#4b5563",
        fontSize: "0.6rem",
        fontWeight: 700,
        textTransform: "uppercase",
    },

    doneTag: {
        padding: "0.15rem 0.5rem",
        borderRadius: "9999px",
        background: "rgba(34,197,94,0.15)",
        color: "#4ade80",
        fontSize: "0.6rem",
        fontWeight: 700,
        textTransform: "uppercase",
        border: "1px solid rgba(34,197,94,0.3)",
    },

    /* Thin progress bar below day header */
    dayProgressTrack: {
        height: "3px",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 0,
    },

    sessionList: {
        display: "flex",
        flexDirection: "column",
        padding: "0.25rem 0",
    },

    sessionRow: {
        display: "flex",
        alignItems: "stretch",
        gap: "0",
        padding: "0.75rem 1.25rem",
    },

    /* Timeline left column */
    timelineSide: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "24px",
        flexShrink: 0,
        paddingTop: "0.25rem",
    },

    timelineLine: {
        flex: 1,
        width: "2px",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "1px",
        marginTop: "4px",
        minHeight: "1.5rem",
    },

    sessionBody: {
        flex: 1,
        paddingLeft: "0.75rem",
    },

    subjectPill: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        padding: "0.65rem 0.875rem",
        borderRadius: "0.75rem",
        border: "1px solid",
        transition: "all 0.2s",
    },

    sessionSubject: {
        fontWeight: 700,
        fontSize: "0.88rem",
        margin: 0,
        marginBottom: "0.25rem",
        transition: "color 0.2s",
    },

    sessionMeta: {
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
    },

    sessionHrsChip: {
        fontSize: "0.7rem",
        color: "#6b7280",
        background: "rgba(255,255,255,0.04)",
        padding: "0.1rem 0.4rem",
        borderRadius: "9999px",
        border: "1px solid rgba(255,255,255,0.06)",
    },

    completedMiniChip: {
        fontSize: "0.68rem",
        color: "#4ade80",
        fontWeight: 700,
    },

    completedBadge: {
        padding: "0.35rem 0.85rem",
        borderRadius: "9999px",
        background: "rgba(34,197,94,0.12)",
        color: "#4ade80",
        fontSize: "0.75rem",
        fontWeight: 700,
        border: "1px solid rgba(34,197,94,0.25)",
        flexShrink: 0,
    },

    completeBtn: {
        padding: "0.4rem 0.9rem",
        borderRadius: "0.6rem",
        background: "#a855f7",
        color: "#fff",
        fontSize: "0.75rem",
        fontWeight: 700,
        border: "none",
        cursor: "pointer",
        transition: "background 0.18s",
        fontFamily: "inherit",
        boxShadow: "0 2px 8px rgba(168,85,247,0.3)",
        flexShrink: 0,
    },

};

export default StudyPlan;