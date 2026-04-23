"use client"

import useSWR, { mutate } from "swr"
import type { EstadoDesidratador, Alimento } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useDesidratador() {
  // Busca estado do sensor a cada 2 segundos
  const { data: estado, error: erroEstado, isLoading: carregandoEstado } = useSWR<EstadoDesidratador>(
    "/api/sensor",
    fetcher,
    { refreshInterval: 2000 }
  )

  // Busca alimentos
  const { data: alimentosData, error: erroAlimentos } = useSWR<{ alimentos: Alimento[], categorias: string[] }>(
    "/api/alimentos",
    fetcher
  )

  // Acoes de controle
  const executarAcao = async (acao: string, dados?: Record<string, unknown>) => {
    try {
      const response = await fetch("/api/controle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, ...dados })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao executar acao")
      }

      // Revalida dados
      await mutate("/api/sensor")
      return await response.json()
    } catch (error) {
      console.error("Erro na acao:", error)
      throw error
    }
  }

  const ligarEquipamento = () => executarAcao("ligar")
  const desligarEquipamento = () => executarAcao("desligar")
  
  const iniciarProcesso = (alimentoId?: string, temperatura?: number, tempo?: number, nome?: string) => {
    if (alimentoId) {
      return executarAcao("iniciar", { alimentoId })
    }
    return executarAcao("iniciar", { temperatura, tempo, nome })
  }

  const pararProcesso = () => executarAcao("parar")
  
  const ajustarTemperatura = (temperatura: number) => 
    executarAcao("temperatura", { temperatura: Math.min(60, temperatura) })

  return {
    // Estado
    estado: estado || {
      sensor: {
        temperatura: 0,
        umidade: 0,
        equipamentoLigado: false,
        timestamp: 0
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
    },
    
    // Alimentos
    alimentos: alimentosData?.alimentos || [],
    categorias: alimentosData?.categorias || [],
    
    // Status
    carregando: carregandoEstado,
    erro: erroEstado || erroAlimentos,
    
    // Acoes
    ligarEquipamento,
    desligarEquipamento,
    iniciarProcesso,
    pararProcesso,
    ajustarTemperatura
  }
}
