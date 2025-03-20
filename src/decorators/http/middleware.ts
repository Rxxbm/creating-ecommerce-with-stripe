import { RequestHandler } from "express";

export function Middleware(middleware: RequestHandler): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const middlewares: RequestHandler[] =
      Reflect.getMetadata("middlewares", target, propertyKey) || [];
    middlewares.push(middleware);
    Reflect.defineMetadata("middlewares", middlewares, target, propertyKey);
  };
}
