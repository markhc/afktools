import express from 'express';
import { body, validationResult } from 'express-validator';

import { HeroFaction } from '../entities/Hero';

const validateHero = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 128 })
    .withMessage('Hero name must have between 2 and 128 characters')
    .bail(),
  body('aliases')
    .isArray()
    .isLength({ max: 10 })
    .withMessage('A Hero cannot have more than 10 aliases')
    .optional({ nullable: true }),
  body('faction')
    .isString()
    .toLowerCase()
    .isIn(Object.values(HeroFaction).map(x => x.toString())),
  body('icon').isString().optional({ nullable: true }),
  body('skills').isArray().isLength({ min: 2 }),
];

export function withHero(
  handler: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void
): (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => void {
  return async function (req, res, next) {
    await Promise.all(validateHero.map(validation => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return handler(req, res, next);
    }

    res.status(400).json({ errors: errors.array() });
  };
}
