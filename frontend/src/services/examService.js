import api from "./api";

export const getExams = async () => {

    const response = await api.get("/exam/my-exams");

    return response.data;

};

export const createExam = async (data) => {

    const response = await api.post(
        "/exam/create",
        data
    );

    return response.data;

};

export const deleteExam = async (id) => {

    const response = await api.delete(
        `/exam/delete/${id}`
    );

    return response.data;

};
