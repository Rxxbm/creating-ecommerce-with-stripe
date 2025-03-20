import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { RouteResponse } from "../common/http-responses";

function extractErrorMessages(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  errors.forEach((error) => {
    if (error.constraints) {
      messages.push(...(Object.values(error.constraints) as string[]));
    }

    if (error.children && error.children.length > 0) {
      messages.push(...extractErrorMessages(error.children));
    }
  });

  return messages;
}

export function ValidatedDTO(dtoClass: any) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      const dtoInstance = plainToInstance(dtoClass, req.body);
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        const errorMessages = extractErrorMessages(errors);

        return RouteResponse.badRequest(res, {
          message: "Invalid data",
          errors: errorMessages,
        });
      }

      req.body = dtoInstance;
      return originalMethod.apply(this, [req, res, next]);
    };

    return descriptor;
  };
}
