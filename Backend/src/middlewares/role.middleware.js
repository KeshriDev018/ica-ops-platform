export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("Role check - User role:", req.user?.role);
    console.log("Role check - Allowed roles:", allowedRoles);

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.log("Role check FAILED - Access denied");
      return res.status(403).json({
        message: "Access denied for this role",
      });
    }

    console.log("Role check PASSED");
    next();
  };
};
