import { Request, Response, NextFunction } from "express";
import {
  deleteCurrentUserMembershipService,
  deleteMembershipService,
  getMembershipService,
  getMembershipsService,
  updateMembershipService,
} from "./membership.service.js";

export async function getMemberships(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizationId = req.params.organizationId as string;

    const memberships = await getMembershipsService(organizationId);

    return res.status(200).json({
      success: true,
      message: "Memberships retrieved successfully",
      data: {
        memberships,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMembership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizationId = req.params.organizationId as string;
    const memberId = req.params.memberId as string;

    if (!organizationId || !memberId) {
      throw new Error("Organization ID and Member ID are required");
    }

    const membership = await getMembershipService(organizationId, memberId);

    return res.status(200).json({
      success: true,
      message: "Membership retrieved successfully",
      data: {
        membership,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateMembership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizationId = req.params.organizationId as string;
    const memberId = req.params.memberId as string;
    const { role } = req.body;

    if (!organizationId || !memberId) {
      throw new Error("Organization ID and Member ID are required");
    }

    const membership = await updateMembershipService(
      organizationId,
      memberId,
      role,
    );

    return res.status(200).json({
      success: true,
      message: "Membership updated successfully",
      data: {
        membership,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMembership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizationId = req.params.organizationId as string;
    const memberId = req.params.memberId as string;
    if (!organizationId || !memberId) {
      throw new Error("Organization ID and Member ID are required");
    }

    await deleteMembershipService(organizationId, memberId);

    return res.status(200).json({
      success: true,
      message: "Membership deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteCurrentUserMembership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id as string;
    const organizationId = req.params.organizationId as string;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    await deleteCurrentUserMembershipService(userId, organizationId);

    return res.status(200).json({
      success: true,
      message: "Current user's membership deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}
