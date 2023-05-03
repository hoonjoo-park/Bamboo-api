import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  jwt.verify(token, process.env.SALT, (error, decoded) => {
    if (error) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.userId = (decoded as { id: number }).id;
    next();
  });
};
