"use client"

import { useState, useEffect } from "react"
import { useDesidratador } from "@/hooks/use-desidratador"
import { TemperatureDisplay } from "@/components/temperature-display"
import { TimerDisplay } from "@/components/timer-display"
import { FoodLibrary } from "@/components/food-library"
import { ControlPanel } from "@/components/control-panel"
import type { Alimento } from "@/lib/types"
import { Leaf, Wifi, WifiOff, Smartphone, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DesidratadorPage() {
  const {
    estado,
    alimentos,
    categorias,
    carregando,
    ligarEquipamento,
    desligarEquipamento,
    iniciarProcesso,
    pararProcesso,
    ajustarTemperatura
  } = useDesidratador()

  const [alimentoSelecionado, setAlimentoSelecionado] = useState<Alimento | null>(null)
  const [tempoLocal, setTempoLocal] = useState(estado.processo.tempoRestante)

  // Atualiza tempo local para animacao suave
  useEffect(() => {
    setTempoLocal(estado.processo.tempoRestante)
    
    if (estado.processo.ativo && estado.processo.tempoRestante > 0) {
      const interval = setInterval(() => {
        setTempoLocal(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [estado.processo.ativo, estado.processo.tempoRestante])

  const handleSelectAlimento = (alimento: Alimento) => {
    setAlimentoSelecionado(alimento)
    ajustarTemperatura(alimento.temperatura)
  }

  const handleIniciarProcesso = async () => {
    if (alimentoSelecionado) {
      await iniciarProcesso(alimentoSelecionado.id)
    }
  }

  const handleLigarDesligar = async () => {
    if (estado.sensor.equipamentoLigado) {
      await desligarEquipamento()
    } else {
      await ligarEquipamento()
    }
  }

  const handleParar = async () => {
    await pararProcesso()
    setAlimentoSelecionado(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background com imagem */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{ backgroundImage: "url('/images/fundo.jpg')" }}
      />

      {/* Conteudo principal */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary">
                  <Leaf className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Desidratador</h1>
                  <p className="text-xs text-muted-foreground">Controle Remoto</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Status de conexao */}
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                  estado.conectado 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-red-500/20 text-red-400"
                )}>
                  {estado.conectado ? (
                    <>
                      <Wifi className="h-4 w-4" />
                      <span className="hidden sm:inline">ESP32 Conectado</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4" />
                      <span className="hidden sm:inline">Desconectado</span>
                    </>
                  )}
                </div>

                {/* Indicador mobile */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-sm">
                  <Smartphone className="h-4 w-4" />
                  <span className="hidden sm:inline">App Web</span>
                </div>

                {/* Link para configuracao */}
                <Link href="/setup">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Conteudo */}
        <main className="container mx-auto px-4 py-6">
          {carregando ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground">Conectando ao desidratador...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Coluna esquerda - Monitoramento */}
              <div className="space-y-6">
                {/* Display de temperatura */}
                <TemperatureDisplay
                  temperatura={estado.sensor.temperatura}
                  umidade={estado.sensor.umidade}
                  temperaturaAlvo={estado.processo.temperaturaAlvo}
                  conectado={estado.conectado}
                />

                {/* Timer */}
                <TimerDisplay
                  tempoRestante={tempoLocal}
                  tempoTotal={estado.processo.tempoTotal}
                  ativo={estado.processo.ativo}
                  alimentoNome={estado.processo.alimentoNome}
                  onPausar={() => {}}
                  onParar={handleParar}
                />

                {/* Painel de controle */}
                <ControlPanel
                  equipamentoLigado={estado.sensor.equipamentoLigado}
                  temperaturaAlvo={estado.processo.temperaturaAlvo}
                  alimentoSelecionado={alimentoSelecionado}
                  processoAtivo={estado.processo.ativo}
                  onLigarDesligar={handleLigarDesligar}
                  onIniciarProcesso={handleIniciarProcesso}
                  onAjustarTemperatura={ajustarTemperatura}
                />
              </div>

              {/* Coluna direita - Biblioteca de alimentos */}
              <div>
                <FoodLibrary
                  alimentos={alimentos}
                  categorias={categorias}
                  onSelectAlimento={handleSelectAlimento}
                  alimentoSelecionado={alimentoSelecionado?.id || null}
                />

                {/* Info adicional */}
                <div className="mt-6 p-4 bg-card rounded-2xl border border-border">
                  <h4 className="font-semibold text-foreground mb-2">Dicas de Uso</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Corte os alimentos em fatias finas e uniformes</li>
                    <li>• Temperatura maxima de 60°C para seguranca</li>
                    <li>• O buzzer tocara quando o processo terminar</li>
                    <li>• Verifique a temperatura no display LCD do equipamento</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>Desidratador de Alimentos - Sistema de Controle ESP32</p>
            <p className="mt-1">Desenvolvido para monitoramento remoto via Wi-Fi</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
