import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { rolePermissions } from "../config/rolePermission.config.js";

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const membership = req.membership;

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Organization membership required",
      });
    }

    const allowedPermissions = rolePermissions[membership.role as Role];

    if (!allowedPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    return next();
  };
}
