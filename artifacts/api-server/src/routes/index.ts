import { Router, type IRouter } from "express";
import healthRouter from "./health";
import systemRouter from "./system";
import spiderRouter from "./spider";

const router: IRouter = Router();

router.use(healthRouter);
router.use(systemRouter);
router.use(spiderRouter);

export default router;
