import multer from "multer";
import type { NextFunction, Request, Response } from "express";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB per image (poster + banner stay under serverless body limits)

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_BYTES, files: 2 },
    fileFilter: (_req, file, cb) => {
        if (/^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG, WebP, GIF or AVIF images are allowed"));
        }
    },
}).fields([
    { name: "poster", maxCount: 1 },
    { name: "banner", maxCount: 1 },
]);

/** Parses the multipart form: req.files.poster[0] and req.files.banner[0]. */
export const uploadImages = (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err: unknown) => {
        if (!err) return next();

        const message =
            err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
                ? "Each image must be 2 MB or smaller"
                : err instanceof Error
                    ? err.message
                    : "Image upload failed";

        res.status(400).json({ message });
    });
};
