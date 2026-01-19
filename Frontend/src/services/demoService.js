import api from "../lib/api";
import { mockDemos } from "./mockData";

let demos = [...mockDemos];

const demoService = {
  getAll: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return demos;
  },

  getById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const demo = demos.find((d) => d.demo_id === id);
    if (!demo) throw new Error("Demo not found");
    return demo;
  },

  create: async (data) => {
    const response = await api.post("/demos", data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const demo = demos.find((d) => d.demo_id === id);
    if (!demo) throw new Error("Demo not found");
    demo.status = status;
    return demo;
  },

  updateOutcome: async (id, outcome) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const demo = demos.find((d) => d.demo_id === id);
    if (!demo) throw new Error("Demo not found");
    Object.assign(demo, outcome);
    return demo;
  },
};

export default demoService;
