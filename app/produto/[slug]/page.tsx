/*import { notFound } from "next/navigation";
import Link from "next/link";
import BotaoOrcamento from "@/components/orcamento/BotaoOrcamento";
import CarrosselImagens from "@/components/produto/CarrosselImagens";
import type { Produto } from "@/types/produto";
import { formatarArmazenamento, formatarPreco } from "@/lib/whatsapp";

const ROTULOS_ORIGEM: Record<string, string> = {
    ORIGINAL: "original",
    ORIGINAL_RETIRADA: "original retirada de outro aparelho",
    PARALELA: "paralela",
};

async function buscarProduto(slug: string): Promise<Produto | null> {
    try {
        const resposta = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/produtos/${slug}`,
            { cache: "no-store" },
        );
        if (!resposta.ok) return null;
        return await resposta.json();
    } catch {
        return null;
    }
}

export default async function PaginaProduto({
                                                params,
                                            }: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const produto = await buscarProduto(slug);

    if (!produto) notFound();

    const especificacoes = [
        formatarArmazenamento(produto.armazenamentoGb),
        produto.cor,
        produto.condicaoRotulo,
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <main className="mx-auto max-w-3xl p-6">
            <Link href="/" className="text-[14px] text-neutral-500 hover:text-[#1d1d1f]">
                ← Voltar pra vitrine
            </Link>

            <div className="mt-4 grid gap-8 sm:grid-cols-2">
                <CarrosselImagens imagens={produto.imagens} nomeProduto={produto.nome} />

                <div>
                    <h1 className="text-2xl font-semibold text-[#1d1d1f]">{produto.nome}</h1>
                    <p className="mt-1 text-[15px] text-neutral-500">{especificacoes}</p>

                    <div className="mt-4">
                        {produto.precoPromocional && (
                            <p className="text-[15px] text-neutral-400 line-through">
                                {formatarPreco(produto.preco)}
                            </p>
                        )}
                        <p className="text-[28px] font-semibold text-[#1d1d1f]">
                            {formatarPreco(produto.precoVigente)}
                        </p>
                    </div>

                    {produto.saudeBateria != null && (
                        <div className="mt-6">
                            <p className="mb-1 text-[13px] text-neutral-500">Saúde da bateria</p>
                            <div className="h-2 w-full rounded-full bg-neutral-100">
                                <div
                                    className="h-2 rounded-full bg-[#1d1d1f]"
                                    style={{ width: `${produto.saudeBateria}%` }}
                                />
                            </div>
                            <p className="mt-1 text-[13px] font-medium text-[#1d1d1f]">
                                {produto.saudeBateria}%
                            </p>
                        </div>
                    )}

                    {produto.marcasDeUso && (
                        <div className="mt-6">
                            <p className="mb-1 text-[13px] font-medium text-[#1d1d1f]">Marcas de uso</p>
                            <p className="text-[14px] text-neutral-600">{produto.marcasDeUso}</p>
                        </div>
                    )}

                    {produto.descricao && (
                        <div className="mt-6">
                            <p className="mb-1 text-[13px] font-medium text-[#1d1d1f]">Descrição</p>
                            <p className="text-[14px] text-neutral-600">{produto.descricao}</p>
                        </div>
                    )}

                    {produto.garantia && (
                        <p className="mt-6 text-[13px] text-neutral-500">Garantia: {produto.garantia}</p>
                    )}

                    {produto.pecasTrocadas.length > 0 && (
                        <div className="mt-6">
                            <p className="mb-2 text-[13px] font-medium text-[#1d1d1f]">Peças trocadas</p>
                            <ul className="space-y-1">
                                {produto.pecasTrocadas.map((peca) => (
                                    <li key={peca.id} className="text-[14px] text-neutral-600">
                                        {peca.peca} — {ROTULOS_ORIGEM[peca.origem] ?? peca.origem}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mt-8">
                        <BotaoOrcamento produto={produto} />
                    </div>
                </div>
            </div>
        </main>
    );
}*/

import { Suspense } from "react";
import Link from "next/link";
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
                            <Link href={`/produto/${produto.slug}`} className="block">
                                <p className="text-[15px] font-medium text-[#1d1d1f] hover:underline">
                                    {produto.nome}
                                </p>
                                <p className="mb-1 text-[13px] text-neutral-500">
                                    {[formatarArmazenamento(produto.armazenamentoGb), produto.cor, produto.condicaoRotulo]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </p>
                                <p className="mb-3 text-[15px] font-semibold text-[#1d1d1f]">
                                    {formatarPreco(produto.precoVigente)}
                                </p>
                            </Link>
                            <BotaoOrcamento produto={produto} />
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}