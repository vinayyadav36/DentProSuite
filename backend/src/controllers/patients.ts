import { Request, Response } from 'express';
import { JsonDB } from '../storage/json_db.js';
import { Patient } from '../../../shared/types/index.js';


const dbPatients = new JsonDB<Patient>('patients.json');

export const getPatients = async (req: Request, res: Response) => {
  try {
    const patients = await dbPatients.getAll();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const patient = await dbPatients.getById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    const newPatient: Patient = {
      ...req.body,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    const saved = await dbPatients.insert(newPatient);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const updated = await dbPatients.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Patient not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
