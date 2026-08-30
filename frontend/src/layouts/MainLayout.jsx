import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

function MainLayout({ children }) {

    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const selectedExamId = localStorage.getItem("selectedExamId");

    // Dynamic user info from localStorage or JWT token
    const [userInfo, setUserInfo] = useState({
        email: "student@smartstudy.edu",
        displayName: "Student",
        initials: "US"
    });

    useEffect(() => {
        let email = localStorage.getItem("userEmail") || "";
        if (!email) {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const base64Url = token.split(".")[1];
                    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                    const jsonPayload = decodeURIComponent(
                        atob(base64)
                            .split("")
                            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                            .join("")
                    );
                    const payload = JSON.parse(jsonPayload);
                    if (payload.sub) email = payload.sub;
                }
            } catch (e) {
                console.error("Error decoding token:", e);
            }
        }

        if (email) {
            const rawName = email.split("@")[0];
            const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            const initials = email.length >= 2
                ? (email[0] + email[1]).toUpperCase()
                : "US";

            setUserInfo({
                email,
                displayName: cleanName,
                initials
            });
        }
    }, []);

    // Dynamic greeting based on current time
    const [greeting, setGreeting] = useState("Welcome back");
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("selectedExamId");
        navigate("/");
    };

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: "⊞",
            desc: "Overview & metrics",
        },
        {
            name: "Exams",
            path: "/exams",
            icon: "📄",
            desc: "Exam management",
        },
        {
            name: "Subjects",
            path: selectedExamId ? `/subjects/${selectedExamId}` : "/exams",
            icon: "📖",
            desc: "Syllabus & hours",
        },
        {
            name: "Study Plan",
            path: selectedExamId ? `/study-plan/${selectedExamId}` : "/exams",
            icon: "📅",
            desc: "Daily timetable",
        },
        {
            name: "AI Assistant",
            path: "/ai-assistant",
            icon: "✦",
            badge: "NEW",
            desc: "Smart study coach",
        },
    ];

    const isItemActive = (item) => {
        const currentPath = location.pathname;
        if (item.name === "Dashboard") return currentPath === "/dashboard";
        if (item.name === "Exams") return currentPath === "/exams";
        if (item.name === "Subjects") return currentPath.startsWith("/subjects");
        if (item.name === "Study Plan") return currentPath.startsWith("/study-plan");
        if (item.name === "AI Assistant") return currentPath.startsWith("/ai-assistant");
        return currentPath === item.path;
    };

    // Mobile bottom navigation items (Image 2 style)
    const mobileNavItems = [
        { name: "Dashboard", path: "/dashboard", icon: "⊞" },
        { name: "Exams", path: "/exams", icon: "📄" },
        { name: "Subjects", path: selectedExamId ? `/subjects/${selectedExamId}` : "/exams", icon: "📖" },
        { name: "AI Coach", path: "/ai-assistant", icon: "✦", hasDot: true },
    ];

    return (
        <div style={styles.appWrapper}>

            {/* Mobile Drawer Overlay */}
            {sidebarOpen && (
                <div
                    style={styles.mobileOverlay}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ================= DESKTOP SIDEBAR ================= */}
            <aside
                style={{
                    ...styles.sidebar,
                    transform: sidebarOpen ? "translateX(0)" : undefined,
                }}
                className={`app-sidebar ${sidebarOpen ? "open" : ""}`}
            >
                {/* Logo & Brand Header */}
                <div style={styles.brandHeader}>
                    <div style={styles.brandLogoRow}>
                        <div style={styles.brandLogoBadge}>
                            {userInfo.initials}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <h1 style={styles.brandTitle}>Smart Study</h1>
                            <p style={styles.brandSubtitle}>AI Powered Prep</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        style={styles.mobileCloseBtn}
                        className="md-hide"
                    >
                        ✕
                    </button>
                </div>

                {/* Section Title */}
                <div style={styles.navSectionLabel}>
                    MAIN NAVIGATION
                </div>

                {/* Navigation Links */}
                <nav style={styles.navContainer}>
                    {menuItems.map((item) => {
                        const active = isItemActive(item);
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    ...styles.navItem,
                                    background: active
                                        ? "linear-gradient(135deg, rgba(124, 58, 237, 0.9), rgba(99, 102, 241, 0.9))"
                                        : "transparent",
                                    border: active
                                        ? "1px solid rgba(168, 85, 247, 0.4)"
                                        : "1px solid transparent",
                                    boxShadow: active
                                        ? "0 4px 15px rgba(124, 58, 237, 0.35)"
                                        : "none",
                                }}
                                className="nav-item-link"
                            >
                                <span style={{
                                    ...styles.navIcon,
                                    color: active ? "#ffffff" : "#9ca3af",
                                }}>
                                    {item.icon}
                                </span>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        ...styles.navItemTitle,
                                        color: active ? "#ffffff" : "#d1d5db",
                                        fontWeight: active ? 700 : 500,
                                    }}>
                                        {item.name}
                                    </p>
                                    <p style={{
                                        ...styles.navItemDesc,
                                        color: active ? "rgba(255,255,255,0.75)" : "#6b7280",
                                    }}>
                                        {item.desc}
                                    </p>
                                </div>

                                {item.badge && (
                                    <span style={styles.badgePill}>
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User Profile & Logout Box */}
                <div style={styles.sidebarFooter}>
                    <div style={styles.profileCard}>
                        <div style={styles.profileAvatar}>
                            {userInfo.initials}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={styles.profileName} title={userInfo.email}>
                                {userInfo.email}
                            </p>
                            <div style={styles.statusRow}>
                                <span style={styles.statusDot} />
                                <span style={styles.statusText}>Smart Learner</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={styles.logoutBtn}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#ffffff";
                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.18)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#f87171";
                            e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <span>↪</span> Log Out
                    </button>
                </div>
            </aside>

            {/* ================= MAIN DESKTOP CONTENT AREA ================= */}
            <div style={styles.mainWrapper}>

                {/* STICKY GLASS HEADER */}
                <header style={styles.topHeader}>
                    <div style={styles.topHeaderInner}>
                        
                        {/* Left: Mobile hamburger + Dynamic Greeting */}
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <button
                                onClick={() => setSidebarOpen(true)}
                                style={styles.mobileHamburgerBtn}
                                className="mobile-only-btn"
                            >
                                ☰
                            </button>
                            <div>
                                <h2 style={styles.greetingTitle}>
                                    {greeting}, {userInfo.displayName} 👋
                                </h2>
                                <p style={styles.greetingSubtitle} className="desktop-only-text">
                                    Track your preparation &amp; stay consistent with your goals.
                                </p>
                            </div>
                        </div>

                        {/* Right: AI Coach Shortcut, Notification Bell & Avatar */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                            <button
                                onClick={() => navigate("/ai-assistant")}
                                title="Open AI Study Coach"
                                style={styles.aiCoachHeaderBtn}
                            >
                                <span style={{ fontSize: "0.95rem" }}>✦</span>
                                <span>AI Study Coach</span>
                            </button>

                            <button style={styles.iconBtn}>
                                <span style={{ fontSize: "1rem" }}>🔔</span>
                            </button>

                            <div style={styles.headerAvatar} className="desktop-only-avatar">
                                {userInfo.initials}
                            </div>
                        </div>

                    </div>
                </header>

                {/* MAIN INNER PAGE CONTENT */}
                <main style={styles.mainContentContainer}>
                    {children}
                </main>

                {/* ================= MOBILE BOTTOM NAVIGATION BAR (Image 2 style) ================= */}
                <nav style={styles.mobileBottomNav} className="mobile-bottom-nav">
                    {mobileNavItems.map((item) => {
                        const active = isItemActive(item);
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                style={{
                                    ...styles.mobileNavItem,
                                    background: active ? "#7c3aed" : "transparent",
                                    color: active ? "#ffffff" : "#9ca3af",
                                    fontWeight: active ? 700 : 500,
                                    boxShadow: active ? "0 2px 10px rgba(124, 58, 237, 0.5)" : "none",
                                }}
                            >
                                <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{item.icon}</span>
                                <span style={{ fontSize: "0.68rem", marginTop: "2px" }}>{item.name}</span>
                                {item.hasDot && !active && (
                                    <span style={styles.notificationDot} />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

            </div>

        </div>
    );

}

/* ─────────────────────────────────────────────────────────────
   Style tokens with exact padding, spacing, and modern dark aesthetics
   ───────────────────────────────────────────────────────────── */
const styles = {
    appWrapper: {
        minHeight: "100vh",
        background: "#080c14",
        color: "#f3f4f6",
        display: "flex",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },

    mobileOverlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 50,
    },

    /* Sidebar */
    sidebar: {
        width: "270px",
        minWidth: "270px",
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "#0d1220",
        borderRight: "1px solid rgba(255, 255, 255, 0.07)",
        display: "flex",
        flexDirection: "column",
        padding: "1.25rem 0.85rem",
        zIndex: 40,
        boxSizing: "border-box",
    },

    brandHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.5rem 0.6rem 1.25rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        marginBottom: "1rem",
    },

    brandLogoRow: {
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
    },

    brandLogoBadge: {
        width: "40px",
        height: "40px",
        borderRadius: "0.75rem",
        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
        border: "1px solid rgba(168, 85, 247, 0.4)",
        color: "#ffffff",
        fontWeight: 800,
        fontSize: "0.95rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 15px rgba(124, 58, 237, 0.35)",
        flexShrink: 0,
    },

    brandTitle: {
        fontSize: "1.1rem",
        fontWeight: 800,
        color: "#ffffff",
        margin: 0,
        lineHeight: 1.2,
        letterSpacing: "-0.01em",
    },

    brandSubtitle: {
        fontSize: "0.72rem",
        color: "#a78bfa",
        fontWeight: 600,
        margin: "0.15rem 0 0",
        letterSpacing: "0.02em",
    },

    mobileCloseBtn: {
        background: "transparent",
        border: "none",
        color: "#9ca3af",
        fontSize: "1.2rem",
        cursor: "pointer",
        padding: "0.25rem",
    },

    navSectionLabel: {
        fontSize: "0.65rem",
        fontWeight: 800,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        padding: "0 0.75rem 0.5rem",
    },

    navContainer: {
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
    },

    navItem: {
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
        padding: "0.75rem 0.95rem",
        borderRadius: "0.85rem",
        textDecoration: "none",
        transition: "all 0.18s ease",
        boxSizing: "border-box",
    },

    navIcon: {
        fontSize: "1.15rem",
        width: "22px",
        textAlign: "center",
        flexShrink: 0,
    },

    navItemTitle: {
        fontSize: "0.88rem",
        margin: 0,
        lineHeight: 1.2,
    },

    navItemDesc: {
        fontSize: "0.7rem",
        margin: "0.2rem 0 0",
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    badgePill: {
        fontSize: "0.62rem",
        fontWeight: 800,
        background: "linear-gradient(135deg, #a855f7, #6366f1)",
        color: "#ffffff",
        padding: "0.15rem 0.45rem",
        borderRadius: "9999px",
        letterSpacing: "0.06em",
    },

    /* Sidebar Bottom User Card */
    sidebarFooter: {
        paddingTop: "0.85rem",
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        marginTop: "auto",
    },

    profileCard: {
        background: "#111827",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "0.95rem",
        padding: "0.75rem 0.85rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        marginBottom: "0.65rem",
    },

    profileAvatar: {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
        border: "1px solid rgba(168, 85, 247, 0.4)",
        color: "#ffffff",
        fontWeight: 800,
        fontSize: "0.85rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    profileName: {
        fontSize: "0.82rem",
        fontWeight: 700,
        color: "#ffffff",
        margin: 0,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    statusRow: {
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
        marginTop: "0.15rem",
    },

    statusDot: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#22c55e",
        boxShadow: "0 0 6px #22c55e",
        flexShrink: 0,
    },

    statusText: {
        fontSize: "0.7rem",
        color: "#9ca3af",
        fontWeight: 500,
    },

    logoutBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.45rem",
        padding: "0.55rem 0.85rem",
        borderRadius: "0.75rem",
        background: "transparent",
        border: "none",
        color: "#f87171",
        fontSize: "0.78rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s ease",
    },

    /* Main Container */
    mainWrapper: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#080c14",
    },

    topHeader: {
        height: "72px",
        background: "rgba(13, 18, 32, 0.8)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        position: "sticky",
        top: 0,
        zIndex: 30,
    },

    topHeaderInner: {
        maxWidth: "1600px",
        margin: "0 auto",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
    },

    mobileHamburgerBtn: {
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "0.6rem",
        color: "#ffffff",
        fontSize: "1.2rem",
        width: "36px",
        height: "36px",
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    },

    greetingTitle: {
        fontSize: "1.3rem",
        fontWeight: 800,
        color: "#ffffff",
        margin: 0,
        lineHeight: 1.2,
        letterSpacing: "-0.01em",
    },

    greetingSubtitle: {
        fontSize: "0.78rem",
        color: "#9ca3af",
        margin: "0.2rem 0 0",
    },

    aiCoachHeaderBtn: {
        display: "flex",
        alignItems: "center",
        gap: "0.45rem",
        padding: "0.5rem 0.95rem",
        borderRadius: "9999px",
        background: "linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(99, 102, 241, 0.25))",
        border: "1px solid rgba(168, 85, 247, 0.4)",
        color: "#c084fc",
        fontSize: "0.78rem",
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "0 2px 10px rgba(124, 58, 237, 0.2)",
    },

    iconBtn: {
        width: "38px",
        height: "38px",
        borderRadius: "0.75rem",
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        color: "#d1d5db",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    },

    headerAvatar: {
        width: "38px",
        height: "38px",
        borderRadius: "0.75rem",
        background: "rgba(124, 58, 237, 0.2)",
        border: "1px solid rgba(168, 85, 247, 0.35)",
        color: "#c084fc",
        fontWeight: 800,
        fontSize: "0.85rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    mainContentContainer: {
        flex: 1,
        padding: "1.75rem 2rem 3rem",
        maxWidth: "1600px",
        width: "100%",
        margin: "0 auto",
        boxSizing: "border-box",
    },

    /* Mobile Bottom Nav */
    mobileBottomNav: {
        display: "none",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: "rgba(13, 18, 32, 0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 0.5rem",
        zIndex: 40,
    },

    mobileNavItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.45rem 1rem",
        borderRadius: "0.85rem",
        textDecoration: "none",
        position: "relative",
        transition: "all 0.15s ease",
    },

    notificationDot: {
        position: "absolute",
        top: "6px",
        right: "16px",
        width: "5px",
        height: "5px",
        borderRadius: "50%",
        background: "#a855f7",
    },
};

export default MainLayout;