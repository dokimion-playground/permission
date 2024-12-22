export type User = { id: string; roles: Role[] };

export type Role = keyof typeof ROLES;
type Permission = (typeof ROLES)[Role][number];

const ROLES = {
  admin: [
    "view:comments",
    "create:comments",
    "update:comments",
    "delete:comments",
  ],
  moderator: ["view:comments", "create:comments", "delete:comments"],
  user: ["view:comments", "create:comments", "delete:ownComments"],
} as const;

export function hasPermission(user: User, permission: Permission) {
  return user.roles.some((role) => {
    return (ROLES[role] as readonly Permission[])?.includes(permission);
  });
}
