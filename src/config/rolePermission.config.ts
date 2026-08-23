import { Role } from "@prisma/client";
import { permissions } from "./permissions.config.js";

export const rolePermissions: Record<Role, string[]> = {
  OWNER: [
    permissions.ORGANIZATION_READ,
    permissions.ORGANIZATION_UPDATE,
    permissions.ORGANIZATION_DELETE,

    permissions.MEMBER_READ,
    permissions.MEMBER_UPDATE_ROLE,
    permissions.MEMBER_REMOVE,

    permissions.INVITATION_READ,
    permissions.INVITATION_CREATE,
    permissions.INVITATION_DELETE,

    permissions.AUDIT_LOG_READ,
  ],

  ADMIN: [
    permissions.ORGANIZATION_READ,

    permissions.MEMBER_READ,
    permissions.MEMBER_UPDATE_ROLE,
    permissions.MEMBER_REMOVE,

    permissions.INVITATION_READ,
    permissions.INVITATION_CREATE,
    permissions.INVITATION_DELETE,

    permissions.AUDIT_LOG_READ,
  ],

  MEMBER: [permissions.ORGANIZATION_READ, permissions.MEMBER_READ],
};
