import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { RequestUploadUrlResponse } from "@workspace/api-zod";
import { uploadBufferToCloudinary } from "../lib/cloudinary";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Hanya file gambar yang diizinkan"));
      return;
    }
    cb(null, true);
  },
});

/**
 * POST /storage/uploads
 *
 * Single-step image upload. The client sends the file as multipart/form-data
 * (field name "file"). The server streams it to Cloudinary and returns the
 * public, servable CDN URL directly — no separate serving route is needed.
 */
router.post("/storage/uploads", (req: Request, res: Response) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      res.status(400).json({ error: err.message || "Gagal memproses file" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "Tidak ada file yang dikirim" });
      return;
    }

    try {
      const result = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);

      res.json(
        RequestUploadUrlResponse.parse({
          url: result.url,
          metadata: {
            name: req.file.originalname,
            size: req.file.size,
            contentType: req.file.mimetype,
          },
        }),
      );
    } catch (error) {
      req.log.error({ err: error }, "Error uploading to Cloudinary");
      res.status(500).json({ error: "Gagal mengunggah gambar ke Cloudinary" });
    }
  });
});

export default router;
