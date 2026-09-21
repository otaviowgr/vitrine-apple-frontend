"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const CATEGORIAS = [
    { valor: "", rotulo: "Todos" },
    { valor: "IPHONE", rotulo: "iPhone" },
    { valor: "IPAD", rotulo: "iPad" },
    { valor: "MACBOOK", rotulo: "MacBook" },
    { valor: "APPLE_WATCH", rotulo: "Apple Watch" },
    { valor: "AIRPODS", rotulo: "AirPods" },
    { valor: "ACESSORIO", rotulo: "Acessórios" },
    { valor: "CABO_CARREGADOR", rotulo: "Cabos e carregadores" },
];

const CONDICOES = [
    { valor: "", rotulo: "Todas" },
    { valor: "LACRADO", rotulo: "Lacrado" },
    { valor: "NOVO", rotulo: "Novo" },
    { valor: "SEMINOVO", rotulo: "Seminovo" },
    { valor: "VITRINE", rotulo: "Ex-vitrine" },
];

const ARMAZENAMENTOS = [
    { valor: "", rotulo: "Todos" },
    { valor: "64", rotulo: "64 GB" },
    { valor: "128", rotulo: "128 GB" },
    { valor: "256", rotulo: "256 GB" },
    { valor: "512", rotulo: "512 GB" },
    { valor: "1024", rotulo: "1 TB" },
];

export default function FiltrosVitrine() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function atualizarFiltro(chave: string, valor: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (valor) {
            params.set(chave, valor);
        } else {
            params.delete(chave);
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1 text-[13px] text-neutral-500">
                Categoria
                <select
                    defaultValue={searchParams.get("categoria") ?? ""}
                    onChange={(e) => atualizarFiltro("categoria", e.target.value)}
                    className="rounded-full border border-neutral-200 px-4 py-2 text-[14px] text-[#1d1d1f]"
                >
                    {CATEGORIAS.map((c) => (
                        <option key={c.valor} value={c.valor}>{c.rotulo}</option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1 text-[13px] text-neutral-500">
                Condição
                <select
                    defaultValue={searchParams.get("condicao") ?? ""}
                    onChange={(e) => atualizarFiltro("condicao", e.target.value)}
                    className="rounded-full border border-neutral-200 px-4 py-2 text-[14px] text-[#1d1d1f]"
                >
                    {CONDICOES.map((c) => (
                        <option key={c.valor} value={c.valor}>{c.rotulo}</option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1 text-[13px] text-neutral-500">
                Armazenamento
                <select
                    defaultValue={searchParams.get("armazenamento") ?? ""}
                    onChange={(e) => atualizarFiltro("armazenamento", e.target.value)}
                    className="rounded-full border border-neutral-200 px-4 py-2 text-[14px] text-[#1d1d1f]"
                >
                    {ARMAZENAMENTOS.map((a) => (
                        <option key={a.valor} value={a.valor}>{a.rotulo}</option>
                    ))}
                </select>
            </label>
        </div>
    );
}