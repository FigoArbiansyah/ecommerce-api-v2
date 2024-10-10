import { User } from "./types";

declare global {
  namespace Express {
    interface Request {
      user?: any; // Ganti User dengan tipe yang sesuai
    }
  }
}
