import { prisma } from "../../lib/prisma";
import { Router } from "express";
import z from "zod";

const router = Router()

const mecanicoSchema = z.object({
  nome: z.string().min(2),
  especialidade: z.string().min(2),
  email: z.string().email()
})

// busca mecanicos
router.get("/", async (req, res) => {
  try {
    const mecanicos = await prisma.mecanico.findMany()
    res.status(200).json(mecanicos)
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar mecânicos" })
  }
})

// busca por ID 
router.get("/:id", async (req, res) => {
  try {
    const mecanico = await prisma.mecanico.findUnique({
      where: { id: Number(req.params.id) }
    })
    if (!mecanico) return res.status(404).json({ erro: "Mecânico não encontrado" })
    res.status(200).json(mecanico)
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar mecânico" })
  }
})

// cadastra
router.post("/", async (req, res) => {
  try {
    const valida = mecanicoSchema.safeParse(req.body)
    if (!valida.success) return res.status(400).json({ erro: valida.error })

    const mecanico = await prisma.mecanico.create({ data: valida.data })
    res.status(201).json(mecanico)
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar mecânico" })
  }
})

// alterar
router.put("/:id", async (req, res) => {
  try {
    const valida = mecanicoSchema.safeParse(req.body)
    if (!valida.success) return res.status(400).json({ erro: valida.error })

    const mecanico = await prisma.mecanico.update({
      where: { id: Number(req.params.id) },
      data: valida.data
    })
    res.status(200).json(mecanico)
  } catch (error) {
    res.status(500).json({ erro: "Erro ao alterar mecânico" })
  }
})

// deleta
router.delete("/:id", async (req, res) => {
  try {
    await prisma.mecanico.delete({ where: { id: Number(req.params.id) } })
    res.status(200).json({ mensagem: "Mecânico excluído com sucesso" })
  } catch (error) {
    res.status(500).json({ erro: "Erro ao excluir mecânico" })
  }
})

export default router