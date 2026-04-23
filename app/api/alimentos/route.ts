import { NextRequest, NextResponse } from "next/server"
import { alimentosDatabase, getCategorias } from "@/lib/alimentos-database"
import { getAlimentosCustomizados, adicionarAlimentoCustomizado, removerAlimentoCustomizado } from "@/lib/store"

// GET - Retorna todos os alimentos (banco + customizados)
export async function GET() {
  const todosAlimentos = [...alimentosDatabase, ...getAlimentosCustomizados()]
  const categorias = getCategorias()
  
  // Adiciona categoria "Customizados" se houver
  const customizados = getAlimentosCustomizados()
  if (customizados.length > 0 && !categorias.includes("Customizados")) {
    categorias.push("Customizados")
  }

  return NextResponse.json({
    alimentos: todosAlimentos,
    categorias
  })
}

// POST - Adiciona novo alimento (somente admin pode adicionar via codigo)
// Na pratica, isso seria protegido por autenticacao
export async function POST(request: NextRequest) {
  try {
    // Verifica chave de admin (simplificado - em producao usar auth real)
    const adminKey = request.headers.get("X-Admin-Key")
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== "admin_desidratador_2026") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const body = await request.json()
    const { nome, temperatura, tempo, categoria, icone } = body

    if (!nome || !temperatura || !tempo) {
      return NextResponse.json({ error: "Campos obrigatorios: nome, temperatura, tempo" }, { status: 400 })
    }

    const novoAlimento = adicionarAlimentoCustomizado({
      nome,
      temperatura: Math.min(60, temperatura), // Maximo 60C
      tempo,
      categoria: categoria || "Customizados",
      icone: icone || "leaf"
    })

    return NextResponse.json({ ok: true, alimento: novoAlimento })
  } catch {
    return NextResponse.json({ error: "Erro ao adicionar alimento" }, { status: 500 })
  }
}

// DELETE - Remove alimento customizado
export async function DELETE(request: NextRequest) {
  try {
    const adminKey = request.headers.get("X-Admin-Key")
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== "admin_desidratador_2026") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 })
    }

    const removido = removerAlimentoCustomizado(id)
    if (!removido) {
      return NextResponse.json({ error: "Alimento nao encontrado ou nao pode ser removido" }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro ao remover alimento" }, { status: 500 })
  }
}
