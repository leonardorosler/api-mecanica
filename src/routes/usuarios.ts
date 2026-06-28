import { Router } from "express";
import { prisma } from "../../lib/prisma";
import z from "zod";
import bcrypt from "bcryptjs";

const router = Router();

const usuarioSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string()
    .min(8, "A senha deve ter no minimo 8 caracteres")
    .regex(/[a-z]/, "A senha deve ter pelo menos uma letra minuscula")
    .regex(/[A-Z]/, "A senha deve ter pelo menos uma letra maiuscula")
    .regex(/[0-9]/, "A senha deve ter pelo menos um numero")
    .regex(/[^A-Za-z0-9]/, "A senha deve ter pelo menos um simbolo"),
  nivel: z.number().int().min(1).max(3).optional()
});

// lista usuarios
router.get("/", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        ultimoLogin: true,
        createdAt: true
      }
    });

    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar usuarios" });
  }
});

// cadastra usuario
router.post("/", async (req, res) => {
  try {
    const valida = usuarioSchema.safeParse(req.body);
    if (!valida.success) return res.status(400).json({ erro: valida.error });

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: valida.data.email }
    });

    if (usuarioExistente) {
      return res.status(409).json({ erro: "Ja existe um usuario cadastrado com este e-mail" });
    }

    const senhaCriptografada = await bcrypt.hash(valida.data.senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        ...valida.data,
        senha: senhaCriptografada
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        ultimoLogin: true,
        createdAt: true
      }
    });

    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar usuario" });
  }
});

export default router;
