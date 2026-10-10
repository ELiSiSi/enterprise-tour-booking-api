import express from 'express';
import { validate } from '../../shared/middlewares/validate.js';
import { signupSchema, loginSchema } from './user.validation.js';

import {
  forgotPassword,
  login,
  logout,
  logoutAll,
  protect,
  resetPassword,
  restrictTo,
  signup,
  updatePassword,
  setupMFA,
  verifyAndEnableMFA,
  disableMFA,
  completeMFALogin,
  refreshAccessToken,
  getActiveSessions,
  revokeSession
} from './auth.controller.js';

import {
  createUser,
  deleteMe,
  deleteUser,
  getMe,
  getUserById,
  getUsers,
  updateMe,
  updateUser,
  uploadUserPhoto,
  resizeUserPhoto,
} from './user.controller.js';

 const router = express.Router();

// ============================================
// Public Routes (لا تحتاج authentication)
// ============================================
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/login/mfa', completeMFALogin);
router.post('/refresh-token', refreshAccessToken);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// ============================================
// Protected Routes (تحتاج authentication)
// ============================================
router.use(protect);

router.patch('/updatePassword', updatePassword);
router.get('/me', getMe, getUserById);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);
router.get('/logout-all', logoutAll);

// Session Routes
router.get('/sessions', getActiveSessions);
router.delete('/sessions/:id', revokeSession);

// MFA Routes
router.post('/mfa/setup', setupMFA);
router.post('/mfa/enable', verifyAndEnableMFA);
router.post('/mfa/disable', disableMFA);

// ============================================
// Admin/Lead-Guide Only Routes
// ============================================
router.use(restrictTo('admin', 'lead-guide'));

router.route('/')
  .get(getUsers)
  .post(createUser);

// ⚠️ هذا الـ route يجب أن يكون الأخير!
router.route('/:id')
  .get(getUserById)
  .patch(updateUser)
  .delete(deleteUser);

export default router;
