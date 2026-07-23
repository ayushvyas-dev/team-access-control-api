import { registerUser, loginUser } from "../services/auth.services.js";
import { NextFunction, Request, Response } from "express";


export async function register(req: Request, res: Response, next: NextFunction) {

    try {
        const { name, email, password } = req.body;
        const user = await registerUser({ name, email, password });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user
        })
    } catch (error) {
        next(error)
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
        const result = await loginUser({ email, password });
        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: result
        })
    } catch (error) {
        next(error)
    }
}

export async function logoutUser(req: Request, res: Response) {


}

export async function logoutAllUser(req: Request, res: Response) {


}

export async function refreshUser(req: Request, res: Response) {


}

export async function getSessions(req: Request, res: Response) {


}

export async function deleteSession(req: Request, res: Response) {


}
