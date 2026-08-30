import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getExams, deleteExam } from "../../services/examService";
import ExamModal from "../../components/ExamModal/ExamModal";

function Exams() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => { loadExams(); }, []);

    const loadExams = async () => {
        try {
            const data = await getExams();
            setExams(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this exam?")) return;
        try {
            await deleteExam(id);
            loadExams();
        } catch (error) {
            console.log(error);
            alert("Unable to delete exam");
        }
    };

    const handleSelectExam = (exam) => {
        localStorage.setItem("selectedExamId", exam.id);
        navigate(`/subjects/${exam.id}`);
    };

    // Calculate days remaining
    const getDaysRemaining = (dateStr) => {
        if (!dateStr) return null;
        const examDate = new Date(dateStr);
        const today = new Date();
        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const filteredExams = exams.filter((e) =>
        e.exam_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <MainLayout>
                <div style={S.loadingWrap}>
                    <div style={S.spinner} />
                    <p style={{ color: "#9ca3af", marginTop: "1rem", fontWeight: 600 }}>Loading your exams…</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {/* ── Page Header ── */}
            <div style={S.pageHeader} className="app-page-header">
                <div>
                    <div style={S.badge}>🎓 Exam Hub</div>
                    <h1 style={S.pageTitle}>My Exams</h1>
                    <p style={S.pageSubtitle}>Manage your target certifications, school exams, and semester schedules.</p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <button
                        style={S.addBtn}
                        onClick={() => setShowModal(true)}
                    >
                        <span>＋</span>
                        <span>Create New Exam</span>
                    </button>
                </div>
            </div>

            {/* ── Top Desktop Ribbon: Search + View Toggles + Exam Count ── */}
            <div style={S.filterRibbon} className="app-filter-ribbon">
                <div style={S.searchWrap}>
                    <span style={{ color: "#6b7280" }}>🔍</span>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search exams by name..."
                        style={S.searchInput}
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={S.countChip}>{filteredExams.length} Exams Listed</span>

                    {/* View Switcher Buttons */}
                    <div style={S.viewToggleWrap}>
                        <button
                            onClick={() => setViewMode("grid")}
                            style={{
                                ...S.viewBtn,
                                background: viewMode === "grid" ? "rgba(168,85,247,0.25)" : "transparent",
                                color: viewMode === "grid" ? "#e9d5ff" : "#6b7280",
                                borderColor: viewMode === "grid" ? "rgba(168,85,247,0.4)" : "transparent",
                            }}
                            title="Grid View"
                        >
                            ⊞ Cards
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            style={{
                                ...S.viewBtn,
                                background: viewMode === "table" ? "rgba(168,85,247,0.25)" : "transparent",
                                color: viewMode === "table" ? "#e9d5ff" : "#6b7280",
                                borderColor: viewMode === "table" ? "rgba(168,85,247,0.4)" : "transparent",
                            }}
                            title="Table View"
                        >
                            ☰ Table
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Empty State ── */}
            {filteredExams.length === 0 && (
                <div style={S.emptyCard}>
                    <div style={S.emptyIcon}>📋</div>
                    <h2 style={S.emptyTitle}>No Exams Found</h2>
                    <p style={S.emptySubtitle}>
                        {searchQuery ? "No exams match your search query." : "Create your first exam target to start planning your study syllabus and timetable."}
                    </p>
                    <button
                        style={S.addBtn}
                        onClick={() => setShowModal(true)}
                    >
                        ＋ Create First Exam
                    </button>
                </div>
            )}

            {/* ── Desktop Grid View ── */}
            {filteredExams.length > 0 && viewMode === "grid" && (
                <div style={S.cardsGrid} className="exams-cards-grid">
                    {filteredExams.map((exam) => {
                        const daysLeft = getDaysRemaining(exam.exam_date);
                        const isUpcoming = daysLeft !== null && daysLeft > 0;
                        const isUrgent = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;

                        return (
                            <div
                                key={exam.id}
                                style={S.examCard}
                                onClick={() => handleSelectExam(exam)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.5), 0 0 20px rgba(168,85,247,0.2)";
                                    e.currentTarget.style.borderColor = "rgba(168,85,247,0.45)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                                }}
                            >
                                {/* Card Header */}
                                <div style={S.cardTopRow}>
                                    <div style={S.avatar}>
                                        {exam.exam_name ? exam.exam_name.charAt(0).toUpperCase() : "E"}
                                    </div>

                                    {daysLeft !== null && (
                                        <span style={{
                                            ...S.countdownBadge,
                                            background: isUrgent ? "rgba(239,68,68,0.15)" : isUpcoming ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)",
                                            borderColor: isUrgent ? "rgba(239,68,68,0.35)" : isUpcoming ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.1)",
                                            color: isUrgent ? "#f87171" : isUpcoming ? "#4ade80" : "#9ca3af",
                                        }}>
                                            {isUrgent ? `🔥 In ${daysLeft} days` : isUpcoming ? `⏳ In ${daysLeft} days` : "✓ Concluded"}
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 style={S.cardExamTitle}>{exam.exam_name}</h3>

                                {/* Meta details */}
                                <div style={S.cardMetaGrid}>
                                    <div style={S.cardMetaItem}>
                                        <span style={S.cardMetaLabel}>Exam Date</span>
                                        <span style={S.cardMetaVal}>📅 {exam.exam_date || "Not set"}</span>
                                    </div>
                                    <div style={S.cardMetaItem}>
                                        <span style={S.cardMetaLabel}>Target Score</span>
                                        <span style={{ ...S.cardMetaVal, color: "#c084fc", fontWeight: 800 }}>🎯 {exam.target_score} pts</span>
                                    </div>
                                </div>

                                {/* Action Buttons Footer */}
                                <div style={S.cardActionsFooter}>
                                    <button
                                        style={S.viewSubjectsBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectExam(exam);
                                        }}
                                    >
                                        📖 Subjects
                                    </button>

                                    <button
                                        style={S.viewPlanBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            localStorage.setItem("selectedExamId", exam.id);
                                            navigate(`/study-plan/${exam.id}`);
                                        }}
                                    >
                                        ▦ Study Plan
                                    </button>

                                    <button
                                        style={S.deleteIconBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(exam.id);
                                        }}
                                        title="Delete Exam"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Desktop Table View ── */}
            {filteredExams.length > 0 && viewMode === "table" && (
                <div style={S.tableCard} className="app-table-card">
                    <table style={S.tableEl}>
                        <thead>
                            <tr>
                                <th style={S.th}>Exam Name</th>
                                <th style={S.th}>Exam Date</th>
                                <th style={S.th}>Days Left</th>
                                <th style={S.th}>Target Score</th>
                                <th style={S.thCenter}>Quick Navigation</th>
                                <th style={S.thCenter}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredExams.map((exam) => {
                                const daysLeft = getDaysRemaining(exam.exam_date);
                                return (
                                    <tr
                                        key={exam.id}
                                        style={S.tableRow}
                                        onClick={() => handleSelectExam(exam)}
                                    >
                                        <td style={S.td}>
                                            <div style={S.examCell}>
                                                <div style={S.avatarSmall}>
                                                    {exam.exam_name ? exam.exam_name.charAt(0).toUpperCase() : "E"}
                                                </div>
                                                <span style={S.examNameText}>{exam.exam_name}</span>
                                            </div>
                                        </td>

                                        <td style={S.td}>
                                            <span style={S.dateChip}>📅 {exam.exam_date}</span>
                                        </td>

                                        <td style={S.td}>
                                            <span style={{ fontSize: "0.8rem", color: daysLeft <= 7 ? "#f87171" : "#4ade80", fontWeight: 700 }}>
                                                {daysLeft > 0 ? `${daysLeft} days remaining` : "Concluded"}
                                            </span>
                                        </td>

                                        <td style={S.td}>
                                            <span style={S.scoreChip}>🎯 {exam.target_score} pts</span>
                                        </td>

                                        <td style={S.tdCenter}>
                                            <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectExam(exam);
                                                    }}
                                                    style={S.tableNavBtn}
                                                >
                                                    Subjects →
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        localStorage.setItem("selectedExamId", exam.id);
                                                        navigate(`/study-plan/${exam.id}`);
                                                    }}
                                                    style={S.tableNavBtnPlan}
                                                >
                                                    Plan →
                                                </button>
                                            </div>
                                        </td>

                                        <td style={S.tdCenter}>
                                            <button
                                                style={S.deleteBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(exam.id);
                                                }}
                                            >
                                                🗑 Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Modal ── */}
            {showModal && (
                <ExamModal
                    closeModal={() => setShowModal(false)}
                    refreshExams={loadExams}
                />
            )}
        </MainLayout>
    );
}

/* ─────────────────────────────────────────────
   Style Tokens (Desktop Refined)
───────────────────────────────────────────── */
const S = {
    loadingWrap: {
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },

    spinner: {
        width: "2.8rem",
        height: "2.8rem",
        border: "3px solid rgba(168,85,247,0.2)",
        borderTopColor: "#a855f7",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
    },

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

    addBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.7rem 1.4rem",
        borderRadius: "0.85rem",
        background: "linear-gradient(135deg, #a855f7, #6366f1)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.88rem",
        border: "none",
        cursor: "pointer",
        transition: "all 0.18s",
        boxShadow: "0 4px 15px rgba(168,85,247,0.3)",
    },

    filterRibbon: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
        gap: "1rem",
        flexWrap: "wrap",
    },

    searchWrap: {
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        background: "#0d1120",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "0.75rem",
        padding: "0.55rem 0.95rem",
        width: "320px",
    },

    searchInput: {
        background: "transparent",
        border: "none",
        outline: "none",
        color: "#f9fafb",
        fontSize: "0.85rem",
        width: "100%",
        fontFamily: "'Inter', sans-serif",
    },

    countChip: {
        fontSize: "0.78rem",
        color: "#9ca3af",
        fontWeight: 600,
    },

    viewToggleWrap: {
        display: "flex",
        background: "#0d1120",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "0.65rem",
        padding: "0.2rem",
    },

    viewBtn: {
        padding: "0.35rem 0.75rem",
        borderRadius: "0.5rem",
        border: "1px solid",
        fontSize: "0.75rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s",
    },

    /* Desktop Cards Grid */
    cardsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: "1.25rem",
    },

    examCard: {
        background: "#0d1120",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1.25rem",
        padding: "1.35rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
    },

    cardTopRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
    },

    avatar: {
        width: "44px",
        height: "44px",
        borderRadius: "0.85rem",
        background: "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(99,102,241,0.25))",
        border: "1px solid rgba(168,85,247,0.35)",
        color: "#c084fc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: "1.1rem",
    },

    countdownBadge: {
        fontSize: "0.72rem",
        fontWeight: 700,
        padding: "0.25rem 0.65rem",
        borderRadius: "9999px",
        border: "1px solid",
    },

    cardExamTitle: {
        fontSize: "1.15rem",
        fontWeight: 700,
        color: "#f9fafb",
        margin: "0 0 1rem 0",
        lineHeight: 1.3,
    },

    cardMetaGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.65rem",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "0.85rem",
        padding: "0.75rem",
        marginBottom: "1.15rem",
    },

    cardMetaItem: {
        display: "flex",
        flexDirection: "column",
    },

    cardMetaLabel: {
        fontSize: "0.68rem",
        color: "#6b7280",
        textTransform: "uppercase",
        fontWeight: 700,
        marginBottom: "0.2rem",
    },

    cardMetaVal: {
        fontSize: "0.85rem",
        fontWeight: 600,
        color: "#d1d5db",
    },

    cardActionsFooter: {
        display: "flex",
        gap: "0.5rem",
        marginTop: "auto",
        alignItems: "center",
    },

    viewSubjectsBtn: {
        flex: 1,
        padding: "0.55rem 0.85rem",
        borderRadius: "0.65rem",
        background: "rgba(168,85,247,0.15)",
        border: "1px solid rgba(168,85,247,0.3)",
        color: "#c084fc",
        fontSize: "0.78rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s",
    },

    viewPlanBtn: {
        flex: 1,
        padding: "0.55rem 0.85rem",
        borderRadius: "0.65rem",
        background: "rgba(99,102,241,0.15)",
        border: "1px solid rgba(99,102,241,0.3)",
        color: "#818cf8",
        fontSize: "0.78rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s",
    },

    deleteIconBtn: {
        padding: "0.55rem 0.75rem",
        borderRadius: "0.65rem",
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#f87171",
        fontSize: "0.85rem",
        cursor: "pointer",
        transition: "all 0.15s",
    },

    /* Desktop Table */
    tableCard: {
        background: "#0d1120",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1.25rem",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    },

    tableEl: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.875rem",
        color: "#d1d5db",
    },

    th: {
        padding: "1rem 1.25rem",
        background: "rgba(255,255,255,0.03)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        fontSize: "0.72rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color: "#9ca3af",
        textAlign: "left",
    },

    thCenter: {
        padding: "1rem 1.25rem",
        background: "rgba(255,255,255,0.03)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        fontSize: "0.72rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color: "#9ca3af",
        textAlign: "center",
    },

    tableRow: {
        cursor: "pointer",
        transition: "background 0.15s",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
    },

    td: {
        padding: "1rem 1.25rem",
        verticalAlign: "middle",
    },

    tdCenter: {
        padding: "1rem 1.25rem",
        verticalAlign: "middle",
        textAlign: "center",
    },

    examCell: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
    },

    avatarSmall: {
        width: "34px",
        height: "34px",
        borderRadius: "0.6rem",
        background: "rgba(168,85,247,0.15)",
        border: "1px solid rgba(168,85,247,0.3)",
        color: "#c084fc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: "0.85rem",
    },

    examNameText: {
        fontWeight: 700,
        color: "#f9fafb",
        fontSize: "0.92rem",
    },

    dateChip: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.3rem 0.7rem",
        borderRadius: "0.5rem",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#d1d5db",
        fontSize: "0.75rem",
        fontWeight: 600,
    },

    scoreChip: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.3rem 0.7rem",
        borderRadius: "0.5rem",
        background: "rgba(168,85,247,0.12)",
        border: "1px solid rgba(168,85,247,0.25)",
        color: "#c084fc",
        fontSize: "0.75rem",
        fontWeight: 700,
    },

    tableNavBtn: {
        padding: "0.35rem 0.75rem",
        borderRadius: "0.5rem",
        background: "rgba(168,85,247,0.12)",
        border: "1px solid rgba(168,85,247,0.25)",
        color: "#c084fc",
        fontSize: "0.72rem",
        fontWeight: 700,
        cursor: "pointer",
    },

    tableNavBtnPlan: {
        padding: "0.35rem 0.75rem",
        borderRadius: "0.5rem",
        background: "rgba(99,102,241,0.12)",
        border: "1px solid rgba(99,102,241,0.25)",
        color: "#818cf8",
        fontSize: "0.72rem",
        fontWeight: 700,
        cursor: "pointer",
    },

    deleteBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.35rem 0.75rem",
        borderRadius: "0.5rem",
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#f87171",
        fontSize: "0.72rem",
        fontWeight: 700,
        cursor: "pointer",
    },

    emptyCard: {
        background: "#0d1120",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1.25rem",
        padding: "4rem 2rem",
        textAlign: "center",
    },

    emptyIcon: {
        fontSize: "2.5rem",
        marginBottom: "0.75rem",
    },

    emptyTitle: {
        fontSize: "1.2rem",
        fontWeight: 700,
        color: "#f9fafb",
        margin: "0 0 0.5rem 0",
    },

    emptySubtitle: {
        fontSize: "0.85rem",
        color: "#9ca3af",
        maxWidth: "400px",
        margin: "0 auto 1.5rem auto",
        lineHeight: 1.5,
    },
};

export default Exams;