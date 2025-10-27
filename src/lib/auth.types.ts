import type { User as FirebaseUser } from "firebase/auth";

export interface AdminUser {
  username: string;
  email: string | null;
  name: string;
  uid: string;
}

export type { FirebaseUser };