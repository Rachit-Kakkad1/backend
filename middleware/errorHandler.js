export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message =
    err.message ||
    err.error ||
    "Internal Server Error";

  console.error("❌ Error:", {
    message,
    statusCode,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};
