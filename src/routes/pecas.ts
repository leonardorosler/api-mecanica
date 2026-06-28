import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { autenticarToken, autorizarNivel, RequestComUsuario } from "../middlewares/auth";
import { registrarLog } from "../utils/registrarLog";

const router = Router();

const pecaSchema = z.object({
  nome_peca: z.string().min(2),
  qtd_estoque: z.number().int().positive(),
  preco_venda: z.number().positive()
});

// lista peças
router.get("/", async (req, res) => {
  try {
    const pecas = await prisma.peca.findMany()
    res.status(200).json(pecas)
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar peças" })
  }
})

// buscar por ID
router.get("/:id", async (req, res) => {
  try {
    const peca = await prisma.peca.findUnique({
      where: { id: Number(req.params.id) }
    })
    if (!peca) return res.status(404).json({ erro: "Peça não encontrada" })
    res.status(200).json(peca)
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar peça" })
  }
})

// cadastra 
router.post("/", autenticarToken, autorizarNivel(2), async (req, res) => {
  try {
    const valida = pecaSchema.safeParse(req.body)
    if (!valida.success) return res.status(400).json({ erro: valida.error })

    const peca = await prisma.peca.create({ data: valida.data })

    await registrarLog({
      usuarioId: (req as RequestComUsuario).usuario?.id,
      acao: "PECA_CADASTRADA",
      detalhes: `Peca ${peca.nome_peca} cadastrada`
    });

    res.status(201).json(peca)
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar peça" })
  }
})

// altera
router.put("/:id", autenticarToken, autorizarNivel(2), async (req, res) => {
  try {
    const valida = pecaSchema.safeParse(req.body)
    if (!valida.success) return res.status(400).json({ erro: valida.error })

    const peca = await prisma.peca.update({
      where: { id: Number(req.params.id) },
      data: valida.data
    })
    res.status(200).json(peca)
  } catch (error) {
    res.status(500).json({ erro: "Erro ao alterar peça" })
  }
})

// deleta
router.delete("/:id", autenticarToken, autorizarNivel(3), async (req, res) => {
  try {
    await prisma.peca.delete({ where: { id: Number(req.params.id) } })
    res.status(200).json({ mensagem: "Peça excluída com sucesso" })
  } catch (error) {
    res.status(500).json({ erro: "Erro ao excluir peça" })
  }
})


export default router;
