import morgan from "morgan";

// Log format: dev (màu sắc) cho dev, combined cho production
const format = process.env.NODE_ENV === "production" 
  ? "combined" 
  : "dev";

export const logger = morgan(format);

// Morgan token để log request body (che password)
morgan.token("body", (req) => {
  if (req.body && Object.keys(req.body).length > 0) {
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = "[AN_DA_BI_AN]";
    if (safeBody.token) safeBody.token = "[AN_DA_BI_AN]";
    return JSON.stringify(safeBody);
  }
  return null;
});
