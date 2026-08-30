import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getSubjects, deleteSubject } from "../../services/subjectService";
import SubjectModal from "../../components/SubjectModal/SubjectModal";

function Subjects() {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => { loadSubjects(); }, [examId]);

    const loadSubjects = async () => {
        try {
            const data = await getSubjects(examId);
            setSubjects(data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingSubject(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (subject) => {
        setEditingSubject(subject);
        setShowModal(true);
    };

    const handleDelete = async (subjectId) => {
        if (!window.confirm("Are you sure you want to delete this subject?")) return;
        try {
            await deleteSubject(subjectId);
            await loadSubjects();
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.detail || "Failed to delete subject");
        }
    };

    // Derived statistics
    const totalHours = subjects.reduce((sum, s) => sum + Number(s.total_hours || 0), 0);
    const hardCount = subjects.filter((s) => String(s.difficulty).toLowerCase() === "hard").length;
    const mediumCount = subjects.filter((s) => String(s.difficulty).toLowerCase() === "medium").length;
    const easyCount = subjects.filter((s) => String(s.difficulty).toLowerCase() === "easy").length;

    const filteredSubjects = subjects.filter((s) =>
        s.subject_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDifficultyBadgeStyle = (diff) => {
        const d = String(diff).toLowerCase();
        if (d === "easy") return { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", color: "#4ade80", icon: "🟢" };
        if (d === "hard") return { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", color: "#f87171", icon: "🔴" };
        return { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", color: "#fbbf24", icon: "🟡" };
    };

    if (loading) {
        return (
            <MainLayout>
                <div style={S.loadingWrap}>
                    <div style={S.spinner} />
                    <p style={{ color: "#9ca3af", marginTop: "1rem", fontWeight: 600 }}>Loading subjects…</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {/* ── Page Header ── */}
            <div style={S.pageHeader} className="app-page-header">
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                        <button
                            onClick={() => navigate("/exams")}
                            style={S.backBtn}
                            title="Back to Exams"
                        >
                            ← All Exams
                        </button>
                        <div style={S.badge}>📚 Curriculum</div>
                    </div>
                    <h1 style={S.pageTitle}>Subjects &amp; Modules</h1>
                    <p style={S.pageSubtitle}>Define difficulty levels, priority ranking, and target study hours per subject.</p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <button
                        onClick={() => navigate(`/study-plan/${examId}`)}
                        style={S.planBtn}
                    >
                        <span>▦</span>
                        <span>View Study Plan</span>
                    </button>

                    <button
                        style={S.addBtn}
                        onClick={handleOpenAddModal}
                    >
                        <span>＋</span>
                        <span>Add Subject</span>
                    </button>
                </div>
            </div>

            {/* ── Top Desktop KPI Ribbon ── */}
            <div style={S.statsGrid} className="subjects-stats-grid">
                <div style={S.statCard}>
                    <span style={S.statLabel}>Total Subjects</span>
                    <p style={{ ...S.statValue, color: "#818cf8" }}>{subjects.length}</p>
                    <span style={S.statSub}>Curriculum Modules</span>
                </div>
                <div style={S.statCard}>
                    <span style={S.statLabel}>Total Required Time</span>
                    <p style={{ ...S.statValue, color: "#c084fc" }}>{totalHours} hrs</p>
                    <span style={S.statSub}>Estimated Preparation</span>
                </div>
                <div style={S.statCard}>
                    <span style={S.statLabel}>Difficulty Distribution</span>
                    <div style={S.diffMiniRow}>
                        <span style={{ color: "#f87171", fontWeight: 700, fontSize: "0.85rem" }}>🔴 {hardCount} Hard</span>
                        <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.85rem" }}>🟡 {mediumCount} Med</span>
                        <span style={{ color: "#4ade80", fontWeight: 700, fontSize: "0.85rem" }}>🟢 {easyCount} Easy</span>
                    </div>
                </div>
            </div>

            {/* ── Filter & Search Ribbon ── */}
            <div style={S.filterRibbon}>
                <div style={S.searchWrap}>
                    <span style={{ color: "#6b7280" }}>🔍</span>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search subjects..."
                        style={S.searchInput}
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={S.countChip}>{filteredSubjects.length} Subjects</span>

                    <div style={S.viewToggleWrap}>
                        <button
                            onClick={() => setViewMode("grid")}
                            style={{
                                ...S.viewBtn,
                                background: viewMode === "grid" ? "rgba(168,85,247,0.25)" : "transparent",
                                color: viewMode === "grid" ? "#e9d5ff" : "#6b7280",
                                borderColor: viewMode === "grid" ? "rgba(168,85,247,0.4)" : "transparent",
                            }}
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
                        >
                            ☰ Table
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Empty State ── */}
            {filteredSubjects.length === 0 && (
                <div style={S.emptyCard}>
                    <div style={S.emptyIcon}>📖</div>
                    <h2 style={S.emptyTitle}>No Subjects Found</h2>
                    <p style={S.emptySubtitle}>
                        {searchQuery ? "No subjects match your search." : "Add subjects with target hours and difficulty levels to start generating your daily study plan."}
                    </p>
                    <button
                        style={S.addBtn}
                        onClick={handleOpenAddModal}
                    >
                        ＋ Add First Subject
                    </button>
                </div>
            )}

            {/* ── Desktop Cards Grid ── */}
            {filteredSubjects.length > 0 && viewMode === "grid" && (
                <div style={S.cardsGrid}>
                    {filteredSubjects.map((subject, idx) => {
                        const diffBadge = getDifficultyBadgeStyle(subject.difficulty);
                        const colors = ["#818cf8", "#c084fc", "#4ade80", "#fbbf24", "#f472b6", "#2dd4bf"];
                        const accentColor = colors[idx % colors.length];

                        return (
                            <div
                                key={subject.id}
                                style={S.subjectCard}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.borderColor = "rgba(168,85,247,0.45)";
                                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.5)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                                }}
                            >
                                <div style={S.cardTop}>
                                    <div style={{ ...S.subjectAvatar, background: `${accentColor}20`, borderColor: `${accentColor}40`, color: accentColor }}>
                                        {subject.subject_name ? subject.subject_name.charAt(0).toUpperCase() : "S"}
                                    </div>

                                    <span style={{
                                        ...S.diffChip,
                                        background: diffBadge.bg,
                                        borderColor: diffBadge.border,
                                        color: diffBadge.color,
                                    }}>
                                        {diffBadge.icon} {subject.difficulty || "Medium"}
                                    </span>
                                </div>

                                <h3 style={S.subjectCardTitle}>{subject.subject_name}</h3>

                                <div style={S.cardMetaRow}>
                                    <div style={S.metaBox}>
                                        <span style={S.metaBoxLabel}>Required Hours</span>
                                        <span style={S.metaBoxVal}>⏱ {subject.total_hours} hrs</span>
                                    </div>
                                    <div style={S.metaBox}>
                                        <span style={S.metaBoxLabel}>Priority Rank</span>
                                        <span style={{ ...S.metaBoxVal, color: "#c084fc" }}>★ Priority {subject.priority}</span>
                                    </div>
                                </div>

                                <div style={S.cardFooter}>
                                    <button
                                        onClick={() => handleOpenEditModal(subject)}
                                        style={S.editActionBtn}
                                    >
                                        ✎ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(subject.id)}
                                        style={S.deleteActionBtn}
                                    >
                                        🗑 Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Desktop Table View ── */}
            {filteredSubjects.length > 0 && viewMode === "table" && (
                <div style={S.tableCard} className="app-table-card">
                    <table style={S.tableEl}>
                        <thead>
                            <tr>
                                <th style={S.th}>Subject Name</th>
                                <th style={S.th}>Difficulty</th>
                                <th style={S.th}>Priority Rank</th>
                                <th style={S.th}>Target Hours</th>
                                <th style={S.thCenter}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredSubjects.map((subject) => {
                                const diffBadge = getDifficultyBadgeStyle(subject.difficulty);
                                return (
                                    <tr
                                        key={subject.id}
                                        style={S.tableRow}
                                    >
                                        <td style={S.td}>
                                            <div style={S.subjectCell}>
                                                <div style={S.avatarSmall}>
                                                    {subject.subject_name ? subject.subject_name.charAt(0).toUpperCase() : "S"}
                                                </div>
                                                <span style={S.subjectName}>{subject.subject_name}</span>
                                            </div>
                                        </td>

                                        <td style={S.td}>
                                            <span style={{ ...S.diffChip, background: diffBadge.bg, borderColor: diffBadge.border, color: diffBadge.color }}>
                                                {diffBadge.icon} {subject.difficulty}
                                            </span>
                                        </td>

                                        <td style={S.td}>
                                            <span style={S.priorityChip}>★ Priority {subject.priority}</span>
                                        </td>

                                        <td style={S.td}>
                                            <span style={S.hoursChip}>⏱ {subject.total_hours} hrs</span>
                                        </td>

                                        <td style={S.tdCenter}>
                                            <button
                                                style={S.editActionBtn}
                                                onClick={() => handleOpenEditModal(subject)}
                                            >
                                                ✎ Edit
                                            </button>
                                            <button
                                                style={S.deleteActionBtn}
                                                onClick={() => handleDelete(subject.id)}
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
                <SubjectModal
                    examId={examId}
                    subjectToEdit={editingSubject}
                    onClose={() => setShowModal(false)}
                    onSuccess={loadSubjects}
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

    backBtn: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#9ca3af",
        padding: "0.25rem 0.65rem",
        borderRadius: "0.5rem",
        fontSize: "0.72rem",
        fontWeight: 600,
        cursor: "pointer",
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
        boxShadow: "0 4px 15px rgba(168,85,247,0.3)",
    },

    planBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.7rem 1.25rem",
        borderRadius: "0.85rem",
        background: "rgba(99,102,241,0.15)",
        border: "1px solid rgba(99,102,241,0.35)",
        color: "#818cf8",
        fontWeight: 700,
        fontSize: "0.85rem",
        cursor: "pointer",
    },

    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1.15rem",
        marginBottom: "1.5rem",
    },

    statCard: {
        background: "#0d1120",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1.15rem",
        padding: "1.15rem 1.35rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    },

    statLabel: {
        fontSize: "0.72rem",
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontWeight: 700,
    },

    statValue: {
        fontSize: "1.65rem",
        fontWeight: 800,
        margin: "0.2rem 0",
        fontFamily: "'Inter', sans-serif",
    },

    statSub: {
        fontSize: "0.7rem",
        color: "#6b7280",
    },

    diffMiniRow: {
        display: "flex",
        gap: "0.75rem",
        marginTop: "0.5rem",
        alignItems: "center",
    },

    filterRibbon: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.25rem",
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
        width: "300px",
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
    },

    /* Cards Grid */
    cardsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "1.25rem",
    },

    subjectCard: {
        background: "#0d1120",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1.25rem",
        padding: "1.35rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
    },

    cardTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "0.85rem",
    },

    subjectAvatar: {
        width: "42px",
        height: "42px",
        borderRadius: "0.85rem",
        border: "1px solid",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: "1.1rem",
    },

    diffChip: {
        fontSize: "0.72rem",
        fontWeight: 700,
        padding: "0.25rem 0.65rem",
        borderRadius: "9999px",
        border: "1px solid",
    },

    subjectCardTitle: {
        fontSize: "1.1rem",
        fontWeight: 700,
        color: "#f9fafb",
        margin: "0 0 0.85rem 0",
    },

    cardMetaRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.65rem",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "0.85rem",
        padding: "0.75rem",
        marginBottom: "1rem",
    },

    metaBox: {
        display: "flex",
        flexDirection: "column",
    },

    metaBoxLabel: {
        fontSize: "0.68rem",
        color: "#6b7280",
        textTransform: "uppercase",
        fontWeight: 700,
        marginBottom: "0.2rem",
    },

    metaBoxVal: {
        fontSize: "0.85rem",
        fontWeight: 700,
        color: "#d1d5db",
    },

    cardFooter: {
        display: "flex",
        gap: "0.5rem",
        marginTop: "auto",
    },

    editActionBtn: {
        flex: 1,
        padding: "0.45rem 0.85rem",
        borderRadius: "0.6rem",
        background: "rgba(245,158,11,0.12)",
        border: "1px solid rgba(245,158,11,0.25)",
        color: "#fbbf24",
        fontSize: "0.75rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s",
    },

    deleteActionBtn: {
        flex: 1,
        padding: "0.45rem 0.85rem",
        borderRadius: "0.6rem",
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.25)",
        color: "#f87171",
        fontSize: "0.75rem",
        fontWeight: 700,
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
        transition: "background 0.15s",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
    },

    td: {
        padding: "0.95rem 1.25rem",
        verticalAlign: "middle",
    },

    tdCenter: {
        padding: "0.95rem 1.25rem",
        verticalAlign: "middle",
        textAlign: "center",
    },

    subjectCell: {
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

    subjectName: {
        fontWeight: 700,
        color: "#f9fafb",
        fontSize: "0.92rem",
    },

    priorityChip: {
        display: "inline-flex",
        alignItems: "center",
        padding: "0.25rem 0.65rem",
        borderRadius: "0.5rem",
        background: "rgba(168,85,247,0.1)",
        border: "1px solid rgba(168,85,247,0.25)",
        color: "#c084fc",
        fontSize: "0.75rem",
        fontWeight: 700,
    },

    hoursChip: {
        display: "inline-flex",
        alignItems: "center",
        padding: "0.25rem 0.65rem",
        borderRadius: "0.5rem",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#d1d5db",
        fontSize: "0.75rem",
        fontWeight: 600,
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

export default Subjects;