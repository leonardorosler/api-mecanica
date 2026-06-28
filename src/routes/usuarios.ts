import { Router } from "express";
import { prisma } from "../../lib/prisma";
import z from "zod";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { randomInt } from "crypto";
import { registrarLog } from "../utils/registrarLog";

const router = Router();

const senhaForteSchema = z.string()
  .min(8, "A senha deve ter no minimo 8 caracteres")
  .regex(/[a-z]/, "A senha deve ter pelo menos uma letra minuscula")
  .regex(/[A-Z]/, "A senha deve ter pelo menos uma letra maiuscula")
  .regex(/[0-9]/, "A senha deve ter pelo menos um numero")
  .regex(/[^A-Za-z0-9]/, "A senha deve ter pelo menos um simbolo");

const usuarioSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: senhaForteSchema,
  nivel: z.number().int().min(1).max(3).optional()
});

const recuperarSenhaSchema = z.object({
  email: z.string().email()
});

const alterarSenhaRecuperacaoSchema = z.object({
  email: z.string().email(),
  codigo: z.string().length(6),
  novaSenha: senhaForteSchema
});

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
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

// solicita recuperacao de senha
router.post("/recuperar-senha", async (req, res) => {
  try {
    const valida = recuperarSenhaSchema.safeParse(req.body);
    if (!valida.success) return res.status(400).json({ erro: valida.error });

    const usuario = await prisma.usuario.findUnique({
      where: { email: valida.data.email }
    });

    if (!usuario) {
      return res.status(404).json({ erro: "Usuario nao encontrado" });
    }

    const codigo = randomInt(100000, 1000000).toString();
    const codigoExpiraEm = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        codigoRecuperacao: codigo,
        codigoExpiraEm
      }
    });

    await transporter.sendMail({
      from: '"OficinaAvenida" <oficina@sistema.com>',
      to: usuario.email,
      subject: "Codigo de recuperacao de senha",
      html: `
        <p>Ola, ${usuario.nome}.</p>
        <p>Seu codigo de recuperacao de senha e: <strong>${codigo}</strong></p>
        <p>Este codigo expira em 15 minutos.</p>
      `
    });

    await registrarLog({
      usuarioId: usuario.id,
      acao: "RECUPERACAO_SENHA_SOLICITADA",
      detalhes: `Codigo enviado para ${usuario.email}`
    });

    res.status(200).json({ mensagem: "Codigo de recuperacao enviado por e-mail" });
  } catch (error: any) {
    res.status(500).json({ erro: "Erro ao solicitar recuperacao de senha: " + error.message });
  }
});

// altera senha usando codigo de recuperacao
router.post("/alterar-senha-recuperacao", async (req, res) => {
  try {
    const valida = alterarSenhaRecuperacaoSchema.safeParse(req.body);
    if (!valida.success) return res.status(400).json({ erro: valida.error });

    const usuario = await prisma.usuario.findUnique({
      where: { email: valida.data.email }
    });

    if (!usuario) {
      return res.status(404).json({ erro: "Usuario nao encontrado" });
    }

    if (!usuario.codigoRecuperacao || !usuario.codigoExpiraEm) {
      return res.status(400).json({ erro: "Nao existe codigo de recuperacao ativo" });
    }

    if (usuario.codigoRecuperacao !== valida.data.codigo) {
      return res.status(400).json({ erro: "Codigo de recuperacao invalido" });
    }

    if (usuario.codigoExpiraEm < new Date()) {
      return res.status(400).json({ erro: "Codigo de recuperacao expirado" });
    }

    const senhaCriptografada = await bcrypt.hash(valida.data.novaSenha, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senha: senhaCriptografada,
        codigoRecuperacao: null,
        codigoExpiraEm: null
      }
    });

    await registrarLog({
      usuarioId: usuario.id,
      acao: "SENHA_ALTERADA_POR_RECUPERACAO",
      detalhes: `Senha alterada por codigo de recuperacao para ${usuario.email}`
    });

    res.status(200).json({ mensagem: "Senha alterada com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao alterar senha" });
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

    await registrarLog({
      usuarioId: usuario.id,
      acao: "USUARIO_CADASTRADO",
      detalhes: `Usuario ${usuario.email} cadastrado`
    });

    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar usuario" });
  }
});

export default router;
