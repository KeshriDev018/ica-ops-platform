import api from "../lib/api";

const classMaterialService = {
  // Coach: Get all materials
  getCoachMaterials: async () => {
    const response = await api.get("/classes/coach/materials");
    return response.data;
  },

  // Coach: Upload material
  uploadMaterial: async (classId, formData) => {
    const response = await api.post(`/classes/${classId}/materials`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Student: Get all materials
  getStudentMaterials: async () => {
    const response = await api.get("/classes/student/materials");
    return response.data;
  },
};

export default classMaterialService;
