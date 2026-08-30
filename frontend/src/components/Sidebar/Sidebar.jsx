import { NavLink, useNavigate } from "react-router-dom";

import {
    FaHome,
    FaBook,
    FaClipboardList,
    FaCalendarAlt,
    FaUser,
    FaRobot,
    FaSignOutAlt
} from "react-icons/fa";


function Sidebar() {

    const navigate = useNavigate();

    const menu = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: <FaHome />
        },
        {
            name: "Exams",
            path: "/exams",
            icon: <FaClipboardList />
        },
        {
            name: "Subjects",
            path: "/subjects",
            icon: <FaBook />
        }
    ];


    const handleStudyPlan = () => {

        const examId = localStorage.getItem("selectedExamId");

        if (!examId) {

            alert("Please select an exam first.");

            navigate("/exams");

            return;

        }

        navigate(`/study-plan/${examId}`);

    };


    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("selectedExamId");

        navigate("/");

    };


    return (

        <aside className="w-72 min-h-screen bg-slate-900 text-white shadow-xl">

            <div className="p-8">

                <h1 className="text-2xl font-bold">

                    📚 Smart Study

                </h1>

                <p className="text-gray-400 text-sm mt-1">

                    Study Smarter

                </p>

            </div>


            <nav className="px-4">

                {menu.map((item) => (

                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 p-4 rounded-xl mb-3 transition-all
                            ${
                                isActive
                                    ? "bg-blue-600"
                                    : "hover:bg-slate-800"
                            }`
                        }
                    >

                        <span className="text-xl">

                            {item.icon}

                        </span>

                        {item.name}

                    </NavLink>

                ))}


                <button

                    onClick={handleStudyPlan}

                    className="w-full flex items-center gap-4 p-4 rounded-xl mb-3 hover:bg-slate-800 transition-all text-left"

                >

                    <span className="text-xl">

                        <FaCalendarAlt />

                    </span>

                    Study Plan

                </button>


                <NavLink

                    to="/ai"

                    className={({ isActive }) =>
                        `flex items-center gap-4 p-4 rounded-xl mb-3 transition-all
                        ${
                            isActive
                                ? "bg-blue-600"
                                : "hover:bg-slate-800"
                        }`
                    }

                >

                    <span className="text-xl">

                        <FaRobot />

                    </span>

                    AI Assistant

                </NavLink>


                <NavLink

                    to="/profile"

                    className={({ isActive }) =>
                        `flex items-center gap-4 p-4 rounded-xl mb-3 transition-all
                        ${
                            isActive
                                ? "bg-blue-600"
                                : "hover:bg-slate-800"
                        }`
                    }

                >

                    <span className="text-xl">

                        <FaUser />

                    </span>

                    Profile

                </NavLink>

            </nav>


            <div className="absolute bottom-6 left-4 right-4">

                <button

                    onClick={handleLogout}

                    className="w-full bg-red-500 hover:bg-red-600 rounded-xl p-3 flex justify-center items-center gap-3"

                >

                    <FaSignOutAlt />

                    Logout

                </button>

            </div>

        </aside>

    );

}


export default Sidebar;