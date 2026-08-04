import { Request, Response, NextFunction } from "express";
import {
  createInvitationService,
  deleteInvitationService,
  getInvitationsService,
} from "./invitation.service.js";

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
    if (!organizationId) {
      throw new Error("Organization ID is required");
    }
    if (!invitationId) {
      throw new Error("Invitation ID is required");
    }

    await deleteInvitationService(organizationId, invitationId);

    return res.status(200).json({
      success: true,
      message: "Invitation deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}

// export async function acceptInvitation(
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   try {
//     const token = req.params.token;
//     if (!token) {
//       throw new Error("Invitation token is required");
//     }

//     await acceptInvitationService(token);

//     return res.status(200).json({
//       success: true,
//       message: "Invitation accepted successfully",
//     });
//   } catch (error) {
//     return next(error);
//   }
// }

// export async function rejectInvitation(
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   try {
//     const token = req.params.token;
//     if (!token) {
//       throw new Error("Invitation token is required");
//     }

//     await rejectInvitationService(token);

//     return res.status(200).json({
//       success: true,
//       message: "Invitation rejected successfully",
//     });
//   } catch (error) {
//     return next(error);
//   }
// }
