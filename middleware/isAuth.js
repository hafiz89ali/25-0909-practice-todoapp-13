import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import database from "../database/connection.js";

configDotenv();

async function isAuth(req, res, next) {
  // get token from header
  const headers = req.headers;
  const token = headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // verify token expiration
    const producedAt = new Date(decoded.iat * 1000);
    const now = new Date();
    const timeDiff = now - producedAt;
    const diffInHours = timeDiff / 1000 / 60 / 60;
    if (diffInHours > 1) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // check if user is valid in database
    const query = `
        SELECT * FROM users WHERE id = $1 AND email = $2 AND username = $3
    `;
    const resDb = await database.query(query, [
      decoded.id,
      decoded.email,
      decoded.username,
    ]);

    if (resDb.rows.length === 0) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // reassign user to decoded token
    req.user = {
      id: decoded.id,
      email: decoded.email,
      usernam: decoded.email,
    };

    next();
  } catch (error) {
    console.error({ error });
    return res.status(401).json({ message: "Unauthorized." });
  }
}

export default isAuth;
