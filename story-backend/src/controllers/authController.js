import {
    registerUser,
    loginUser,
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