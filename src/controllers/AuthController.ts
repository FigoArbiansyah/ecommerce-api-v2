import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../supabaseClient';
import { failedResponse, successResponse } from '../utils/ResponseHelper';
import { methodType } from '../utils';
import { RequestWithUser } from '../types/types';

export const register: methodType = async (req: RequestWithUser, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!password) {
    return res.status(422).json(failedResponse('Password is required'));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('users')
    .insert([{ email, password: hashedPassword, role, name }]);

  if (error) return res.status(400).json(failedResponse(error.message));

  res.status(201).json(successResponse([], 'User registered successfully'));
};

export const login: methodType = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !(await bcrypt.compare(password, data.password))) {
    return res.status(401).json(failedResponse('Invalid credentials'));
  }

  const token = jwt.sign({ id: data.id, role: data.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });

  res.json({ token });
};

export const adminRoute = (req: Request, res: Response) => {
  res.json(successResponse([], 'Welcome Admin'));
};
