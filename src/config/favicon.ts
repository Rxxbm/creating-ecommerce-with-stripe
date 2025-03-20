// config/favicon.ts
import { Request, Response, NextFunction } from "express";

const ignoreFavicon = (req: Request, res: Response, next: NextFunction) => {
  if (req.url === "/favicon.ico") {
    res.status(204).end(); // Retorna status 204 (sem conteúdo)
  } else {
    next();
  }
};

export default ignoreFavicon;
