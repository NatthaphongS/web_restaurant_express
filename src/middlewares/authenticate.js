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
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });
    if (!user) {
      return next(createError("Unanthenticated", 401));
    }
    delete user.password;
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      err.statusCode = 401;
    }
    next(err);
  }
};
