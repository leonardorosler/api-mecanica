import { Router } from "express";
import { prisma } from "../../lib/prisma";
import z from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1)
});

const jwtSecret = process.env.JWT_SECRET || "segredo-dev-oficina";

// login de usuario
router.post("/", async (req, res) => {
  try {
    const valida = loginSchema.safeParse(req.body);
    if (!valida.success) return res.status(400).json({ erro: valida.error });

    const usuario = await prisma.usuario.findUnique({
      where: { email: valida.data.email }
    });

    if (!usuario) {
      return res.status(401).json({ erro: "E-mail ou senha invalidos" });
    }

    const senhaValida = await bcrypt.compare(valida.data.senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: "E-mail ou senha invalidos" });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nivel: usuario.nivel
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      mensagem: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivel: usuario.nivel
      }
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao realizar login" });
  }
});

export default router;
