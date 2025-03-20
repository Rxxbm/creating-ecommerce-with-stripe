// src/config/routes.ts
import { Application as App, RequestHandler } from "express";
import fs from "fs";

type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "options"
  | "head";

// src/config/routes.ts
export function registerControllers(app: App, path: string) {
  fs.readdirSync(path).forEach((file) => {
    const filePath = `${path}/${file}`;
    if (fs.lstatSync(filePath).isDirectory()) {
      registerControllers(app, filePath);
    } else if (
      filePath.endsWith(".controller.ts") ||
      filePath.endsWith(".controller.js")
    ) {
      const controller = require(filePath);
      const controllerInstance = new controller[Object.keys(controller)[0]](); // Instancia o controlador
      registerRoutes(app, controllerInstance); // Registra as rotas
    }
  });
}

export async function registerRoutes(app: App, controllerInstance: any) {
  // Retrieve the base path from the controller metadata
  const basePath: string =
    Reflect.getMetadata("basePath", controllerInstance.constructor) || "";

  Object.getOwnPropertyNames(Object.getPrototypeOf(controllerInstance)).forEach(
    (methodName) => {
      // Retrieve route handler, path, HTTP method, and middlewares from metadata
      const routeHandler = controllerInstance[methodName];
      const path: string = Reflect.getMetadata(
        "route",
        controllerInstance,
        methodName
      );
      const method: HttpMethod = Reflect.getMetadata(
        "method",
        controllerInstance,
        methodName
      ) as HttpMethod;

      // Get middlewares from Middleware decorators
      const middlewares: RequestHandler[] =
        Reflect.getMetadata("middlewares", controllerInstance, methodName) ||
        [];

      // If the method is valid, register the route with middlewares and the handler
      if (path && method) {
        const isMethodValid =
          method in app && typeof app[method] === "function";
        if (isMethodValid) {
          // Combine the base path with the method-specific path
          const fullPath = `${basePath}${path}`;
          (app[method] as Function)(fullPath, ...middlewares, routeHandler);
        } else {
          console.warn(`Unsupported method '${method}' for route ${path}`);
        }
      }
    }
  );
}
