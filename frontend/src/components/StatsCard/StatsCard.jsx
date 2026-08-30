function StatsCard({ title, value, icon, color, gradient }) {
    return (
        <div
            className="
                group relative overflow-hidden
                rounded-2xl
                border border-white/10
                bg-[#111827]
                p-6
                shadow-xl
                transition-all duration-300
                hover:-translate-y-1
                hover:border-purple-500/40
                hover:shadow-purple-500/10
            "
        >
            {/* Ambient Background Glow */}
            <div
                className={`
                    absolute -right-8 -top-8
                    h-28 w-28
                    rounded-full
                    ${color}
                    opacity-15 blur-xl
                    transition-transform duration-300
                    group-hover:scale-150
                `}
            />

            <div className="relative flex items-center justify-between">
                {/* Left content */}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {title}
                    </p>

                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white font-['Inter']">
                        {value}
                    </h2>
                </div>

                {/* Icon */}
                <div
                    className={`
                        flex h-12 w-12 items-center justify-center
                        rounded-xl
                        ${gradient || "bg-gradient-to-br from-purple-600 to-indigo-600"}
                        text-xl text-white
                        shadow-lg shadow-purple-900/30
                        transition-all duration-300
                        group-hover:scale-110
                        group-hover:rotate-3
                    `}
                >
                    {icon}
                </div>
            </div>

            {/* Bottom status */}
            <div className="relative mt-5 flex items-center gap-2 border-t border-white/5 pt-3">
                <span
                    className={`
                        h-2 w-2
                        rounded-full
                        ${color}
                        animate-pulse
                    `}
                />
                <span className="text-xs font-medium text-slate-400">
                    Updated from your study data
                </span>
            </div>
        </div>
    );
}

export default StatsCard;