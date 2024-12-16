import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { HttpException } from "@/utils/HttpExceptions";
import { JwtService } from "@/services/JwtService";
import { getPermissionsByRoles } from "@/config/permissions";

export interface AuthRequest extends Request {
  user?: {
    email: string;
    roles: Role[];
  };
}

export default class Auth {
  constructor() {}
  async verifyToken(
    req: AuthRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { authorization } = req.headers;
      if (!authorization) throw new HttpException(401, "Unauthorized");
      const [type, token] = authorization.split(" ");
      if (type !== "Bearer") throw new HttpException(401, "Unauthorized");
      const decoded = await new JwtService().verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      );
      req.user = decoded as { email: string; roles: Role[] };
      next();
    } catch (err) {
      next(err);
    }
  }
  verifyRoles(allowedRoles: Role[]) {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
      if (!req.user || !req.user?.roles)
        throw new HttpException(403, "Forbidden");
      const hasRoles = req.user.roles.some((role) =>
        allowedRoles.includes(role)
      );
      if (!hasRoles) throw new HttpException(403, "Forbidden");
      next();
    };
  }
  verifyPermissions(permission: string) {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
      if (!req.user || !req.user?.roles)
        throw new HttpException(403, "Forbidden");
      const userPermissions = getPermissionsByRoles(req.user.roles);
      if (!userPermissions || !userPermissions.includes(permission))
        throw new HttpException(403, `You are forbidden to ${permission}`);
      next();
    };
  }
}
