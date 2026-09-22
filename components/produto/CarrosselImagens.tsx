"use client";

import { useState } from "react";
import type { ImagemProduto } from "@/types/produto";

interface Props {
    imagens: ImagemProduto[];
    nomeProduto: string;
}

export default function CarrosselImagens({ imagens, nomeProduto }: Props) {
    const [indice, setIndice] = useState(0);

    if (imagens.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#f5f5f7] text-[14px] text-neutral-400">
                Sem foto ainda
            </div>
        );
    }

    const imagemAtual = imagens[indice];

    return (
        <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f5f5f7]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imagemAtual.url}
                    alt={imagemAtual.textoAlternativo ?? nomeProduto}
                    className="h-full w-full object-contain"
                />

                {imagens.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => setIndice((i) => (i === 0 ? imagens.length - 1 : i - 1))}
                            aria-label="Foto anterior"
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={() => setIndice((i) => (i === imagens.length - 1 ? 0 : i + 1))}
                            aria-label="Próxima foto"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            {imagens.length > 1 && (
                <div className="mt-3 flex justify-center gap-2">
                    {imagens.map((img, i) => (
                        <button
                            key={img.id}
                            type="button"
                            onClick={() => setIndice(i)}
                            aria-label={`Ver foto ${i + 1}`}
                            className={`h-2 w-2 rounded-full ${i === indice ? "bg-[#1d1d1f]" : "bg-neutral-300"}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}