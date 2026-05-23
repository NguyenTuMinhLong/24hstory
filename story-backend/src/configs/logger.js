import morgan from "morgan";

const format = process.env.NODE_ENV === "production" 
  ? "combined" 
  : "dev";

export const logger = morgan(format);

// Custom token for request body (mask sensitive data)
morgan.token("body", (req) => {
  if (req.body && Object.keys(req.body).length > 0) {
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = "[REDACTED]";
    if (safeBody.token) safeBody.token = "[REDACTED]";
    return JSON.stringify(safeBody);
  }
  return null;
});