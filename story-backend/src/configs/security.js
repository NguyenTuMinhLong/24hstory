import helmet from "helmet";

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "https:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});