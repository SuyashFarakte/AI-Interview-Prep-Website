import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {

  // console.log("verification : ", req.body);
  try {
    let token = req.headers.authorization;
    // console.log("Protect middleware started");

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log("Token verified:", decoded.id);

      req.user = decoded;
      // console.log("User verified:", req.user);

      next();
    } else {
      // console.log("No token found");
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    // console.log("Protect middleware error:", error.message);
    res.status(401).json({ message: "Token failed", error: error.message });
  }
};
