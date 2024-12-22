import { Role, Todo, User, Comment } from "../data/types";

interface Permissions {
  viewTodo: (todo: Todo) => boolean;
  createTodo: () => boolean;
  updateTodo: (todo: Todo) => boolean;
  deleteTodo: (todo: Todo) => boolean;
  viewComment: (comment: Comment) => boolean;
  createComment: () => boolean;
  updateComment: (comment: Comment) => boolean;
}

type PermissionsFactoryMap = {
  [key in Role]: (user: User) => Permissions;
};

const permissionsFactoryMap: PermissionsFactoryMap = {
  admin: () => ({
    viewTodo: () => true,
    createTodo: () => true,
    updateTodo: () => true,
    deleteTodo: () => true,
    viewComment: () => true,
    createComment: () => true,
    updateComment: () => true,
  }),
  moderator: () => ({
    viewTodo: () => true,
    createTodo: () => true,
    updateTodo: () => true,
    deleteTodo: (todo) => todo.completed,
    viewComment: () => true,
    createComment: () => true,
    updateComment: () => true,
  }),
  user: (user: User) => ({
    viewTodo: (todo) => !user.blockedBy.includes(todo.userId),
    createTodo: () => true,
    updateTodo: (todo) =>
      todo.userId === user.id || todo.invitedUsers.includes(user.id),
    deleteTodo: (todo) =>
      (todo.userId === user.id || todo.invitedUsers.includes(user.id)) &&
      todo.completed,
    viewComment: (comment) => !user.blockedBy.includes(comment.authorId),
    createComment: () => true,
    updateComment: (comment) => comment.authorId === user.id,
  }),
};

export const can = (user: User): Permissions => {
  const userRolePermissions = user.roles.map((role) =>
    permissionsFactoryMap[role](user)
  );

  return new Proxy({} as Permissions, {
    get(target, action: keyof Permissions) {
      return (data: unknown) =>
        userRolePermissions.some((permissions) =>
          permissions[action](data as Todo & Comment)
        );
    },
  });
};
