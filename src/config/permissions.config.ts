export const permissions = {
  ORGANIZATION_READ: "organization:read",
  ORGANIZATION_UPDATE: "organization:update",
  ORGANIZATION_DELETE: "organization:delete",

  MEMBER_READ: "member:read",
  MEMBER_UPDATE_ROLE: "member:update-role",
  MEMBER_REMOVE: "member:remove",

  INVITATION_READ: "invitation:read",
  INVITATION_CREATE: "invitation:create",
  INVITATION_DELETE: "invitation:delete",

  AUDIT_LOG_READ: "audit-log:read",
} as const;
