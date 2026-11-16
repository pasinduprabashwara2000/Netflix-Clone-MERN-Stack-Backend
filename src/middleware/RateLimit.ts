import {Response, NextFunction} from "express";
import {AuthRequest} from "./AuthMiddleware";

interface Bucket {
    count : number;
    resetAt : number;
}

// simple in-memory limiter per user (use it after `protect`)
export const rateLimit = (maxRequests : number, windowMs : number) => {
    const buckets = new Map<string, Bucket>();

    return (req : AuthRequest, res : Response, next : NextFunction) => {
        const key = req.user?.id || req.ip || "anonymous";
        const now = Date.now();

        // drop expired buckets so the map can't grow forever
        if (buckets.size > 5000) {
            for (const [k, b] of buckets) {
                if (b.resetAt <= now) buckets.delete(k);
            }
        }

        let bucket = buckets.get(key);

        if (!bucket || bucket.resetAt <= now) {
            bucket = { count : 0, resetAt : now + windowMs };
            buckets.set(key, bucket);
        }

        bucket.count++;

        if (bucket.count > maxRequests) {
            res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
            return res.status(429).json({
                message : "Too many AI requests. Please wait a moment."
            });
        }

        next();
    }
}
