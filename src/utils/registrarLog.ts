import { prisma } from "../../lib/prisma";

type DadosLog = {
  usuarioId?: number | null;
  acao: string;
  detalhes?: string;
};

export async function registrarLog({ usuarioId, acao, detalhes }: DadosLog) {
  try {
    await prisma.log.create({
      data: {
        usuarioId,
        acao,
        detalhes
      }
    });
  } catch (error) {
    console.error("Erro ao registrar log:", error);
  }
}
