"use client";

import { useState } from "react";
import type { Produto, Vendedor } from "@/types/produto";
import ModalOrcamentoWhatsApp from "./ModalOrcamentoWhatsApp";

interface Props {
  produto: Produto;
  vendedores?: Vendedor[];
  /** "principal" no hero e na pagina do produto, "secundario" dentro dos cards da vitrine. */
  variante?: "principal" | "secundario";
  className?: string;
}

/**
 * Encapsula botao + modal para a vitrine so precisar de <BotaoOrcamento produto={p} />.
 * O estado de abertura fica aqui e nao sobe para a pagina.
 */
export default function BotaoOrcamento({
  produto,
  vendedores,
  variante = "principal",
  className = "",
}: Props) {
  const [aberto, setAberto] = useState(false);
  const indisponivel = produto.status === "VENDIDO" || produto.status === "OCULTO";

  const estilos =
    variante === "principal"
      ? "bg-[#1d1d1f] text-white hover:opacity-85"
      : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-neutral-200";

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        disabled={indisponivel}
        className={`w-full rounded-full px-6 py-3 text-[15px] font-medium transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 ${estilos} ${className}`}
      >
        {indisponivel ? "Vendido" : "Fazer orcamento"}
      </button>

      <ModalOrcamentoWhatsApp
        aberto={aberto}
        onFechar={() => setAberto(false)}
        produto={produto}
        vendedores={vendedores}
        onVendedorEscolhido={(vendedor) => {
          // Troque pelo seu analytics. Serve para o dashboard responder
          // "quantos leads cada vendedor recebeu este mes".
          void fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ produtoId: produto.id, vendedorId: vendedor.id }),
            keepalive: true,
          }).catch(() => {
            /* lead perdido nao pode travar o redirecionamento */
          });
        }}
      />
    </>
  );
}
