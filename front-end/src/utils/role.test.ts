import { USER_ROLES } from "@/constants/role";
import { hasRole } from "./role";

describe("hasRole", () => {
  it("returns true when user role matches allowed role", () => {
    expect(hasRole(USER_ROLES.ADMIN, USER_ROLES.ADMIN)).toBe(true);
  });

  it("returns false when user role does not match allowed role", () => {
    expect(hasRole(USER_ROLES.USER, USER_ROLES.ADMIN)).toBe(false);
  });

  it("returns false when user role is missing", () => {
    expect(hasRole(undefined, USER_ROLES.ADMIN)).toBe(false);
  });
});
