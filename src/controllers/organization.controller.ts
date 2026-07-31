import { Request, Response, NextFunction } from "express";
import { createOrganizationService } from "../services/organization.service.js";


export async function createOrganization(req: Request, res: Response, next: NextFunction) {
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