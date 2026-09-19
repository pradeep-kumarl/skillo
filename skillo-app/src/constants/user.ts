export interface UserProfile {
  name: string;
  phone: string;
  aadhaarNumber: string;
  isVerified: boolean;
}

export const INITIAL_USER: UserProfile = {
  name: "Pradeep Kumar",
  phone: "+91 98450 12345",
  aadhaarNumber: "555566667777",
  isVerified: true,
};
