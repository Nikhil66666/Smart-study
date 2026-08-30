import React from "react";

function DashboardCard({ title, value, color }) {
    return (
        <div
            className={`rounded-xl shadow-md p-5 text-white ${color}`}
        >
            <h3 className="text-lg">{title}</h3>

            <p className="text-3xl font-bold mt-3">
                {value}
            </p>
        </div>
    );
}

export default DashboardCard;