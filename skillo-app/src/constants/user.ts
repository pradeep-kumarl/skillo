export interface UserProfile {
  name: string;
  phone: string;
  aadhaarNumber: string;
  role?: "SEEKER" | "HELPER";
  skills?: string[];
  isVerified: boolean;
  isLoggedIn: boolean;
}

export const INITIAL_USER: UserProfile = {
  name: "Pradeep Kumar",
  phone: "+91 98450 12345",
  aadhaarNumber: "555566667777",
  role: "SEEKER",
  skills: ["Mechanic (Roadside Assistance)", "Doctor / Medical Emergency"],
  isVerified: true,
  isLoggedIn: false, // Shows the Sign In & Sign Up screen!
};
