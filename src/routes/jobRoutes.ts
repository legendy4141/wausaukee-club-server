// src/routes/authRoutes.ts
import { Router } from 'express';
import { getJobList} from '../controllers/jobController';
import verifyToken from '../middleware/verifyToken';

const router = Router();

router.post('/get_job_list', verifyToken, getJobList);

export default router;
