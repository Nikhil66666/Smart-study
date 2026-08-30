import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

function MainLayout({ children, studyData }) {

    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const selectedExamId = localStorage.getItem("selectedExamId");

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

    return (
        <div className="min-h-screen bg-[#05070e] text-slate-100 flex selection:bg-purple-500/30">

            {/* Mobile overlay */}
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

                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `
                                group relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200
                                ${isActive
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
                    ))}
                </nav>

                {/* User Profile & Logout Box */}
                <div className="p-4 border-t border-white/[0.07] bg-black/20">
                    <div className="flex items-center gap-3 px-3.5 py-3 mb-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md border border-purple-400/30">
                            US
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-white truncate">Student User</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[11px] text-slate-400 font-medium">Smart Learner</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all font-semibold text-xs tracking-wide"
                    >
                        <span>↪</span> Log Out
                    </button>
                </div>
            </aside>

            {/* ================= MAIN DESKTOP CONTENT AREA ================= */}
            <div className="flex-1 min-w-0 flex flex-col min-h-screen">

                {/* STICKY GLASS HEADER */}
                <header className="h-20 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30 transition-all">
                    <div className="max-w-[1720px] mx-auto w-full h-full flex items-center justify-between px-6 sm:px-10 md:px-12 lg:px-14">
                        
                        {/* Left: Mobile hamburger + Dynamic Greeting */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/10 text-white flex items-center justify-center text-xl transition"
                            >
                                ☰
                            </button>
                            <div>
                                <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                                    {greeting}, Student 👋
                                </h2>
                                <p className="text-xs md:text-sm text-slate-400 hidden sm:block">
                                    Track your preparation &amp; stay consistent with your goals.
                                </p>
                            </div>
                        </div>

                        {/* Right: Quick actions, AI Coach Shortcut & Live Profile Pill */}
                        <div className="flex items-center gap-3.5">
                            {/* AI Assistant shortcut */}
                            <button
                                onClick={() => navigate("/ai-assistant")}
                                title="Open AI Study Coach"
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all shadow-lg shadow-purple-900/20 hover:scale-105"
                            >
                                <span className="text-sm">🤖</span>
                                <span className="hidden sm:inline">AI Study Coach</span>
                            </button>

                            {/* Notifications / Target Alert */}
                            <button className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] flex items-center justify-center text-slate-300 transition text-base">
                                🔔
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-500 rounded-full" />
                            </button>

                            {/* User Avatar */}
                            <div className="hidden sm:flex items-center gap-3 pl-3.5 border-l border-white/[0.08]">
                                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-sm shadow-inner">
                                    US
                                </div>
                            </div>
                        </div>

                    </div>
                </header>

                {/* MAIN INNER PAGE CONTENT (Desktop Optimized Container) */}
                <main className="flex-1 px-6 sm:px-10 md:px-12 lg:px-14 py-8 md:py-10 max-w-[1720px] w-full mx-auto">
                    {children}
                </main>

                {/* FLOATING AI ASSISTANT ACTION BUTTON */}
                <button
                    onClick={() => navigate("/ai-assistant")}
                    className="fixed bottom-7 right-7 w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 shadow-2xl shadow-purple-600/50 border border-purple-400/40 flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all z-30 group"
                    title="Launch AI Study Coach"
                >
                    <span className="group-hover:rotate-12 transition-transform">🤖</span>
                </button>
            </div>

        </div>
    );

}

export default MainLayout;