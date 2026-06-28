import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "segredo-dev-oficina";

export type UsuarioToken = {
  id: number;
  email: string;
  nivel: number;
};

export type RequestComUsuario = Request & {
  usuario?: UsuarioToken;
};

export function autenticarToken(req: RequestComUsuario, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token nao informado" });
  }

  const [tipo, token] = authHeader.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ erro: "Token invalido" });
  }

  try {
    const dados = jwt.verify(token, jwtSecret) as UsuarioToken;
    req.usuario = dados;
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token invalido ou expirado" });
  }
}
