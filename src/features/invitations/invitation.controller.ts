import { Request, Response, NextFunction } from "express";
import {
  acceptInvitationService,
  createInvitationService,
  deleteInvitationService,
  getInvitationsService,
  getUserInvitationsService,
  rejectInvitationService,
} from "./invitation.service.js";

export async function getUserInvitations(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const invitations = await getUserInvitationsService(userId);

    return res.status(200).json({
      success: true,
      message: "User invitations retrieved successfully",
      data: invitations,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createInvitation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizationId = req.params.organizationId as string;
    const { email, role } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }
    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    const invitation = await createInvitationService(
      organizationId,
      userId,
      email,
      role,
    );

    return res.status(201).json({
      success: true,
      message: "Invitation created successfully",
      data: invitation,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getInvitations(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizationId = req.params.organizationId as string;

    const invitations = await getInvitationsService(organizationId);
    return res.status(200).json({
      success: true,
      message: "Invitations retrieved successfully",
      data: invitations,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteInvitation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizationId = req.params.organizationId as string;
    const invitationId = req.params.invitationId as string;

    await deleteInvitationService(organizationId, invitationId);

    return res.status(200).json({
      success: true,
      message: "Invitation deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}

export async function acceptInvitation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.params.token as string;
    const userId = req.user?.id as string;

    await acceptInvitationService(token, userId);

    return res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    return next(error);
  }
}

export async function rejectInvitation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.params.token as string;
    const userId = req.user?.id as string;

    await rejectInvitationService(token, userId);

    return res.status(200).json({
      success: true,
      message: "Invitation rejected successfully",
    });
  } catch (error) {
    return next(error);
  }
}
