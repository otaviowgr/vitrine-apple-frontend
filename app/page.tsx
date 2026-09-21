/*import BotaoOrcamento from "@/components/orcamento/BotaoOrcamento";
import type { Produto } from "@/types/produto";

const produtoTeste: Produto = {
  id: 1,
  nome: "iPhone 13 Pro",
  slug: "iphone-13-pro-256gb-grafite",
  categoria: "IPHONE",
  categoriaRotulo: "iPhone",
  condicao: "SEMINOVO",
  condicaoRotulo: "Seminovo",
  preco: 4200,
  precoPromocional: null,
  precoVigente: 4200,
  armazenamentoGb: 256,
  cor: "Grafite",
  marcasDeUso: "Sem marcas visíveis",
  descricao: "iPhone 13 Pro seminovo, bateria 92%",
  saudeBateria: 92,
  garantia: "3 meses de garantia da loja",
  status: "DISPONIVEL",
  destaque: true,
  imagens: [],
  pecasTrocadas: [],
};

export default function Home() {
  return (
      <main className="mx-auto mt-20 max-w-sm p-6">
        <h1 className="mb-4 text-2xl font-semibold text-[#1d1d1f]">
          {produtoTeste.nome}
        </h1>
        <BotaoOrcamento produto={produtoTeste} />
      </main>
  );
}*/

/*import BotaoOrcamento from "@/components/orcamento/BotaoOrcamento";
import type { Produto } from "@/types/produto";
import { formatarArmazenamento, formatarPreco } from "@/lib/whatsapp";

async function buscarProdutos(): Promise<Produto[]> {
    try {
        const resposta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/produtos`, {
            cache: "no-store",
        });
        if (!resposta.ok) return [];
        return await resposta.json();
    } catch {
        return [];
    }
}

export default async function Home() {
    const produtos = await buscarProdutos();

    return (
        <main className="mx-auto max-w-5xl p-6">
            <h1 className="mb-6 text-2xl font-semibold text-[#1d1d1f]">Vitrine</h1>

            {produtos.length === 0 ? (
                <p className="text-neutral-500">Nenhum produto disponível no momento.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {produtos.map((produto) => (
                        <div key={produto.id} className="rounded-2xl border border-neutral-200 p-4">
                            <p className="text-[15px] font-medium text-[#1d1d1f]">{produto.nome}</p>
                            <p className="mb-1 text-[13px] text-neutral-500">
                                {[formatarArmazenamento(produto.armazenamentoGb), produto.cor, produto.condicaoRotulo]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </p>
                            <p className="mb-3 text-[15px] font-semibold text-[#1d1d1f]">
                                {formatarPreco(produto.precoVigente)}
                            </p>
                            <BotaoOrcamento produto={produto} />
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}*/

import { Suspense } from "react";
import BotaoOrcamento from "@/components/orcamento/BotaoOrcamento";
import FiltrosVitrine from "@/components/produto/FiltrosVitrine";
import type { Produto } from "@/types/produto";
import { formatarArmazenamento, formatarPreco } from "@/lib/whatsapp";

interface ProdutosSearchParams {
    categoria?: string;
    condicao?: string;
    armazenamento?: string;
}

async function buscarProdutos(filtros: ProdutosSearchParams): Promise<Produto[]> {
    const params = new URLSearchParams();
    if (filtros.categoria) params.set("categoria", filtros.categoria);
    if (filtros.condicao) params.set("condicao", filtros.condicao);
    if (filtros.armazenamento) params.set("armazenamento", filtros.armazenamento);

    try {
        const resposta = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/produtos?${params.toString()}`,
            { cache: "no-store" },
        );
        if (!resposta.ok) return [];
        return await resposta.json();
    } catch {
        return [];
    }
}

export default async function Home({
                                       searchParams,
                                   }: {
    searchParams: Promise<ProdutosSearchParams>;
}) {
    const filtros = await searchParams;
    const produtos = await buscarProdutos(filtros);

    return (
        <main className="mx-auto max-w-5xl p-6">
            <h1 className="mb-6 text-2xl font-semibold text-[#1d1d1f]">Vitrine</h1>

            <Suspense fallback={null}>
                <FiltrosVitrine />
            </Suspense>

            {produtos.length === 0 ? (
                <p className="mt-6 text-neutral-500">Nenhum produto encontrado com esses filtros.</p>
            ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {produtos.map((produto) => (
                        <div key={produto.id} className="rounded-2xl border border-neutral-200 p-4">
                            <p className="text-[15px] font-medium text-[#1d1d1f]">{produto.nome}</p>
                            <p className="mb-1 text-[13px] text-neutral-500">
                                {[formatarArmazenamento(produto.armazenamentoGb), produto.cor, produto.condicaoRotulo]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </p>
                            <p className="mb-3 text-[15px] font-semibold text-[#1d1d1f]">
                                {formatarPreco(produto.precoVigente)}
                            </p>
                            <BotaoOrcamento produto={produto} />
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}