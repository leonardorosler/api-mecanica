import { Router } from "express";
import { prisma } from "../../lib/prisma";
import z from "zod";
import nodemailer from "nodemailer";
import { autenticarToken } from "../middlewares/auth";

const router = Router();

const consertoSchema = z.object({
  carro_modelo: z.string().min(2),
  mecanicoId: z.number().int().positive()
})

const itemSchema = z.object({
  pecaId: z.number().int().positive(),
  quant_usada: z.number().int().min(1),
  preco_unit: z.number().positive()
});

const transporter = nodemailer.createTransport({ 
  host: "sandbox.smtp.mailtrap.io", 
  port: 587, 
  secure: false, 
  auth: { 
    user: process.env.MAILTRAP_USER, 
    pass: process.env.MAILTRAP_PASS 
  },
  // resolve bug email - não remover
  tls: {
    rejectUnauthorized: false
  }
});

// lista consertos
router.get("/", async (req, res) => {
  try {
    const consertos = await prisma.conserto.findMany({
      include: { mecanico: true, itens: { include: { peca: true } } }
    });
    res.status(200).json(consertos);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar consertos" });
  }
});

// buscar por ID
router.get("/:id", async (req, res) => {
  try {
    const conserto = await prisma.conserto.findUnique({
      where: { id: Number(req.params.id) },
      include: { mecanico: true, itens: { include: { peca: true } } }
    })
    if (!conserto) return res.status(404).json({ erro: "Conserto não encontrado" })
    res.status(200).json(conserto)
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar conserto" })
  }
})

// cria conserto
router.post("/", autenticarToken, async (req, res) => {
  try {
    const valida = consertoSchema.safeParse(req.body)
    if (!valida.success) return res.status(400).json({ erro: valida.error })

    const conserto = await prisma.conserto.create({
      data: valida.data,
      include: { mecanico: true }
    })
    res.status(201).json(conserto)
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar conserto" })
  }
})

// deleta conserto
router.delete("/:id", async (req, res) => {
  try {
    await prisma.conserto.delete({ where: { id: Number(req.params.id) } })
    res.status(200).json({ mensagem: "Conserto excluído com sucesso" })
  } catch (error) {
    res.status(500).json({ erro: "Erro ao excluir conserto" })
  }
})

// listar itens de um conserto
router.get("/:id/itens", async (req, res) => {
  try {
    const itens = await prisma.itemConserto.findMany({
      where: { consertoId: Number(req.params.id) },
      include: { peca: true }
    })
    res.status(200).json(itens)
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar itens" })
  }
})

// incluir item ao conserto — transação
// verifica estoque → insere item → desconta estoque
// se estoque insuficiente → rollback automático
router.post("/:id/itens", autenticarToken, async (req, res) => {
  try {
    const valida = itemSchema.safeParse(req.body)
    if (!valida.success) return res.status(400).json({ erro: valida.error })

    const { pecaId, quant_usada, preco_unit } = valida.data
    const consertoId = Number(req.params.id)

    const item = await prisma.$transaction(async (tx: any) => {

      // 1. verifica se a peça existe e tem estoque
      const peca = await tx.peca.findUnique({ where: { id: pecaId } })
      if (!peca) throw new Error("Peça não encontrada")
      if (peca.qtd_estoque < quant_usada) {
        throw new Error(`Estoque insuficiente. Disponível: ${peca.qtd_estoque}`)
      }
      // 2. insere o item
      const novoItem = await tx.itemConserto.create({
        data: { consertoId, pecaId, quant_usada, preco_unit },
        include: { peca: true }
      })
      // 3. desconta do estoque
      await tx.peca.update({
        where: { id: pecaId },
        data: { qtd_estoque: { decrement: quant_usada }}
      })
      return novoItem
    })
    res.status(201).json(item)
  } catch (error: any) {
    res.status(400).json({ erro: error.message || "Erro ao incluir item" })
  }
})

// deleta item — transação sequencial
// exclui item → devolve quantidade ao estoque
router.delete("/:consertoId/itens/:itemId", async (req, res) => {
  try {
    const itemId = Number(req.params.itemId)

    const item = await prisma.itemConserto.findUnique({ where: { id: itemId } })
    if (!item) return res.status(404).json({ erro: "Item não encontrado" })

    await prisma.$transaction([
      // 1. deleta
      prisma.itemConserto.delete({ where: { id: itemId } }),
      // 2. devolve qtd_estoque
      prisma.peca.update({
        where: { id: item.pecaId },
        data: { qtd_estoque: { increment: item.quant_usada } }
      })
    ])

    res.status(200).json({ mensagem: "Item excluído e estoque devolvido" })
  } catch (error) {
    res.status(500).json({ erro: "Erro ao excluir item" })
  }
})

//rota email
router.get("/email/:id", async (req, res) => {
  try {
    const conserto = await prisma.conserto.findUnique({
      where: { id: Number(req.params.id) },
      include: { mecanico: true, itens: { include: { peca: true } } }
    });

    if (!conserto) return res.status(404).json({ erro: "Conserto não encontrado" });

    const htmlMensagem = gerarTabelaHTML(conserto);

    await transporter.sendMail({
      from: '"OficinaAvenida" <oficina@sistema.com>',
      to: conserto.mecanico.email,
      subject: `Resumo do Conserto #${conserto.id} - ${conserto.carro_modelo}`,
      html: htmlMensagem,
    });

    res.status(200).json({ mensagem: `E-mail enviado para ${conserto.mecanico.email}` });
  } catch (error: any) {
    res.status(500).json({ erro: "Erro ao enviar e-mail: " + error.message });
  }
});

// gera tabela para email
function gerarTabelaHTML(conserto: any) {
  let totalGeral = 0;
  const linhas = conserto.itens.map((item: any) => {
    const subtotal = Number(item.preco_unit) * item.quant_usada;
    totalGeral += subtotal;
    
    return `
      <tr>
        <td style="padding:8px; border:1px solid #ddd">${item.peca.nome_peca}</td>
        <td style="padding:8px; border:1px solid #ddd; text-align:center">${item.quant_usada}</td>
        <td style="padding:8px; border:1px solid #ddd; text-align:right">
          R$ ${Number(item.preco_unit).toLocaleString("pt-br", { minimumFractionDigits: 2 })}
        </td>
        <td style="padding:8px; border:1px solid #ddd; text-align:right">
          R$ ${subtotal.toLocaleString("pt-br", { minimumFractionDigits: 2 })}
        </td>
      </tr>`;
  }).join("");

  return `
    <html>
      <body style="font-family: Helvetica, Arial, sans-serif;">
        <h2>OficinaAvenida: Relatório de Peças e Serviços</h2>
        <h3>Veículo: ${conserto.carro_modelo}</h3>
        <h3>Mecânico Responsável: ${conserto.mecanico.nome}</h3>
        <p>Data do Serviço: ${new Date(conserto.data).toLocaleDateString("pt-BR")}</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead style="background-color: #f2f2f2;">
            <tr>
              <th>Peça / Componente</th>
              <th>Quantidade</th>
              <th>Valor Unitário</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
          <tfoot>
            <tr style="font-weight: bold; background-color: #eee;">
              <td colspan="3" style="text-align: right;">Total Geral:</td>
              <td style="text-align: right;">
                R$ ${totalGeral.toLocaleString("pt-br", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>`;
}

export default router;
