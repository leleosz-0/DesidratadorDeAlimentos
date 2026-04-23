import { NextRequest, NextResponse } from "next/server"
import { getEstado, atualizarSensor, setConectado } from "@/lib/store"

const ESP32_API_KEY = process.env.ESP32_API_KEY || "desidratador_esp32_2026"

// GET - Retorna estado atual (para o frontend)
export async function GET() {
  const estado = getEstado()
  return NextResponse.json(estado)
}

// POST - Recebe dados do ESP32
export async function POST(request: NextRequest) {
  // Verifica API Key do ESP32
  const apiKey = request.headers.get("X-API-Key")
  if (apiKey !== ESP32_API_KEY) {
    return NextResponse.json({ error: "Chave de API invalida" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { temperatura, umidade } = body

    if (typeof temperatura !== "number") {
      return NextResponse.json({ error: "Temperatura invalida" }, { status: 400 })
    }

    // Atualiza dados do sensor
    atualizarSensor(temperatura, umidade || 50)

    // Retorna estado do processo para o ESP32
    const estado = getEstado()
    
    return NextResponse.json({
      setpoint: estado.processo.temperaturaAlvo,
      equipamentoLigado: estado.sensor.equipamentoLigado,
      processoAtivo: estado.processo.ativo,
      tempoRestante: estado.processo.tempoRestante,
      buzzer: estado.processo.tempoRestante === 0 && estado.processo.tempoTotal > 0
    })
  } catch {
    return NextResponse.json({ error: "Erro ao processar dados" }, { status: 500 })
  }
}

// DELETE - Marca ESP32 como desconectado
export async function DELETE() {
  setConectado(false)
  return NextResponse.json({ ok: true })
}
