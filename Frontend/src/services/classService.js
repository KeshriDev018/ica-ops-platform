import api from "../lib/api";

const classService = {
  // COACH: Create a new class (batch or 1-1)
  create: async (classData) => {
    const response = await api.post("/classes", classData);
    return response.data;
  },

  // COACH: Get all classes for logged-in coach
  getMyClasses: async () => {
    const response = await api.get("/classes/coach");
    return response.data;
  },

  // STUDENT: Get all classes for logged-in student
  getMyStudentClasses: async () => {
    const response = await api.get("/classes/student");
    return response.data;
  },

  // COACH: Deactivate a class
  deactivate: async (classId) => {
    const response = await api.patch(`/classes/${classId}/deactivate`);
    return response.data;
  },
};

export default classService;
