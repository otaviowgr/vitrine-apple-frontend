/**
 * Espelho dos DTOs da API. Mantenha em sincronia com
 * br.com.vitrine.dto.produto.ProdutoDetalheResponse.
 */

export type Categoria =
  | "IPHONE"
  | "IPAD"
  | "MACBOOK"
  | "APPLE_WATCH"
  | "AIRPODS"
  | "ACESSORIO"
  | "CABO_CARREGADOR";

export type Condicao = "LACRADO" | "NOVO" | "SEMINOVO" | "VITRINE";

export type StatusProduto = "DISPONIVEL" | "RESERVADO" | "VENDIDO" | "OCULTO";

export interface ImagemProduto {
  id: number;
  url: string;
  textoAlternativo: string | null;
  largura: number | null;
  altura: number | null;
  ordem: number;
}

export interface PecaTrocada {
  id: number;
  peca: string;
  origem: "ORIGINAL" | "ORIGINAL_RETIRADA" | "PARALELA";
  trocadaEm: string | null;
  observacao: string | null;
}

export interface Produto {
  id: number;
  nome: string;
  slug: string;
  categoria: Categoria;
  categoriaRotulo: string;
  condicao: Condicao;
  condicaoRotulo: string;
  preco: number;
  precoPromocional: number | null;
  /** Ja resolvido no back: promocional quando existe, senao o cheio. */
  precoVigente: number;
  armazenamentoGb: number | null;
  cor: string | null;
  marcasDeUso: string | null;
  descricao: string | null;
  saudeBateria: number | null;
  garantia: string | null;
  status: StatusProduto;
  destaque: boolean;
  imagens: ImagemProduto[];
  pecasTrocadas: PecaTrocada[];
}

export interface Vendedor {
  id: number;
  nome: string;
  /** 55 + DDD + numero, somente digitos. Ex.: 5548999998888 */
  whatsapp: string;
  fotoUrl: string | null;
  apresentacao: string | null;
}
