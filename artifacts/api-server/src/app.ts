import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { errorHandler } from "./middlewares/error-handler";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : true; // allow all in dev if not set
app.use(cors({ origin: corsOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cegah browser/proxy meng-cache respons API secara heuristik (mis. saat
// tidak ada header Cache-Control eksplisit), yang bisa membuat data lama
// (mis. homepageTemplate) tetap tampil walau sudah diubah di server.
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use("/api", router);

// Harus dipasang SETELAH semua route
app.use(errorHandler);

export default app;
