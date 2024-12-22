import { Role } from "@/constants/rbac";

export {};

declare global {
  interface CustomJwtSessionClaims {
    roles: Role[];
  }
}
