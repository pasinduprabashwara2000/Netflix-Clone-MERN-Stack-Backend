import express, {Request, Response, NextFunction} from "express";
import serverless from "serverless-http";
import mongoose from "mongoose";
import app from "../../src/app";
import {corsMiddleware} from "../../src/config/cors";

// Netlify runs this file as a serverless function. The Express app is reused between calls
// while the function stays warm, and the MongoDB connection is cached the same way.
let connecting : Promise<typeof mongoose> | null = null;

async function ensureDb() : Promise<void> {
    if (mongoose.connection.readyState === 1) return;

    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured");

    connecting ??= mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize : 5,
        serverSelectionTimeoutMS : 8000,
        bufferCommands : false
    }).catch((error) => {
        connecting = null; // allow a retry on the next request
        throw error;
    });

    await connecting;
}

const wrapper = express();

// make the path the same no matter how Netlify forwards it:
// /api/x  or  /.netlify/functions/api/x  ->  /api/x
wrapper.use((req : Request, _res : Response, next : NextFunction) => {
    let url = req.url.replace(/^\/\.netlify\/functions\/api/, "");
    if (!url.startsWith("/")) url = "/" + url;
    if (!url.startsWith("/api")) url = "/api" + (url === "/" ? "" : url);
    req.url = url;
    next();
});

// CORS first, so preflight requests and error responses always carry the headers
wrapper.use(corsMiddleware);

// health check works without the database
wrapper.get("/api", (_req, res) => {
    res.json({ message : "Netflix Clone API is running" });
});

wrapper.use(async (_req : Request, res : Response, next : NextFunction) => {
    try {
        await ensureDb();
        next();
    } catch (error) {
        const reason = (error as Error).message || "";
        console.error("Database connection failed:", reason);

        // safe hint (never includes the connection string)
        let hint = "Check MONGO_URI and MongoDB Atlas settings";
        if (/not configured/i.test(reason)) hint = "MONGO_URI is not set in Netlify environment variables (redeploy after adding it)";
        else if (/bad auth|authentication failed/i.test(reason)) hint = "Wrong database username or password in MONGO_URI";
        else if (/ENOTFOUND|querySrv|invalid (scheme|connection string)|URI/i.test(reason)) hint = "MONGO_URI is malformed or the cluster host is wrong";
        else if (/timed out|ReplicaSet|ECONNREFUSED|selection|whitelist|IP/i.test(reason)) hint = "Atlas is blocking the connection: allow 0.0.0.0/0 in Network Access";

        res.status(503).json({ message : "Database unavailable", hint });
    }
});

wrapper.use(app);

export const handler = serverless(wrapper);
