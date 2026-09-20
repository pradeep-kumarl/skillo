import { Platform } from "react-native";

// Live AWS API Gateway Serverless Endpoint
export const API_URL = "https://e7xzlm0y48.execute-api.us-east-1.amazonaws.com/Prod";

export const SKILL_CATEGORIES = [
  {
    id: "doctor",
    name: "Doctor / Medical Emergency",
    icon: "🩺",
    tag: "Life Safety",
    description: "Accident response, CPR, triage, immediate first-aid",
    color: "#e63946",
  },
  {
    id: "mechanic",
    name: "Mechanic (Roadside Assistance)",
    icon: "🔧",
    tag: "Roadside",
    description: "Puncture, flat tyre, jump-start, towing, mechanical breakdown",
    color: "#f4a261",
  },
  {
    id: "manual",
    name: "Quick Manual Help (1-hour)",
    icon: "⏱️",
    tag: "On-Demand Labor",
    description: "Short-duration lifting, shifting, loading, urgent physical task",
    color: "#2a9d8f",
  },
  {
    id: "electrician",
    name: "Electrician",
    icon: "⚡",
    tag: "Emergency Repair",
    description: "Power failure, sparking, short circuit, generator fix",
    color: "#e76f51",
  },
  {
    id: "plumber",
    name: "Plumber",
    icon: "🚰",
    tag: "Emergency Repair",
    description: "Pipe burst, valve leak, water crisis fix",
    color: "#457b9d",
  },
  {
    id: "other",
    name: "Other Skills / Custom Help",
    icon: "✨",
    tag: "Custom",
    description: "Carpentry, appliance fix, tailoring, or any local assistance",
    color: "#a371f7",
  },
];
