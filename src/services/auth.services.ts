import { NextFunction, Request, Response } from "express";
import { createUser, findUserByEmail } from "../repositories/auth.repositories.js";
import bcrypt from "bcryptjs";
import { config } from "../config/env.config.js";
import jwt from "jsonwebtoken";

export async function registerUser({ name, email, password }: { name: string, email: string, password: string }) {
    try {
        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            throw new Error("User already exists");
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await createUser({ name, email, passwordHash })

        return user
    } catch (error) {
        throw error;


    }

}

export async function loginUser({ email, password }: { email: string, password: string }) {
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        const accessToken = jwt.sign({ userId: user.id }, config.JWT_SECRET)

    } catch (error) {
        throw error;
    }

}