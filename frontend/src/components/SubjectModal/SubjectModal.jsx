import { useState, useEffect } from "react";
import { createSubject, updateSubject } from "../../services/subjectService";

/* ─────────────────────────────────────────────
   Inline style dictionary  (matches StudyPlan S)
───────────────────────────────────────────── */
const M = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
    },

    card: {
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "1.25rem",
        padding: "2rem",
        width: "100%",
        maxWidth: "520px",
        color: "#f9fafb",
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
    },

    /* header */
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
        paddingBottom: "1.25rem",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
    },

    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "0.9rem",
    },

    iconBox: {
        width: "44px",
        height: "44px",
        borderRadius: "0.75rem",
        background: "rgba(168,85,247,0.12)",
        border: "1px solid rgba(168,85,247,0.3)",
        color: "#c084fc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.2rem",
        flexShrink: 0,
    },

    title: {
        fontSize: "1.25rem",
        fontWeight: 800,
        color: "#f9fafb",
        margin: 0,
        fontFamily: "'Inter', sans-serif",
    },

    subtitle: {
        fontSize: "0.78rem",
        color: "#6b7280",
        marginTop: "0.2rem",
    },

    closeBtn: {
        width: "36px",
        height: "36px",
        borderRadius: "0.6rem",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#6b7280",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "1rem",
        fontFamily: "inherit",
        transition: "background 0.15s, color 0.15s",
        flexShrink: 0,
    },

    /* form */
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1.1rem",
    },

    fieldGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
    },

    row: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
    },

    label: {
        fontSize: "0.7rem",
        fontWeight: 700,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
    },

    input: {
        background: "#1a2234",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "0.65rem",
        padding: "0.75rem 1rem",
        color: "#f9fafb",
        fontSize: "0.88rem",
        fontFamily: "'Inter', sans-serif",
        outline: "none",
        transition: "border-color 0.18s",
        width: "100%",
        boxSizing: "border-box",
    },

    select: {
        background: "#1a2234",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "0.65rem",
        padding: "0.75rem 1rem",
        color: "#f9fafb",
        fontSize: "0.88rem",
        fontFamily: "'Inter', sans-serif",
        outline: "none",
        transition: "border-color 0.18s",
        width: "100%",
        boxSizing: "border-box",
        cursor: "pointer",
        appearance: "auto",
    },

    /* footer */
    footer: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "0.75rem",
        marginTop: "1.5rem",
        paddingTop: "1.25rem",
        borderTop: "1px solid rgba(255,255,255,0.07)",
    },

    cancelBtn: {
        padding: "0.6rem 1.25rem",
        borderRadius: "0.65rem",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#9ca3af",
        fontWeight: 600,
        fontSize: "0.85rem",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "background 0.15s, color 0.15s",
    },

    submitBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.6rem 1.4rem",
        borderRadius: "0.65rem",
        background: "linear-gradient(135deg, #a855f7, #6366f1)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.85rem",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: "0 4px 15px rgba(168,85,247,0.3)",
        transition: "opacity 0.18s",
    },
};

function SubjectModal({ examId, onClose, onSuccess, subjectToEdit = null }) {

    const [subject_name, setSubjectName] = useState("");
    const [difficulty, setDifficulty]   = useState("Easy");
    const [priority, setPriority]       = useState(1);
    const [total_hours, setTotalHours] = useState("");
    const [submitting, setSubmitting]   = useState(false);

    const isEditMode = Boolean(subjectToEdit);

    useEffect(() => {
        if (subjectToEdit) {
            setSubjectName(subjectToEdit.subject_name || "");
            setDifficulty(subjectToEdit.difficulty || "Easy");
            setPriority(subjectToEdit.priority || 1);
            setTotalHours(subjectToEdit.total_hours || "");
        }
    }, [subjectToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEditMode) {
                await updateSubject(subjectToEdit.id, {
                    subject_name,
                    difficulty,
                    priority: Number(priority),
                    total_hours: Number(total_hours),
                });
            } else {
                await createSubject({
                    exam_id: Number(examId),
                    subject_name,
                    difficulty,
                    priority: Number(priority),
                    total_hours: Number(total_hours),
                });
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.detail || `Failed to ${isEditMode ? "update" : "create"} subject`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={M.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={M.card}>

                {/* Header */}
                <div style={M.header}>
                    <div style={M.headerLeft}>
                        <div style={M.iconBox}>
                            {isEditMode ? "✎" : "📚"}
                        </div>
                        <div>
                            <h2 style={M.title}>{isEditMode ? "Edit Subject" : "Add Subject"}</h2>
                            <p style={M.subtitle}>
                                {isEditMode ? "Update existing subject details and target hours" : "Define subject details & study hours"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        style={M.closeBtn}
                        onClick={onClose}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#6b7280"; }}
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={M.form}>

                    <div style={M.fieldGroup}>
                        <label style={M.label}>Subject Name</label>
                        <input
                            type="text"
                            style={M.input}
                            placeholder="e.g. Data Structures & Algorithms"
                            value={subject_name}
                            onChange={(e) => setSubjectName(e.target.value)}
                            onFocus={e => e.target.style.borderColor = "#a855f7"}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"}
                            required
                        />
                    </div>

                    <div style={M.row}>
                        <div style={M.fieldGroup}>
                            <label style={M.label}>Difficulty Level</label>
                            <select
                                style={M.select}
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                onFocus={e => e.target.style.borderColor = "#a855f7"}
                                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"}
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div style={M.fieldGroup}>
                            <label style={M.label}>Priority Score (1–5)</label>
                            <input
                                type="number"
                                style={M.input}
                                min="1"
                                max="10"
                                placeholder="e.g. 1"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                onFocus={e => e.target.style.borderColor = "#a855f7"}
                                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"}
                                required
                            />
                        </div>
                    </div>

                    <div style={M.fieldGroup}>
                        <label style={M.label}>Total Hours Required</label>
                        <input
                            type="number"
                            style={M.input}
                            min="1"
                            placeholder="e.g. 40"
                            value={total_hours}
                            onChange={(e) => setTotalHours(e.target.value)}
                            onFocus={e => e.target.style.borderColor = "#a855f7"}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"}
                            required
                        />
                    </div>

                    {/* Footer */}
                    <div style={M.footer}>
                        <button
                            type="button"
                            style={M.cancelBtn}
                            onClick={onClose}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#9ca3af"; }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{ ...M.submitBtn, opacity: submitting ? 0.6 : 1 }}
                            disabled={submitting}
                            onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = "0.85"; }}
                            onMouseLeave={e => { if (!submitting) e.currentTarget.style.opacity = "1"; }}
                        >
                            {isEditMode ? "✎" : "＋"} {submitting ? "Saving…" : isEditMode ? "Update Subject" : "Save Subject"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SubjectModal;