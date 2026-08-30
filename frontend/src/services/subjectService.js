import api from "./api";

export const getSubjects = async (examId) => {

    const token = localStorage.getItem("token");

    const response = await api.get(

        `/subject/${examId}`,

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    );

    return response.data;

};

export const createSubject = async (data) => {

    const token = localStorage.getItem("token");

    const response = await api.post(

        "/subject/create",

        data,

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    );

    return response.data;

};
export const updateSubject = async (subjectId, data) => {

    const token = localStorage.getItem("token");

    const response = await api.put(

        `/subject/update/${subjectId}`,

        data,

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    );

    return response.data;

};
export const deleteSubject = async (subjectId) => {

    const token = localStorage.getItem("token");

    const response = await api.delete(

        `/subject/delete/${subjectId}`,

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    );

    return response.data;

};
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