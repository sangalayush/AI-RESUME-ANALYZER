const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || "secretkey";

module.exports = function (req, res, next) {
  let token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // ✅ If token comes like: "Bearer eyJhbGci..."
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  try {
    const decoded = jwt.verify(token, jwtSecret); // same key used in login
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};