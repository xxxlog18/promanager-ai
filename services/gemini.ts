import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Task } from "../types";

// Initialize Gemini Client
// NOTE: In a real app, handle the missing key more gracefully in the UI
const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const modelId = "gemini-2.5-flash";

// 1. AI Assist: Generate Description, Tags, Priority
export const generateTaskDetails = async (title: string) => {
  if (!apiKey) throw new Error("API Key is missing");

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING, description: "A professional, concise description of the task in Thai." },
      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of relevant tags in English (1-3 tags)." },
      priority: { type: Type.STRING, enum: ["Low", "Medium", "High"], description: "The estimated priority level." },
    },
    required: ["description", "tags", "priority"],
  };

  const prompt = `บทบาท: ผู้ช่วย Project Manager มืออาชีพ. 
  งานที่ต้องทำคือ: "${title}". 
  ช่วยเขียนคำอธิบายงาน (Description) ภาษาไทย, แนะนำ Tags ภาษาอังกฤษที่เกี่ยวข้อง, และประเมินความสำคัญ (Priority).`;

  try {
    const result = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = result.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Assist Error:", error);
    throw error;
  }
};

// 2. AI Subtasks: Generate Checklist
export const generateSubtasks = async (title: string, description: string) => {
  if (!apiKey) throw new Error("API Key is missing");

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: { type: Type.STRING },
    description: "A list of actionable subtasks in Thai.",
  };

  const prompt = `งาน: "${title}". 
  รายละเอียด: "${description}". 
  สร้างรายการ Checklist ย่อย (Subtasks) ที่ต้องทำเพื่อให้งานนี้สำเร็จ จำนวน 3-5 ข้อ ภาษาไทย. ขอเฉพาะเนื้อหา ไม่ต้องมีตัวเลขนำหน้า`;

  try {
    const result = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = result.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("AI Subtasks Error:", error);
    throw error;
  }
};

// 3. Smart Insight: Dashboard Analysis
export const generateProjectInsight = async (stats: { todo: number, inProgress: number, done: number, total: number }) => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `วิเคราะห์สถานะโปรเจกต์สั้นๆ (ไม่เกิน 2 ประโยค) เป็นภาษาไทย จากข้อมูลนี้: 
  Todo: ${stats.todo}, In Progress: ${stats.inProgress}, Done: ${stats.done}, Total: ${stats.total}.
  เน้นให้คำแนะนำหรือกำลังใจทีมงานให้ active และ productive.`;

  try {
    const result = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    
    return result.text || "ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้";
  } catch (error) {
    console.error("Smart Insight Error:", error);
    return "ระบบ AI กำลังพักผ่อน กรุณาลองใหม่ภายหลัง";
  }
};
