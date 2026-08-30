import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

function MainLayout({ children, studyData }) {

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
            icon: "⌂",
            type: "link",
            desc: "Overview & metrics",
        },
        {
            name: "Exams",
            path: "/exams",
            icon: "▣",
            type: "link",
            desc: "Exam management",
        },
        {
            name: "Subjects",
            path: selectedExamId ? `/subjects/${selectedExamId}` : "/exams",
            icon: "▤",
            type: "exam",
            desc: "Syllabus & hours",
        },
        {
            name: "Study Plan",
            path: selectedExamId ? `/study-plan/${selectedExamId}` : "/exams",
            icon: "▦",
            type: "exam",
            desc: "Daily timetable",
        },
        {
            name: "AI Assistant",
            path: "/ai-assistant",
            icon: "✦",
            type: "link",
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

    // Mobile navigation items (Image 2 style)
    const mobileNavItems = [
        { name: "Dashboard", path: "/dashboard", icon: "⌂" },
        { name: "Exams", path: "/exams", icon: "▣" },
        { name: "Subjects", path: selectedExamId ? `/subjects/${selectedExamId}` : "/exams", icon: "▤" },
        { name: "AI Coach", path: "/ai-assistant", icon: "✦", hasDot: true },
    ];

    return (
        <div className="min-h-screen bg-[#05070e] text-slate-100 flex selection:bg-purple-500/30">

            {/* Mobile overlay for drawer */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ================= DESKTOP SIDEBAR ================= */}
            <aside
                className={`
                    fixed md:sticky top-0
                    inset-y-0 left-0
                    z-50 md:z-30
                    w-72 h-screen
                    bg-[#0b0f19]/95 backdrop-blur-xl
                    border-r border-white/[0.08]
                    text-white
                    flex flex-col
                    shadow-2xl shadow-black/50
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                {/* Logo & Brand */}
                <div className="px-6 py-6 border-b border-white/[0.07] flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-900/50 border border-purple-400/30">
                            📚
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-white font-['Inter'] flex items-center gap-1.5">
                                Smart Study
                            </h1>
                            <p className="text-xs text-purple-400 font-semibold tracking-wide">
                                AI Powered Prep
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
                    >
                        ✕
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-300/80 mb-2">
                        Main Navigation
                    </p>

                    {menuItems.map((item) => {
                        const active = isItemActive(item);
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    group relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200
                                    ${active
                                        ? "bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white font-semibold shadow-lg shadow-purple-600/25 border border-purple-400/30"
                                        : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 border border-transparent"
                                    }
                                `}
                            >
                                <span className="w-6 text-center text-lg transition-transform group-hover:scale-110">
                                    {item.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-none text-white group-hover:text-white">
                                        {item.name}
                                    </p>
                                    <p className="text-[11px] text-slate-300/80 truncate mt-1">
                                        {item.desc}
                                    </p>
                                </div>

                                {item.badge && (
                                    <span className="text-[9px] font-extrabold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-full shadow-sm tracking-wider">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User Profile & Logout Box (Shows Logged-in Student Email) */}
                <div className="p-4 border-t border-white/[0.07] bg-black/20">
                    <div className="flex items-center gap-3 px-3.5 py-3 mb-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md border border-purple-400/30 flex-shrink-0">
                            {userInfo.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-white truncate" title={userInfo.email}>
                                {userInfo.email}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                                <span className="text-[11px] text-slate-400 font-medium truncate">Smart Learner</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all font-semibold text-xs tracking-wide cursor-pointer"
                    >
                        <span>↪</span> Log Out
                    </button>
                </div>
            </aside>

            {/* ================= MAIN CONTENT AREA ================= */}
            <div className="flex-1 min-w-0 flex flex-col min-h-screen">

                {/* STICKY GLASS HEADER */}
                <header className="h-20 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30 transition-all">
                    <div className="max-w-[1720px] mx-auto w-full h-full flex items-center justify-between px-4 sm:px-8 md:px-12 lg:px-14">
                        
                        {/* Left: Dynamic Greeting */}
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex md:hidden items-center justify-center font-bold text-sm shadow-inner">
                                {userInfo.initials}
                            </div>
                            <div>
                                <h2 className="text-lg md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                                    {greeting}, {userInfo.displayName} 👋
                                </h2>
                                <p className="text-xs md:text-sm text-slate-400 hidden sm:block">
                                    Track your preparation &amp; stay consistent with your goals.
                                </p>
                            </div>
                        </div>

                        {/* Right: AI Coach Shortcut & Notification Bell */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate("/ai-assistant")}
                                title="Open AI Study Coach"
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all shadow-lg shadow-purple-900/20 hover:scale-105"
                            >
                                <span className="text-sm">✦</span>
                                <span>AI Study Coach</span>
                            </button>

                            <button className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] flex items-center justify-center text-slate-300 transition text-base">
                                🔔
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-500 rounded-full" />
                            </button>

                            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white/[0.08]">
                                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-sm shadow-inner">
                                    {userInfo.initials}
                                </div>
                            </div>
                        </div>

                    </div>
                </header>

                {/* MAIN INNER PAGE CONTENT */}
                <main className="flex-1 px-4 sm:px-8 md:px-12 lg:px-14 py-6 md:py-10 max-w-[1720px] w-full mx-auto pb-28 md:pb-10">
                    {children}
                </main>

                {/* ================= MOBILE BOTTOM NAVIGATION BAR (Image 2 style) ================= */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f19]/95 backdrop-blur-xl border-t border-white/[0.08] px-4 py-2 flex items-center justify-around shadow-2xl shadow-black">
                    {mobileNavItems.map((item) => {
                        const active = isItemActive(item);
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={`
                                    relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200
                                    ${active
                                        ? "bg-purple-600 text-white font-bold shadow-lg shadow-purple-900/50"
                                        : "text-slate-400 hover:text-slate-200"
                                    }
                                `}
                            >
                                <span className="text-lg leading-none">{item.icon}</span>
                                <span className="text-[10px] tracking-wide font-medium">{item.name}</span>
                                {item.hasDot && !active && (
                                    <span className="absolute top-1 right-2.5 w-1.5 h-1.5 bg-purple-400 rounded-full" />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

            </div>

        </div>
    );

}

export default MainLayout;