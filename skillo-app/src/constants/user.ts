export interface UserProfile {
  name: string;
  email?: string;
  phone: string;
  aadhaarNumber: string;
  role?: "SEEKER" | "HELPER";
  skills?: string[];
  customSkillDescription?: string;
  isVerified: boolean;
  isLoggedIn: boolean;
}

export const INITIAL_USER: UserProfile = {
  name: "Pradeep Kumar",
  email: "pradeep@skillo.in",
  phone: "+91 98450 12345",
  aadhaarNumber: "555566667777",
  role: "SEEKER",
  skills: ["Mechanic (Roadside Assistance)", "Doctor / Medical Emergency"],
  customSkillDescription: "",
  isVerified: true,
  isLoggedIn: false, // Shows the Sign In & Sign Up screen!
};

