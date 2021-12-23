import { Router } from 'express';

import apiRoutes from './routes/index';

const router = Router();

router.use('/api', apiRoutes);

export default router;
