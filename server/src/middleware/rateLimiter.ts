import rateLimit from "express-rate-limit";

// Global limiter: 100 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth limiter: stricter limit for auth routes to prevent brute-force attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit each IP to 5 requests per `window` for auth routes
  message: {
    success: false,
    message: "Too many authentication attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
