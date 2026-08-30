import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    FaEye,
    FaEyeSlash,
    FaBookOpen,
    FaLock,
    FaShieldAlt,
    FaBolt
} from "react-icons/fa";

import { loginUser } from "../../services/authService";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            const response = await loginUser({ email, password });

            localStorage.setItem("token", response.access_token);
            localStorage.setItem("userEmail", email);

            toast.success("Login Successful");

            setTimeout(() => { navigate("/dashboard"); }, 1200);

        } catch (error) {

            toast.error(error.response?.data?.detail || "Login Failed");

        } finally {

            setLoading(false);

        }

    };

    /* ─── Focus helpers ───────────────────────────────── */
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

                            <p style={S.eyebrow}>WELCOME BACK</p>

                            <h2 style={S.heroH}>
                                Pick up where<br />you left off.
                            </h2>

                            <p style={S.heroP}>
                                Your personalized study plans, exam schedules
                                and progress are waiting for you.
                            </p>

                        </div>

                        {/* Feature pills */}
                        <div style={S.pills}>

                            <div style={S.pill}>
                                <div style={S.pillIcon}>
                                    <FaShieldAlt style={{ fontSize: "0.85rem", color: "#a855f7" }} />
                                </div>
                                <div>
                                    <p style={S.pillTitle}>Secure Login</p>
                                    <p style={S.pillSub}>Your data is always protected</p>
                                </div>
                            </div>

                            <div style={S.pill}>
                                <div style={S.pillIcon}>
                                    <FaBolt style={{ fontSize: "0.85rem", color: "#f59e0b" }} />
                                </div>
                                <div>
                                    <p style={S.pillTitle}>Instant Access</p>
                                    <p style={S.pillSub}>Jump right back into your plan</p>
                                </div>
                            </div>

                            <div style={S.pill}>
                                <div style={S.pillIcon}>
                                    <FaLock style={{ fontSize: "0.85rem", color: "#22c55e" }} />
                                </div>
                                <div>
                                    <p style={S.pillTitle}>Stay on Track</p>
                                    <p style={S.pillSub}>Never lose your study progress</p>
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

                        {/* Heading */}
                        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                            <h2 style={S.formTitle}>Welcome back</h2>
                            <p style={S.formSub}>Sign in to continue your study journey.</p>
                        </div>



                        {/* Form */}
                        <form onSubmit={handleLogin} style={S.form}>

                            {/* Email */}
                            <Field label="Email Address">
                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={S.input}
                                    onFocus={onFocus}
                                    onBlur={onBlur}
                                />
                            </Field>

                            {/* Password */}
                            <Field label="Password">
                                <div style={{ position: "relative" }}>
                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                            </Field>

                            {/* Forgot password */}
                            <div style={{ textAlign: "right", marginTop: "-0.5rem" }}>
                                <Link
                                    to="/forgot-password"
                                    style={S.forgotLink}
                                    onMouseEnter={e => e.currentTarget.style.color = "#d8b4fe"}
                                    onMouseLeave={e => e.currentTarget.style.color = "#a855f7"}
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <button
                                id="login-submit"
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
                                {loading ? "Signing in…" : "Sign In"}
                            </button>

                        </form>

                        {/* Register link */}
                        <p style={S.footerText}>
                            Don&apos;t have an account?{" "}
                            <Link
                                to="/register"
                                style={S.footerLink}
                                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                            >
                                Create Account
                            </Link>
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

}

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */

function Field({ label, children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={S.label}>{label}</label>
            {children}
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

    /* ── Left panel ── */
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
        overflowY: "auto",
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

    logoSub: { fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginTop: "0.1rem" },

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

    /* ── Feature pills ── */
    pills: {
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        flexShrink: 0,
    },

    pill: {
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1rem",
        padding: "0.85rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
    },

    pillIcon: {
        width: "2.2rem",
        height: "2.2rem",
        borderRadius: "0.6rem",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    pillTitle: { fontWeight: 600, fontSize: "0.88rem", color: "#fff", margin: 0 },

    pillSub: { fontSize: "0.73rem", color: "rgba(255,255,255,0.45)", marginTop: "0.1rem" },

    copy: {
        fontSize: "0.7rem",
        color: "rgba(255,255,255,0.28)",
        marginTop: "1.25rem",
        flexShrink: 0,
    },

    /* ── Right panel ── */
    rightPanel: {
        background: "#090909",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 2rem",
        overflowY: "auto",
    },

    formWrap: {
        width: "100%",
        maxWidth: "26rem",
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

    socialGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.75rem",
        marginBottom: "1.25rem",
    },

    socialBtn: {
        height: "3rem",
        borderRadius: "0.75rem",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.6rem",
        fontSize: "0.875rem",
        fontWeight: 500,
        transition: "background 0.18s",
        fontFamily: "inherit",
    },

    divRow: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        marginBottom: "1.25rem",
    },

    divLine: { flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" },

    divText: {
        fontSize: "0.68rem",
        color: "#4b5563",
        letterSpacing: "0.08em",
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1.1rem",
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

    forgotLink: {
        fontSize: "0.82rem",
        color: "#a855f7",
        textDecoration: "none",
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
        marginTop: "0.25rem",
        fontFamily: "inherit",
        width: "100%",
    },

    footerText: {
        textAlign: "center",
        fontSize: "0.84rem",
        color: "#6b7280",
        marginTop: "1.5rem",
    },

    footerLink: {
        color: "#fff",
        fontWeight: 600,
        textDecoration: "none",
        transition: "text-decoration 0.15s",
        marginLeft: "0.25rem",
    },

};

export default Login;