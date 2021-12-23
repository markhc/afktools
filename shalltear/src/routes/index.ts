import { Router } from 'express';

import auth from './api/auth';
import hero from './api/hero/Hero';
import skill from './api/skill/Skill';
import user from './api/user';

const router = Router();

router.use('/auth', auth);
router.use('/hero', hero);
router.use('/skill', skill);
router.use('/user', user);

export default router;
