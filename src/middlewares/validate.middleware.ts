import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

type ValidationSchema = {
  body?: ZodObject;
  params?: ZodObject;
  query?: ZodObject;
};

export function validate(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    req.validated = {};
    const sources: (keyof ValidationSchema)[] = ["body", "params", "query"];

    for (const source of sources) {
      const validator = schema[source];

      if (!validator) continue;

      const result = validator.safeParse(req[source]);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: `${source} validation failed`,
          errors: result.error.flatten(),
        });
      }

      req.validated[source] = result.data as any;
    }

    return next();
  };
}
