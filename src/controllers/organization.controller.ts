import { Request, Response, NextFunction } from "express";
import {
  createOrganizationService,
  getOrganizationService,
  getOrganizationsService,
} from "../services/organization.service.js";

export async function createOrganization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const organization = await createOrganizationService(name, userId);
    return res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: organization,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getOrganizations(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const organizations = await getOrganizationsService(userId);
    return res.status(200).json({
      success: true,
      message: "Organizations retrieved successfully",
      data: organizations,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getOrganization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    const organizationId = req.params.organizationId as string;

    if (!userId) {
      throw new Error("Unauthorized");
    }
    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    const organization = await getOrganizationService(userId, organizationId);
    return res.status(200).json({
      success: true,
      message: "Organization retrieved successfully",
      data: organization,
    });
  } catch (error) {
    return next(error);
  }
}
