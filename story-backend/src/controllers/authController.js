import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  updateAvatar,
} from "../services/authService.js";

// Helper xử lý lỗi - 401 cho "Invalid", 400 cho các lỗi khác
const handleError = (res, err) => {
  const status = err.message.includes("Invalid") ? 401 : 400;
  res.status(status).json({ message: err.message });
};

export const registerController = async (req, res) => {
  try {
    const result = await registerUser(req.body, req);
    res.status(201).json(result);
  } catch (err) {
    handleError(res, err);
  }
};

export const loginController = async (req, res) => {
  try {
    const result = await loginUser(req.body, req);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
};

export const refreshController = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await refreshAccessToken(refreshToken);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

export const logoutController = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await logoutUser(refreshToken);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logoutAllController = async (req, res) => {
  try {
    const result = await logoutAllDevices(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const meController = async (req, res) => {
  try {
    const result = await getMe(req.user.id);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
};

export const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.query;
    const result = await verifyEmail(token);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
};

export const resendVerificationController = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await resendVerification(email);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPassword(email);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { token, password } = req.body;
    const result = await resetPassword(token, password);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
};

export const changePasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await changePassword(req.user.id, currentPassword, newPassword);
    res.json(result);
  } catch (err) {
    handleError(res, err);
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
