import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../configs/cloudinary.js";
import fs from "fs";
import { prisma } from "../prismaClient.js";

export const registerUser = async ({ email, password}) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        },
    });

    return user;
};

export const loginUser = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("Invalid");
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid");
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );

    return {
        token,
        user,
    };
};

export const updateAvatar = async (userId, filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "avatars",
        });

        return await prisma.user.update({
            where: { id: userId },
            data: { avatar: result.secure_url },
            select: { id: true, email: true, avatar: true },
        });
    } finally {
        fs.unlinkSync(filePath);
    }
};