import { Router, type IRouter } from "express";

const router: IRouter = Router();
const startedAt = new Date().toISOString();

router.get("/system/status", (_req, res) => {
  const memory = process.memoryUsage();

  res.json({
    status: "operational",
    service: "miranha-api",
    environment: process.env.NODE_ENV ?? "development",
    version: process.env.APP_VERSION ?? "1.0.0",
    startedAt,
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      rssBytes: memory.rss,
      heapUsedBytes: memory.heapUsed,
    },
    checkedAt: new Date().toISOString(),
  });
});

export default router;