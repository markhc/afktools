import { Router } from 'express';
import { getRepository } from 'typeorm';

import { internalServerError } from '../../errors';
import { Skill } from '../../../entities/Skill';
import { body, validationResult } from 'express-validator';

const router = Router();

router.get('/list', (req, res) => {
  getRepository(Skill)
    .createQueryBuilder('skill')
    .getMany()
    .then(skills => {
      res.status(200).json(skills);
    })
    .catch(internalServerError(req, res));
});

router.get('/:skillId', (req, res) => {
  const { skillId } = req.params;

  getRepository(Skill)
    .findOne({ where: { id: skillId } })
    .then(skill => {
      if (skill) res.status(200).json(skill);
      else res.status(404).json({});
    })
    .catch(internalServerError(req, res));
});

router.post(
  '/:skillId/level',
  [
    body('unlocksAt').exists(),
    body('description').exists().isString(),
    body('index').isInt({ min: 0, max: 10 }).optional(),
  ],
  async (req: any, res: any) => {
    const { skillId } = req.params;
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const { index = -1, unlocksAt, description } = req.body;

    const repository = getRepository(Skill);
    try {
      const skill = await repository.findOne({ where: { id: skillId } });

      if (skill) {
        if (index === -1 || index > skill.levels.length) {
          skill.levels.push({ unlocksAt: unlocksAt, description: description });
        } else {
          skill.levels[index].unlocksAt = unlocksAt;
          skill.levels[index].description = description;
        }

        await repository.save(skill);

        res.status(200).json(skill);
      } else {
        res.status(404).json({ message: `No skill found with id ${skillId}` });
      }
    } catch (err) {
      internalServerError(req, res);
    }
  }
);

router.delete(
  '/:skillId/level',
  [body('index').isInt({ min: 0, max: 10 }).exists()],
  async (req: any, res: any) => {
    const { skillId } = req.params;
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const { index } = req.body;

    const repository = getRepository(Skill);
    try {
      const skill = await repository.findOne({ where: { id: skillId } });

      if (skill) {
        if (index > skill.levels.length)
          return res.status(400).json({ message: `Index outside of bounds.` });

        skill.levels.splice(index, 1);

        await repository.save(skill);

        res.status(200).json(skill);
      } else {
        res.status(404).json({ message: `No skill found with id ${skillId}` });
      }
    } catch (err) {
      internalServerError(req, res);
    }
  }
);

export default router;
