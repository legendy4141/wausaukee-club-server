// src/routes/reservationRoutes.ts
import { Router } from 'express';
import { createReservation } from '../controllers/reservationController';
import verifyToken from '../middleware/verifyToken';

const router = Router();

router.post('/', createReservation);

export default router;
