import api from "./api";


// Get dashboard summary
export const getDashboardSummary = async () => {

    const token = localStorage.getItem("token");

    const response = await api.get(
        "/dashboard/summary",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};
export const getSubjectProgress = async () => {

    const token = localStorage.getItem("token");

    const response = await api.get(
        "/dashboard/subject-progress",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};