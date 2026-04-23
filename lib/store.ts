import type { EstadoDesidratador, Alimento } from "./types"

// Estado global simulado (em producao, usar banco de dados)
let estadoDesidratador: EstadoDesidratador = {
  sensor: {
    temperatura: 25.0,
    umidade: 50.0,
    equipamentoLigado: false,
    timestamp: Date.now()
  },
  processo: {
    alimentoId: null,
    alimentoNome: null,
    temperaturaAlvo: 57,
    tempoRestante: 0,
    tempoTotal: 0,
    ativo: false,
    iniciado: null
  },
  conectado: false
}

// Alimentos customizados adicionados pelo admin
let alimentosCustomizados: Alimento[] = []

export function getEstado(): EstadoDesidratador {
  // Atualiza tempo restante se processo ativo
  if (estadoDesidratador.processo.ativo && estadoDesidratador.processo.iniciado) {
    const decorrido = Math.floor((Date.now() - estadoDesidratador.processo.iniciado) / 1000)
    const restante = estadoDesidratador.processo.tempoTotal - decorrido
    estadoDesidratador.processo.tempoRestante = Math.max(0, restante)
    
    // Se tempo acabou, desliga processo
    if (restante <= 0) {
      estadoDesidratador.processo.ativo = false
      estadoDesidratador.sensor.equipamentoLigado = false
    }
  }
  
  return { ...estadoDesidratador }
}

export function atualizarSensor(temperatura: number, umidade: number = 50): void {
  estadoDesidratador.sensor.temperatura = temperatura
  estadoDesidratador.sensor.umidade = umidade
  estadoDesidratador.sensor.timestamp = Date.now()
  estadoDesidratador.conectado = true
}

export function setConectado(conectado: boolean): void {
  estadoDesidratador.conectado = conectado
}

export function iniciarProcesso(alimentoId: string | null, alimentoNome: string, temperatura: number, tempoMinutos: number): void {
  estadoDesidratador.processo = {
    alimentoId,
    alimentoNome,
    temperaturaAlvo: Math.min(60, temperatura), // Maximo 60C
    tempoRestante: tempoMinutos * 60,
    tempoTotal: tempoMinutos * 60,
    ativo: true,
    iniciado: Date.now()
  }
  estadoDesidratador.sensor.equipamentoLigado = true
}

export function pararProcesso(): void {
  estadoDesidratador.processo.ativo = false
  estadoDesidratador.processo.tempoRestante = 0
  estadoDesidratador.sensor.equipamentoLigado = false
}

export function setTemperaturaAlvo(temperatura: number): void {
  estadoDesidratador.processo.temperaturaAlvo = Math.min(60, Math.max(0, temperatura))
}

export function ligarEquipamento(): void {
  estadoDesidratador.sensor.equipamentoLigado = true
}

export function desligarEquipamento(): void {
  estadoDesidratador.sensor.equipamentoLigado = false
  estadoDesidratador.processo.ativo = false
}

export function getAlimentosCustomizados(): Alimento[] {
  return [...alimentosCustomizados]
}

export function adicionarAlimentoCustomizado(alimento: Omit<Alimento, "id">): Alimento {
  const novoAlimento: Alimento = {
    ...alimento,
    id: `custom-${Date.now()}`,
    temperatura: Math.min(60, alimento.temperatura) // Maximo 60C
  }
  alimentosCustomizados.push(novoAlimento)
  return novoAlimento
}

export function removerAlimentoCustomizado(id: string): boolean {
  const index = alimentosCustomizados.findIndex(a => a.id === id)
  if (index !== -1) {
    alimentosCustomizados.splice(index, 1)
    return true
  }
  return false
}
