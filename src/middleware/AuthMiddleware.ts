import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    id : string;
}

export interface AuthRequest extends Request {
    user? : JwtPayload;
}

export const protect = (req : AuthRequest, res :Response, next : NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message : "Access Denied. No token is Provided."
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message : "Token is Required"
            });
        }

        const secret = process.env.JWT_SECRET;

        if(!secret) {
            return res.status(500).json({
                message : "JWT Secret is not configured"
            });
        }

        const decoded = jwt.verify(
            token,
            secret,
            {algorithms: ["ES256"]}
        ) as JwtPayload;

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message : "Invalid or Expired Token"
        });
    }
}
