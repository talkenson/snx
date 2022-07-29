import express from 'express'

/**
 * Express has a problem with untyped interface for errors
 * This is why we used ignore rule
 */

export const jsonParseError = (app: express.Express) =>
  ((err, req, res, next) => {
    console.error('ERROR', err.name)
    // @ts-ignore
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).send({
        status: 'rejected',
        result: {
          reason: 'JSON_PARSE_ERROR',
          // @ts-ignore
          message: err.message,
        },
      }) // Bad request
    }
    next()
  }) as express.ErrorRequestHandler
