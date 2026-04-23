import type { Alimento } from "./types"

// Banco de dados de alimentos pre-cadastrados
// Temperaturas mantidas no maximo de 60C conforme especificacao
export const alimentosDatabase: Alimento[] = [
  // Frutas
  {
    id: "laranja",
    nome: "Laranja",
    temperatura: 60,
    tempo: 720, // 12 horas
    categoria: "Frutas",
    icone: "citrus"
  },
  {
    id: "maca",
    nome: "Maca",
    temperatura: 57,
    tempo: 480, // 8 horas
    categoria: "Frutas",
    icone: "apple"
  },
  {
    id: "banana",
    nome: "Banana",
    temperatura: 57,
    tempo: 600, // 10 horas
    categoria: "Frutas",
    icone: "banana"
  },
  {
    id: "manga",
    nome: "Manga",
    temperatura: 57,
    tempo: 540, // 9 horas
    categoria: "Frutas",
    icone: "leaf"
  },
  {
    id: "abacaxi",
    nome: "Abacaxi",
    temperatura: 57,
    tempo: 720, // 12 horas
    categoria: "Frutas",
    icone: "leaf"
  },
  {
    id: "morango",
    nome: "Morango",
    temperatura: 57,
    tempo: 480, // 8 horas
    categoria: "Frutas",
    icone: "cherry"
  },
  {
    id: "uva",
    nome: "Uva (Passa)",
    temperatura: 57,
    tempo: 1440, // 24 horas
    categoria: "Frutas",
    icone: "grape"
  },
  {
    id: "kiwi",
    nome: "Kiwi",
    temperatura: 57,
    tempo: 480, // 8 horas
    categoria: "Frutas",
    icone: "leaf"
  },
  {
    id: "pessego",
    nome: "Pessego",
    temperatura: 57,
    tempo: 600, // 10 horas
    categoria: "Frutas",
    icone: "apple"
  },
  
  // Vegetais
  {
    id: "tomate",
    nome: "Tomate",
    temperatura: 60,
    tempo: 720, // 12 horas
    categoria: "Vegetais",
    icone: "circle"
  },
  {
    id: "cenoura",
    nome: "Cenoura",
    temperatura: 57,
    tempo: 600, // 10 horas
    categoria: "Vegetais",
    icone: "carrot"
  },
  {
    id: "pimentao",
    nome: "Pimentao",
    temperatura: 57,
    tempo: 480, // 8 horas
    categoria: "Vegetais",
    icone: "leaf"
  },
  {
    id: "cebola",
    nome: "Cebola",
    temperatura: 57,
    tempo: 540, // 9 horas
    categoria: "Vegetais",
    icone: "circle"
  },
  {
    id: "alho",
    nome: "Alho",
    temperatura: 57,
    tempo: 480, // 8 horas
    categoria: "Vegetais",
    icone: "circle"
  },
  {
    id: "cogumelo",
    nome: "Cogumelo",
    temperatura: 52,
    tempo: 360, // 6 horas
    categoria: "Vegetais",
    icone: "leaf"
  },
  
  // Ervas
  {
    id: "manjericao",
    nome: "Manjericao",
    temperatura: 46,
    tempo: 180, // 3 horas
    categoria: "Ervas",
    icone: "leaf"
  },
  {
    id: "salsa",
    nome: "Salsa",
    temperatura: 46,
    tempo: 180, // 3 horas
    categoria: "Ervas",
    icone: "leaf"
  },
  {
    id: "oregano",
    nome: "Oregano",
    temperatura: 46,
    tempo: 240, // 4 horas
    categoria: "Ervas",
    icone: "leaf"
  },
  {
    id: "alecrim",
    nome: "Alecrim",
    temperatura: 46,
    tempo: 240, // 4 horas
    categoria: "Ervas",
    icone: "leaf"
  },
  {
    id: "hortela",
    nome: "Hortela",
    temperatura: 46,
    tempo: 180, // 3 horas
    categoria: "Ervas",
    icone: "leaf"
  },
  
  // Carnes (Jerky)
  {
    id: "carne-bovina",
    nome: "Carne Bovina (Jerky)",
    temperatura: 60,
    tempo: 480, // 8 horas
    categoria: "Carnes",
    icone: "beef"
  },
  {
    id: "frango",
    nome: "Frango (Jerky)",
    temperatura: 60,
    tempo: 420, // 7 horas
    categoria: "Carnes",
    icone: "drumstick"
  },
  {
    id: "peixe",
    nome: "Peixe",
    temperatura: 60,
    tempo: 540, // 9 horas
    categoria: "Carnes",
    icone: "fish"
  }
]

export function getAlimentoById(id: string): Alimento | undefined {
  return alimentosDatabase.find(a => a.id === id)
}

export function getAlimentosByCategoria(categoria: string): Alimento[] {
  return alimentosDatabase.filter(a => a.categoria === categoria)
}

export function getCategorias(): string[] {
  return [...new Set(alimentosDatabase.map(a => a.categoria))]
}

export function formatarTempo(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  if (horas === 0) return `${mins}min`
  if (mins === 0) return `${horas}h`
  return `${horas}h ${mins}min`
}
