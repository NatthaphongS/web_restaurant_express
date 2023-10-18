const createError = require("../utils/create-error");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authrorization = req.headers.authorization;
    if (!authrorization || !authrorization.startsWith("Bearer")) {
      return next(createError("Unanthenticated", 401));
    }
    const token = authrorization.split(" ")[1];
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "fdkslajfl"
    );
    if (payload.userRole !== "MEMBER") {
      return next(createError("Unanthenticated", 401));
    }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      err.statusCode = 401;
    }
    next(err);
  }
};
