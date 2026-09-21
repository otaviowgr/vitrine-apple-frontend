"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Produto, Vendedor } from "@/types/produto";
import {
  construirLinkWhatsApp,
  formatarArmazenamento,
  formatarPreco,
  montarMensagemOrcamento,
} from "@/lib/whatsapp";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  produto: Produto;
  /** Se a pagina já carregou os vendedores (ex.: via SSR), passe aqui e o modal nao busca nada. */
  vendedores?: Vendedor[];
  /** Gancho para registrar a escolha (analytics, contador de leads por vendedor). */
  onVendedorEscolhido?: (vendedor: Vendedor) => void;
}

const SELETOR_FOCAVEIS =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ModalOrcamentoWhatsApp({
  aberto,
  onFechar,
  produto,
  vendedores: vendedoresProp,
  onVendedorEscolhido,
}: Props) {
  const [montado, setMontado] = useState(false);
  const [entrou, setEntrou] = useState(false);
  const [vendedores, setVendedores] = useState<Vendedor[]>(vendedoresProp ?? []);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);

  const painelRef = useRef<HTMLDivElement>(null);
  const focoAnteriorRef = useRef<HTMLElement | null>(null);

  // createPortal so existe no cliente; sem esta guarda o SSR quebra.
  useEffect(() => setMontado(true), []);

  const buscarVendedores = useCallback(async () => {
    setCarregando(true);
    setErro(false);
    try {
      const resposta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendedores`,
        { headers: { Accept: "application/json" } },
      );
      if (!resposta.ok) throw new Error(String(resposta.status));
      setVendedores(await resposta.json());
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Busca sob demanda: a vitrine pode ter 80 cards, e nenhum deles precisa
  // da lista de vendedores até alguém abrir o modal.
  useEffect(() => {
    if (aberto && !vendedoresProp && vendedores.length === 0 && !carregando) {
      void buscarVendedores();
    }
  }, [aberto, vendedoresProp, vendedores.length, carregando, buscarVendedores]);

  // Trava o scroll do fundo e compensa a largura da barra de rolagem,
  // senao o conteudo da pagina "pula" ao abrir no desktop.
  useEffect(() => {
    if (!aberto) return;

    const compensacao = window.innerWidth - document.documentElement.clientWidth;
    const overflowOriginal = document.body.style.overflow;
    const paddingOriginal = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (compensacao > 0) document.body.style.paddingRight = `${compensacao}px`;

    return () => {
      document.body.style.overflow = overflowOriginal;
      document.body.style.paddingRight = paddingOriginal;
    };
  }, [aberto]);

  // Esc fecha e Tab circula dentro do modal.
  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        onFechar();
        return;
      }
      if (evento.key !== "Tab" || !painelRef.current) return;

      const focaveis = Array.from(
        painelRef.current.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS),
      );
      if (focaveis.length === 0) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto, onFechar]);

  // Move o foco para dentro ao abrir e devolve para o botao de origem ao fechar.
  useEffect(() => {
    if (aberto) {
      focoAnteriorRef.current = document.activeElement as HTMLElement;
      const id = requestAnimationFrame(() => {
        setEntrou(true);
        painelRef.current
          ?.querySelector<HTMLElement>(SELETOR_FOCAVEIS)
          ?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
    setEntrou(false);
    focoAnteriorRef.current?.focus();
  }, [aberto]);

  if (!montado || !aberto) return null;

  const especificacoes = [
    formatarArmazenamento(produto.armazenamentoGb),
    produto.cor,
    produto.condicaoRotulo,
  ]
    .filter(Boolean)
    .join(" · ");

  const urlProduto =
      typeof window !== "undefined"
          ? `${window.location.origin}/produto/${produto.slug}`
          : undefined;

  const aoEscolher = (vendedor: Vendedor) => {
    onVendedorEscolhido?.(vendedor);
    onFechar();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-orcamento"
    >
      {/* Fundo. Clique fora fecha. */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onFechar}
        className={`absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
          entrou ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={painelRef}
        className={`relative w-full max-w-md rounded-t-[28px] bg-white shadow-2xl transition-all duration-300 ease-out motion-reduce:transition-none sm:rounded-[28px] ${
          entrou
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-6 opacity-0 sm:translate-y-0 sm:scale-95"
        }`}
      >
        {/* Alca visual do bottom sheet no celular. */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-neutral-300 sm:hidden" />

        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="absolute right-4 top-4 hidden h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] sm:flex"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        </button>

        <div className="px-6 pb-6 pt-6 sm:pt-8">
          {/* Resumo do que o cliente esta pedindo. Confirma a escolha antes do salto. */}
          <div className="flex items-center gap-4 rounded-2xl bg-[#f5f5f7] p-3">
            {produto.imagens[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={produto.imagens[0].url}
                alt={produto.imagens[0].textoAlternativo ?? produto.nome}
                className="h-14 w-14 rounded-xl object-contain"
                loading="lazy"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-[#1d1d1f]">
                {produto.nome}
              </p>
              <p className="truncate text-[13px] text-neutral-500">
                {especificacoes}
              </p>
              <p className="text-[15px] font-semibold text-[#1d1d1f]">
                {formatarPreco(produto.precoVigente)}
              </p>
            </div>
          </div>

          <h2
            id="titulo-orcamento"
            className="mt-6 text-[22px] font-semibold leading-tight tracking-tight text-[#1d1d1f]"
          >
            Escolha com quem falar
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-neutral-500">
            A conversa abre no WhatsApp com a mensagem pronta. É só enviar.
          </p>

          <div className="mt-5 space-y-2">
            {carregando && (
              <>
                <EsqueletoVendedor />
                <EsqueletoVendedor />
              </>
            )}

            {erro && (
              <div className="rounded-2xl border border-neutral-200 p-5 text-center">
                <p className="text-[14px] text-[#1d1d1f]">
                  A lista de vendedores nao carregou.
                </p>
                <button
                  type="button"
                  onClick={() => void buscarVendedores()}
                  className="mt-3 rounded-full bg-[#1d1d1f] px-5 py-2 text-[14px] font-medium text-white transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
                >
                  Tentar de novo
                </button>
              </div>
            )}

            {!carregando && !erro && vendedores.length === 0 && (
              <div className="rounded-2xl border border-neutral-200 p-5 text-center text-[14px] leading-relaxed text-neutral-500">
                Nenhum vendedor esta online agora. Mande uma mensagem pelo
                Instagram da loja que respondemos assim que abrir.
              </div>
            )}

            {vendedores.map((vendedor) => {
              const mensagem = montarMensagemOrcamento({
                produto,
                vendedor,
                urlProduto,
              });

              return (
                /*
                 * Ancora, nao window.open(). Navegador de celular bloqueia popup
                 * aberto por script com frequencia; <a target="_blank"> em clique
                 * direto sempre passa, e ainda permite abrir em nova aba no desktop.
                 */
                <a
                  key={vendedor.id}
                  href={construirLinkWhatsApp(vendedor.whatsapp, mensagem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => aoEscolher(vendedor)}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-200 p-3 transition-colors hover:border-neutral-300 hover:bg-[#f5f5f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
                >
                  {vendedor.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={vendedor.fotoUrl}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[15px] font-medium text-neutral-500">
                      {vendedor.nome.charAt(0).toUpperCase()}
                    </span>
                  )}

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-[#1d1d1f]">
                      {vendedor.nome}
                    </span>
                    {vendedor.apresentacao && (
                      <span className="block truncate text-[13px] text-neutral-500">
                        {vendedor.apresentacao}
                      </span>
                    )}
                  </span>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.06c-.24.68-1.2 1.26-1.97 1.42-.53.11-1.21.2-3.51-.75-2.95-1.22-4.85-4.21-5-4.4-.14-.2-1.19-1.58-1.19-3.02 0-1.43.75-2.14 1.02-2.43.27-.29.58-.37.78-.37.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.83 2.01.9 2.16.07.14.12.31.02.51-.09.2-.14.32-.28.49-.14.17-.3.38-.42.51-.14.14-.29.29-.12.58.16.29.73 1.2 1.56 1.95 1.07.95 1.98 1.25 2.27 1.39.29.14.46.12.63-.07.17-.2.72-.84.91-1.13.19-.29.39-.24.65-.14.27.09 1.69.8 1.98.94.29.14.48.22.55.34.07.12.07.7-.17 1.38z" />
                    </svg>
                  </span>
                </a>
              );
            })}
          </div>

          <p className="mt-5 text-center text-[12px] leading-relaxed text-neutral-400">
            Preço válido para pagamento à vista. Parcelamento e trocas sâo
            combinados direto com o vendedor.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function EsqueletoVendedor() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 p-3">
      <span className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-neutral-200" />
      <span className="flex-1 space-y-2">
        <span className="block h-3 w-28 animate-pulse rounded bg-neutral-200" />
        <span className="block h-3 w-20 animate-pulse rounded bg-neutral-100" />
      </span>
    </div>
  );
}
