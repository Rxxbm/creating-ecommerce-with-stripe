// config/routesLogger.ts
import { Express } from "express";
import logger from "./logger";

const listRoutes = (app: Express) => {
  logger.info("Rotas disponíveis na API:");
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      // Verifica se há uma rota definida
      const method = Object.keys(middleware.route.methods)[0].toUpperCase();
      const path = middleware.route.path;
      logger.info(`${method} ${path}`);
    }
  });
};

export default listRoutes;
