import express from 'express';

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {(Error) => void}
 */
export function internalServerError(
  req: express.Request,
  res: express.Response
) {
  return function (error: Error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  };
}
