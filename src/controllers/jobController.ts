// src/controllers/reservationController.ts
import { Request, Response } from 'express';
import { getJobs } from '../models/jobModel';

export const getJobList = async (req: Request, res: Response) => {
  try {
    const jobList = await getJobs();
    res.status(201).json(jobList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create reservation', error });
  }
};
