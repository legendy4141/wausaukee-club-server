// src/models/jobModel.ts
import pool from '../config/database';

export interface Job {
  job_id: string;
  job_description: string;
}

export const getJobById = async (id: string): Promise<Job | null> => {
  const result = await pool.query('SELECT * FROM jobs WHERE job_id = $1', [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const getJobs = async (): Promise<Job | null> => {
  const result = await pool.query('SELECT * FROM jobs');
  return result.rows.length > 0? result.rows: null;
}

export const getJobByJob = async (job: string): Promise<string> => {
  const result = await pool.query('SELECT * FROM jobs WHERE job_description = $1', [job]);
  return result.rows.length > 0 ? result.rows[0].job_id : "";
}