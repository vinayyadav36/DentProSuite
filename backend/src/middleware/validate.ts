import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validate(schema: z.ZodTypeAny, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    req[source] = result.data;
    next();
  };
}
