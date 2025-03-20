import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RouteResponse } from "../common/http-responses";

// Extensão da interface Request para incluir a propriedade 'user'
declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}

export function PrivateRoute() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return RouteResponse.unauthorized(
          res,
          "User not authenticated. Please provide a token"
        );
      }

      try {
        const secretKey = process.env.JWT_SECRET || "default";
        req.user = jwt.verify(token, secretKey); // Adiciona o payload decodificado ao req
        return originalMethod.apply(this, [req, res, next]);
      } catch {
        return RouteResponse.unauthorized(res, "Invalid or expired token");
      }
    };

    return descriptor;
  };
}

export function Roles(requiredRoles: any) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      // Simulação de decodificação do token e extração da role
      const decodedToken = req.user; // Implemente esta função
      const userRole = decodedToken.role;

      // Verifica se a role do usuário está entre as roles permitidas
      if (!requiredRoles.includes(userRole)) {
        return RouteResponse.forbidden("User without permission", res);
      }

      // Continua para o método original se a autorização passar
      return originalMethod.apply(this, [req, res, next]);
    };

    return descriptor;
  };
}
export const makeJwtToken = (payload: any) => {
  const secretKey = process.env.JWT || "default";
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};
