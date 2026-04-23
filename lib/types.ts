export interface Alimento {
  id: string
  nome: string
  temperatura: number
  tempo: number // em minutos
  categoria: string
  icone: string
}

export interface SensorData {
  temperatura: number
  umidade: number
  equipamentoLigado: boolean
  timestamp: number
}

export interface ProcessoDesidratacao {
  alimentoId: string | null
  alimentoNome: string | null
  temperaturaAlvo: number
  tempoRestante: number // em segundos
  tempoTotal: number // em segundos
  ativo: boolean
  iniciado: number | null
}

export interface EstadoDesidratador {
  sensor: SensorData
  processo: ProcessoDesidratacao
  conectado: boolean
}
