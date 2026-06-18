import { Router } from 'express';
import {
  updateAvatar, createUser, getUserById, getUsers, updateProfile,
} from '../controllers/users';
import authMiddleware from '../middleware/auth';

const router = Router();

router.post('/', createUser);

router.get('/', authMiddleware, getUsers);

router.get('/:userId', authMiddleware, getUserById);

router.patch('/me', updateProfile);

router.patch('/me/avatar', updateAvatar);

export default router;
