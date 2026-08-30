import { useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    FaBookOpen,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaCheckCircle,
    FaArrowLeft
} from "react-icons/fa";

import { resetPassword } from "../../services/authService";

const OTP_LENGTH = 6;

function ResetPassword() {

    const location = useLocation();
    const navigate = useNavigate();
    const initialEmail = location.state?.email || "";

    const [email, setEmail] = useState(initialEmail);
    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const refs = useRef([]);

    const otp = digits.join("");

    const handleDigit = (index, value) => {
        const char = value.replace(/\D/, "").slice(-1);
        const next = [...digits];
        next[index] = char;
        setDigits(next);
        if (char && index < OTP_LENGTH - 1) {
            refs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            refs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowLeft"  && index > 0)              refs.current[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        const next = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((c, i) => { next[i] = c; });
        setDigits(next);
        refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length < OTP_LENGTH) {
            toast.error("Please enter the complete 6-digit OTP code");
            return;
        }
        if (!newPassword || newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }
        try {
            setLoading(true);
            const response = await resetPassword({
                email,
                otp,
                new_password: newPassword
            });
            toast.success(response?.message || "Password updated successfully!");
            setTimeout(() => {
                navigate("/");
            }, 1500);
        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                "Failed to reset password. Please check your OTP."
            );
        } finally {
            setLoading(false);
        }
    };

    /* Focus helpers */
    const onFocus = (e) => {
        e.target.style.borderColor = "#a855f7";
        e.target.style.boxShadow  = "0 0 0 3px rgba(168,85,247,0.18)";
    };
    const onBlur = (e) => {
        e.target.style.borderColor = "rgba(255,255,255,0.1)";
        e.target.style.boxShadow  = "none";
    };

    return (

        <div style={S.page} className="auth-page">

            <ToastContainer
                position="top-right"
                theme="dark"
                toastStyle={{ background: "#1a1a2e", border: "1px solid rgba(168,85,247,0.3)" }}
            />

            <div style={S.card} className="auth-card">

                {/* ═══════════════════════════════════════
                    LEFT PANEL
                ════════════════════════════════════════ */}

                <div style={S.leftPanel} className="auth-left">

                    {/* Gradient */}
                    <div style={S.grad} />

                    {/* Glow orbs */}
                    <div style={{ ...S.orb, top: "-7rem", left: "-7rem", width: "30rem", height: "30rem", background: "rgba(168,85,247,0.28)" }} />
                    <div style={{ ...S.orb, bottom: 0, right: 0, width: "24rem", height: "24rem", background: "rgba(217,70,239,0.16)" }} />

                    <div style={S.leftInner}>

                        {/* Logo */}
                        <div style={S.logoRow}>
                            <div style={S.logoBox}>
                                <FaBookOpen style={{ fontSize: "1.1rem" }} />
                            </div>
                            <div>
                                <p style={S.logoTitle}>Smart Study</p>
                                <p style={S.logoSub}>Study Smarter</p>
                            </div>
                        </div>

                        {/* Hero copy */}
                        <div style={S.heroCopy}>

                            <p style={S.eyebrow}>CREATE NEW PASSWORD</p>

                            <h2 style={S.heroH}>
                                Almost back on<br />your schedule.
                            </h2>

                            <p style={S.heroP}>
                                Enter the 6-digit verification code sent to your email along with your new password.
                            </p>

                        </div>

                        {/* Steps */}
                        <div style={S.steps}>

                            <div style={S.stepDone}>
                                <span style={S.numDone}><FaCheckCircle style={{ fontSize: "0.85rem" }} /></span>
                                <div>
                                    <p style={S.stepTitleDark}>Email submitted</p>
                                    <p style={S.stepSubDark}>Code sent to your email</p>
                                </div>
                            </div>

                            <div style={S.stepActive}>
                                <span style={S.numActive}>2</span>
                                <div>
                                    <p style={S.stepTitleLight}>Enter OTP & New Password</p>
                                    <p style={S.stepSubLight}>Set your new security credentials</p>
                                </div>
                            </div>

                            <div style={S.stepGlass}>
                                <span style={S.numGlass}>3</span>
                                <div>
                                    <p style={S.stepTitleMuted}>Login back</p>
                                    <p style={S.stepSubMuted}>Access your dashboard</p>
                                </div>
                            </div>

                        </div>

                        <p style={S.copy}>© 2026 Smart Study. Study smarter, every day.</p>

                    </div>

                </div>


                {/* ═══════════════════════════════════════
                    RIGHT PANEL
                ════════════════════════════════════════ */}

                <div style={S.rightPanel} className="auth-right">

                    <div style={S.formWrap} className="auth-form-wrap">

                        {/* Icon badge */}
                        <div style={S.iconBadge}>
                            <FaLock style={{ fontSize: "1.4rem", color: "#a855f7" }} />
                        </div>

                        {/* Heading */}
                        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                            <h2 style={S.formTitle}>Set New Password</h2>
                            <p style={S.formSub}>Enter your 6-digit code and new password.</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={S.form}>

                            {/* Email */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                <label style={S.label}>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={S.input}
                                    onFocus={onFocus}
                                    onBlur={onBlur}
                                />
                            </div>

                            {/* OTP boxes */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                <label style={S.label}>Verification Code (OTP)</label>
                                <div style={S.otpRow} onPaste={handlePaste}>
                                    {digits.map((d, i) => (
                                        <input
                                            key={i}
                                            ref={el => refs.current[i] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={d}
                                            onChange={e => handleDigit(i, e.target.value)}
                                            onKeyDown={e => handleKeyDown(i, e)}
                                            onFocus={onFocus}
                                            onBlur={onBlur}
                                            style={{
                                                ...S.otpBox,
                                                borderColor: d ? "#a855f7" : "rgba(255,255,255,0.12)",
                                                color: d ? "#fff" : "#6b7280",
                                            }}
                                            autoFocus={i === 0}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* New Password */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                <label style={S.label}>New Password</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="At least 8 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        style={{ ...S.input, paddingRight: "3rem" }}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        style={S.eyeBtn}
                                        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                                        onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...S.submitBtn,
                                    opacity: loading ? 0.55 : 1,
                                    cursor: loading ? "not-allowed" : "pointer"
                                }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#e5e7eb"; }}
                                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#ffffff"; }}
                            >
                                {loading ? "Updating Password…" : "Reset Password"}
                            </button>

                        </form>

                        {/* Footer link */}
                        <p style={S.footerText}>
                            <Link
                                to="/"
                                style={S.backBtn}
                                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                                onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}
                            >
                                <FaArrowLeft style={{ fontSize: "0.75rem", marginRight: "0.4rem" }} /> Back to Sign In
                            </Link>
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

}

/* ─────────────────────────────────────────────────────────────
   Style tokens
───────────────────────────────────────────────────────────── */
const S = {

    page: {
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    },

    card: {
        width: "100%",
        maxWidth: "72rem",
        height: "min(860px, calc(100vh - 2rem))",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderRadius: "1.75rem",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.85)",
        background: "#090909",
    },

    /* Left panel */
    leftPanel: {
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
    },

    grad: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, #9333ea 0%, #6b21a8 42%, #1a0030 75%, #000 100%)",
    },

    orb: {
        position: "absolute",
        borderRadius: "50%",
        filter: "blur(90px)",
        pointerEvents: "none",
    },

    leftInner: {
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "2.5rem",
        overflow: "hidden",
    },

    logoRow: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexShrink: 0,
    },

    logoBox: {
        width: "2.75rem",
        height: "2.75rem",
        borderRadius: "0.75rem",
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    logoTitle: { fontSize: "1.15rem", fontWeight: 700, margin: 0 },
    logoSub:   { fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginTop: "0.1rem" },

    heroCopy: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: "2rem",
        paddingBottom: "1.5rem",
    },

    eyebrow: {
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        color: "#e9d5ff",
        margin: "0 0 0.75rem 0",
    },

    heroH: {
        fontSize: "clamp(1.9rem, 2.8vw, 3rem)",
        fontWeight: 800,
        lineHeight: 1.06,
        margin: "0 0 1.2rem 0",
    },

    heroP: {
        fontSize: "1rem",
        color: "rgba(255,255,255,0.65)",
        lineHeight: 1.75,
        margin: 0,
    },

    steps: {
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        flexShrink: 0,
    },

    stepDone: {
        background: "#fff",
        borderRadius: "1rem",
        padding: "0.85rem 1rem",
        color: "#111827",
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
    },

    stepActive: {
        background: "rgba(168,85,247,0.18)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(168,85,247,0.45)",
        borderRadius: "1rem",
        padding: "0.85rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
    },

    stepGlass: {
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1rem",
        padding: "0.85rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
    },

    numDone: {
        width: "2rem", height: "2rem", borderRadius: "50%",
        background: "#22c55e", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
    },

    numActive: {
        width: "2rem", height: "2rem", borderRadius: "50%",
        background: "#a855f7", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.78rem", fontWeight: 700, flexShrink: 0,
    },

    numGlass: {
        width: "2rem", height: "2rem", borderRadius: "50%",
        background: "rgba(255,255,255,0.1)", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.78rem", fontWeight: 700, flexShrink: 0,
    },

    stepTitleDark:  { fontWeight: 600, fontSize: "0.88rem", color: "#111827", margin: 0 },
    stepSubDark:    { fontSize: "0.73rem", color: "#6b7280", marginTop: "0.1rem" },
    stepTitleLight: { fontWeight: 600, fontSize: "0.88rem", color: "#fff", margin: 0 },
    stepSubLight:   { fontSize: "0.73rem", color: "rgba(255,255,255,0.6)", marginTop: "0.1rem" },
    stepTitleMuted: { fontWeight: 600, fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", margin: 0 },
    stepSubMuted:   { fontSize: "0.73rem", color: "rgba(255,255,255,0.3)", marginTop: "0.1rem" },

    copy: {
        fontSize: "0.7rem",
        color: "rgba(255,255,255,0.28)",
        marginTop: "1.25rem",
        flexShrink: 0,
    },

    /* Right panel */
    rightPanel: {
        background: "#090909",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 2rem",
        overflow: "hidden",
    },

    formWrap: {
        width: "100%",
        maxWidth: "26rem",
    },

    iconBadge: {
        width: "4rem",
        height: "4rem",
        borderRadius: "1.2rem",
        background: "rgba(168,85,247,0.12)",
        border: "1px solid rgba(168,85,247,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 1.25rem",
        boxShadow: "0 0 30px rgba(168,85,247,0.15)",
    },

    formTitle: {
        fontSize: "1.85rem",
        fontWeight: 800,
        margin: "0 0 0.4rem 0",
        color: "#fff",
    },

    formSub: {
        color: "#6b7280",
        fontSize: "0.92rem",
        margin: 0,
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "0.9rem",
    },

    label: {
        fontSize: "0.84rem",
        fontWeight: 500,
        color: "#d1d5db",
    },

    input: {
        height: "3rem",
        width: "100%",
        padding: "0 1rem",
        borderRadius: "0.75rem",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#fff",
        fontSize: "0.9rem",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxSizing: "border-box",
        fontFamily: "inherit",
    },

    otpRow: {
        display: "flex",
        gap: "0.5rem",
        justifyContent: "center",
    },

    otpBox: {
        width: "2.8rem",
        height: "3.2rem",
        borderRadius: "0.75rem",
        background: "rgba(255,255,255,0.05)",
        border: "1.5px solid rgba(255,255,255,0.12)",
        color: "#fff",
        fontSize: "1.25rem",
        fontWeight: 700,
        textAlign: "center",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        caretColor: "#a855f7",
        fontFamily: "'Inter', monospace",
    },

    eyeBtn: {
        position: "absolute",
        right: "1rem",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        color: "#6b7280",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        padding: 0,
        fontSize: "0.9rem",
        transition: "color 0.18s",
    },

    submitBtn: {
        height: "3rem",
        borderRadius: "0.75rem",
        background: "#ffffff",
        color: "#000",
        fontWeight: 700,
        fontSize: "0.95rem",
        border: "none",
        transition: "background 0.18s",
        marginTop: "0.35rem",
        fontFamily: "inherit",
        width: "100%",
    },

    footerText: {
        textAlign: "center",
        marginTop: "1.25rem",
    },

    backBtn: {
        display: "inline-flex",
        alignItems: "center",
        color: "#6b7280",
        fontWeight: 500,
        fontSize: "0.85rem",
        textDecoration: "none",
        transition: "color 0.18s",
    },

};

export default ResetPassword;
