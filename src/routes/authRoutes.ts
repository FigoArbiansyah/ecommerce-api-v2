import { Router } from 'express';
import { register, login, adminRoute } from '../controllers/AuthController';
import authenticate from '../middlewares/authMiddleware';

const router = Router();

// Rute Registrasi
router.post('/register', register);

// Rute Login
router.post('/login', login);

// Rute Admin
// router.get('/admin', authenticate(['admin']), adminRoute);

export default router;
