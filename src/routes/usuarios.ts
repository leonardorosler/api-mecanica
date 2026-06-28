import { Router } from "express";
import { prisma } from "../../lib/prisma";
import z from "zod";

const router = Router();

const usuarioSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(1),
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

    const usuario = await prisma.usuario.create({
      data: valida.data,
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
