import api from "./api";


// ==================================================
// Get Study Plan
// ==================================================

export const getStudyPlan = async (examId) => {

    const token = localStorage.getItem("token");

    const response = await api.get(
        `/study-plan/my-plan?exam_id=${examId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


// ==================================================
// Generate Study Plan
// ==================================================

export const generateStudyPlan = async (examId) => {

    const token = localStorage.getItem("token");

    const response = await api.post(
        "/study-plan/generate",
        {
            exam_id: Number(examId)
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


// ==================================================
// Complete Study Session
// ==================================================

export const completeStudyPlan = async (planId) => {

    const token = localStorage.getItem("token");

    const response = await api.put(
        `/study-plan/complete/${planId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


// ==================================================
// Get Study Plan Summary / Progress
// ==================================================

export const getStudyPlanSummary = async (examId) => {

    const token = localStorage.getItem("token");

    const response = await api.get(
        `/study-plan/summary/${examId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};