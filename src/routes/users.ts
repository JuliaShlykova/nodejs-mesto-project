import { Router } from 'express';
import {
  updateAvatar, getUserById, getUsers, updateProfile,
  getCurrentUser,
} from '../controllers/users';
import { validateUpdateAvatar, validateUpdateProfile, validateUserId } from '../middleware/validation';

const router = Router();

router.get('/', getUsers);
router.get('/:userId', validateUserId, getUserById);
router.get('/me', getCurrentUser);
router.patch('/me', validateUpdateProfile, updateProfile);
router.patch('/me/avatar', validateUpdateAvatar, updateAvatar);

export default router;
