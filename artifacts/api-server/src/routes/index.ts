import { Router, type IRouter } from "express";
import healthRouter from "./health";
import systemRouter from "./system";
import spiderRouter from "./spider";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(systemRouter);
router.use(spiderRouter);
router.use(authRouter);

export default router;
