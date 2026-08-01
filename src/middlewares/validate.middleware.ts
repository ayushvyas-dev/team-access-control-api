// import { ZodSchema } from "zod";
import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

// export function validate(schema: ZodSchema) {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const result = schema.safeParse(req.body);

//     if (!result.success) {
//       return res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: result.error.flatten(),
//       });
//     }

//     req.body = result.data;
//     return next();
//   };
// }

type ValidationSchema = {
  body?: ZodObject;
  params?: ZodObject;
  query?: ZodObject;
};

export function validate(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
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

      req[source] = result.data as any;
    }

    return next();
  };
}
