import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";

import database from "../database/connection.js";

configDotenv();

async function registerUser(req, res) {
  // get user data from client
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  //   check all fields are present
  if (!username || !email || !password) {
    return res.status(401).json({ error: "All fields are required." });
  }

  //   check email is valid
  const emailRegex = /\S+@\S+.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(401).json({ error: "Invalid email." });
  }

  //   check password is match
  if (password !== confirmPassword) {
    return res.status(401).json({ error: "Password did not match." });
  }

  //   encode password with bcrypt
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  //   insert user SQL
  const insertUserSQL = `
    INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id
  `;
  try {
    const resDb = await database.query(insertUserSQL, [
      username,
      email,
      hashedPassword,
    ]);
    const user = resDb.rows[0];
    const userId = user.id;

    const resData = {
      message: "User registered.",
      data: {
        userId,
        username,
        email,
      },
    };
    return res.status(200).json(resData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function loginUser(req, res) {
  // get user data from client
  const email = req.body.email;
  const password = req.body.password;

  //   check if all fields are present
  if (!email || !password) {
    return res.status(401).json("All fields are required.");
  }

  //   check if email is valid
  const emailRegex = /\S+@\S+.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(401).json("Invalid email.");
  }

  //   select user SQL
  const selectUserSQL = `
    SELECT * FROM users WHERE email = $1
  `;

  try {
    const resDb = await database.query(selectUserSQL, [email]);
    if (resDb.rows.length === 0) {
      return res.status(401).json("Invalid email or password.");
    }

    const user = resDb.rows[0];

    const dbPassword = user.password;
    const isPasswordMatch = bcrypt.compareSync(password, dbPassword);
    if (!isPasswordMatch) {
      return res.status(401).json("Invalid email or password.");
    }

    const tokenData = {
      id: user.id,
      username: user.username,
      email: user.email,
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET);

    const resData = {
      message: "Login successfull.",
      token: token,
    };
    return res.status(200).json(resData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

const authController = {
  registerUser,
  loginUser,
};

export default authController;
