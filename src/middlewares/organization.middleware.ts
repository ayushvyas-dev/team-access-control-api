import { Request, Response, NextFunction } from "express";
import { getMembershipByOrgAndMemberId } from "../features/memberships/membership.repository.js";

export async function requireOrgMembership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id as string;
  const organizationId = req.params.organizationId as string;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!organizationId) {
    return res.status(400).json({
      success: false,
      message: "Organization ID is required",
    });
  }

  const membership = await getMembershipByOrgAndMemberId(
    organizationId,
    userId,
  );

  if (!membership) {
    return res.status(403).json({
      success: false,
      message: "You are not a member of this organization",
    });
  }

  req.membership = membership;

  return next();
}
