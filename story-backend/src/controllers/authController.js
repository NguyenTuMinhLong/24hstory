import {
    registerUser,
    loginUser,
    updateAvatar,
} from "../services/authService.js";

export const registerController = async (req, res) => {
    try {
        const user = await registerUser(req.body);

        res.json({
            message: "Register success",
            user,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message,
        });
    }
};

export const loginController = async (req, res) => {
    try {
        const result = await loginUser(req.body);

        res.json({
            message: "Login success",
            ...result,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message,
        });
    }
};

export const updateAvatarController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file" });
        }

        const user = await updateAvatar(req.user.id, req.file.path);
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};