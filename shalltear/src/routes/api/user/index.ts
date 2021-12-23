import { Router } from 'express';
import { isAuthenticated } from '../auth';

const router = Router();

// GET /api/user
router.get('/', (req, res) => {
  // Both cases give 200 status result
  // to avoid error messages in the frontend
  if (req.isAuthenticated()) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(200).json({});
  }
});

export default router;
