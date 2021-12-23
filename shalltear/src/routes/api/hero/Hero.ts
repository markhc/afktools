import { Router } from 'express';
import { getRepository } from 'typeorm';

import { internalServerError } from '../../errors';
import { Hero } from '../../../entities/Hero';

const router = Router();

/**
 * GET /api/hero/list
 *
 * Optional parameters can be supplied as filter.
 *  faction
 *  klass
 *  type
 */
router.get('/list', (req, res) => {
  const {
    faction = undefined,
    klass = undefined,
    type = undefined,
  } = req.query;

  if (!faction && !klass && !type) {
    getRepository(Hero)
      .createQueryBuilder('hero')
      .getMany()
      .then(heroes => {
        res.status(200).json(heroes);
      })
      .catch(internalServerError(req, res));
  } else {
    getRepository(Hero)
      .find({
        where: {
          ...(faction && { faction }),
          ...(klass && { klass }),
          ...(type && { type }),
        },
      })
      .then(heroes => {
        res.status(200).json(heroes);
      })
      .catch(internalServerError(req, res));
  }
});

router.get('/:heroId', (req, res) => {
  const { heroId } = req.params;

  getRepository(Hero)
    .findOne({ where: { id: heroId }, relations: ['skills'] })
    .then(hero => {
      if (hero) res.status(200).json(hero);
      else res.status(404).json({});
    })
    .catch(internalServerError(req, res));
});

router.get('/:heroId/skills', (req, res) => {
  const { heroId } = req.params;

  getRepository(Hero)
    .findOne({ where: { id: heroId }, relations: ['skills'] })
    .then(hero => {
      if (hero) res.status(200).json(hero.skills);
      else res.status(404).json({});
    })
    .catch(internalServerError(req, res));
});

export default router;
