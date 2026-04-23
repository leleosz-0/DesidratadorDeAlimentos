import { NextRequest, NextResponse } from "next/server"
import { 
  getEstado, 
  iniciarProcesso, 
  pararProcesso, 
  setTemperaturaAlvo,
  ligarEquipamento,
  desligarEquipamento 
} from "@/lib/store"
import { getAlimentoById } from "@/lib/alimentos-database"

// GET - Retorna estado atual do processo
export async function GET() {
  const estado = getEstado()
  return NextResponse.json(estado)
}

// POST - Executa acoes de controle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { acao, alimentoId, temperatura, tempo, nome } = body

    switch (acao) {
      case "iniciar": {
        // Inicia processo com alimento da biblioteca ou personalizado
        if (alimentoId) {
          const alimento = getAlimentoById(alimentoId)
          if (alimento) {
            iniciarProcesso(
              alimento.id, 
              alimento.nome, 
              Math.min(60, alimento.temperatura), 
              alimento.tempo
            )
          } else {
            return NextResponse.json({ error: "Alimento nao encontrado" }, { status: 404 })
          }
        } else if (temperatura && tempo) {
          // Processo manual/personalizado
          iniciarProcesso(
            null, 
            nome || "Personalizado", 
            Math.min(60, temperatura), 
            tempo
          )
        } else {
          return NextResponse.json({ error: "Parametros insuficientes" }, { status: 400 })
        }
        break
      }

      case "parar": {
        pararProcesso()
        break
      }

      case "temperatura": {
        if (typeof temperatura !== "number") {
          return NextResponse.json({ error: "Temperatura invalida" }, { status: 400 })
        }
        setTemperaturaAlvo(Math.min(60, Math.max(0, temperatura)))
        break
      }

      case "ligar": {
        ligarEquipamento()
        break
      }

      case "desligar": {
        desligarEquipamento()
        break
      }

      default:
        return NextResponse.json({ error: "Acao desconhecida" }, { status: 400 })
    }

    const estado = getEstado()
    return NextResponse.json({ ok: true, estado })
  } catch {
    return NextResponse.json({ error: "Erro ao processar acao" }, { status: 500 })
  }
}
