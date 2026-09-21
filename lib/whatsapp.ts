import type { Produto, Vendedor } from "@/types/produto";

/**
 * Toda a regra de montagem do link do WhatsApp mora aqui, fora do componente.
 * Assim da para testar a mensagem sem renderizar React, e a mesma funcao serve
 * ao card do produto, ao botao do hero e ao banner de assistencia tecnica.
 */

const FORMATADOR_BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarPreco(valor: number): string {
  return FORMATADOR_BRL.format(valor);
}

/** 128 -> "128 GB" | 1024 -> "1 TB" | null -> "" */
export function formatarArmazenamento(gb: number | null | undefined): string {
  if (!gb) return "";
  return gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`;
}

/** Remove tudo que nao for digito e garante o DDI 55. */
export function normalizarNumero(numero: string): string {
  const digitos = numero.replace(/\D/g, "");
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}

/** 5548999998888 -> "(48) 99999-8888" */
export function formatarNumeroExibicao(numero: string): string {
  const d = normalizarNumero(numero).slice(2);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return numero;
}

interface OpcoesMensagem {
  produto: Produto;
  vendedor?: Pick<Vendedor, "nome">;
  /** URL canonica do produto, anexada no fim para o vendedor abrir o anuncio. */
  urlProduto?: string;
}

/**
 * Monta a mensagem que ja vai preenchida na conversa.
 *
 * Duas decisoes de conversao aqui:
 * 1. O primeiro nome do vendedor abre a frase — a mensagem chega parecendo
 *    escrita pelo cliente, nao disparada por robo.
 * 2. Termina com pergunta direta ("Ainda esta disponivel?"). Mensagem que
 *    termina em pergunta e respondida mais rapido do que uma declaracao.
 */
export function montarMensagemOrcamento({
  produto,
  vendedor,
}: OpcoesMensagem): string {
  const primeiroNome = vendedor?.nome.trim().split(/\s+/)[0];
  const saudacao = primeiroNome ? `Olá, ${primeiroNome}!` : "Olá!";

  const especificacoes = [
    formatarArmazenamento(produto.armazenamentoGb),
    produto.cor,
    produto.condicaoRotulo,
  ]
    .filter(Boolean)
    .join(" · ");

  const descricao = especificacoes
    ? `${produto.nome} (${especificacoes})`
    : produto.nome;

  const linhas = [
    `${saudacao} Vi no site o ${descricao} por ${formatarPreco(produto.precoVigente)}.`,
    "Ainda está disponível?",
  ];

  return linhas.join("\n");
}

/**
 * Link oficial de clique-para-conversar. Funciona no app instalado,
 * no WhatsApp Web e no navegador do celular sem tratamento extra.
 */
export function construirLinkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${normalizarNumero(numero)}?text=${encodeURIComponent(mensagem)}`;
}

/** Atalho usado pelo banner e pelo item de menu "Assistencia tecnica". */
export function linkAssistenciaTecnica(
  numero: string,
  mensagem = "Olá! Preciso de um orçamento de assistência técnica.",
): string {
  return construirLinkWhatsApp(numero, mensagem);
}
