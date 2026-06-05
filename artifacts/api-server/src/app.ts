import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import multer from "multer";
import router from "./routes";
import { logger } from "./lib/logger";
import { startBalanceScheduler } from "./lib/balanceScheduler.js";

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
app.use(cors());
app.use(
  express.json({
    verify: (req: express.Request & { rawBody?: Buffer }, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    const msg =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large. Maximum file size is 50 MB per file."
        : err.code === "LIMIT_FILE_COUNT"
        ? "Too many files. Maximum 20 files per upload."
        : `Upload error: ${err.message}`;
    res.status(400).json({ error: msg });
    return;
  }

  const message = err instanceof Error ? err.message : "An unexpected error occurred.";
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: message });
});

startBalanceScheduler().catch((err) => {
  logger.error({ err }, "Balance scheduler failed to start");
});

export default app;
