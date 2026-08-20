import { Request, Response, NextFunction } from "express";
import {
  createOrganizationService,
  deleteOrganizationService,
  getOrganizationService,
  getOrganizationsService,
  updateOrganizationService,
} from "./organization.service.js";

export async function createOrganization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name } = req.body;
    const userId = req.user!.id;

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
    const userId = req.user!.id;

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
    const userId = req.user!.id;
    const organizationId = req.params.organizationId as string;

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

export async function updateOrganization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;
    const organizationId = req.params.organizationId as string;
    const { name } = req.body;

    const organization = await updateOrganizationService(
      userId,
      organizationId,
      name,
    );
    return res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: organization,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteOrganization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;
    const organizationId = req.params.organizationId as string;

    await deleteOrganizationService(userId, organizationId);
    return res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}
