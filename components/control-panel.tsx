"use client"

import { cn } from "@/lib/utils"
import { Power, Play, Minus, Plus, Thermometer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { Alimento } from "@/lib/types"

interface ControlPanelProps {
  equipamentoLigado: boolean
  temperaturaAlvo: number
  alimentoSelecionado: Alimento | null
  processoAtivo: boolean
  onLigarDesligar: () => void
  onIniciarProcesso: () => void
  onAjustarTemperatura: (temp: number) => void
}

export function ControlPanel({
  equipamentoLigado,
  temperaturaAlvo,
  alimentoSelecionado,
  processoAtivo,
  onLigarDesligar,
  onIniciarProcesso,
  onAjustarTemperatura
}: ControlPanelProps) {
  const ajustarTemp = (delta: number) => {
    const novaTemp = Math.min(60, Math.max(0, temperaturaAlvo + delta))
    onAjustarTemperatura(novaTemp)
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-2xl border border-border">
      <h3 className="text-lg font-semibold text-foreground">Controles</h3>

      {/* Botao Liga/Desliga */}
      <Button
        variant={equipamentoLigado ? "destructive" : "default"}
        size="lg"
        className={cn(
          "w-full h-16 text-lg gap-3 transition-all",
          equipamentoLigado && "animate-pulse"
        )}
        onClick={onLigarDesligar}
      >
        <Power className="h-6 w-6" />
        {equipamentoLigado ? "Desligar Equipamento" : "Ligar Equipamento"}
      </Button>

      {/* Controle de temperatura */}
      <div className="space-y-3 p-4 bg-secondary/30 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Thermometer className="h-4 w-4" />
            <span className="text-sm font-medium">Temperatura Alvo</span>
          </div>
          <span className="text-2xl font-bold text-primary tabular-nums">
            {temperaturaAlvo}°C
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => ajustarTemp(-5)}
            disabled={temperaturaAlvo <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Slider
            value={[temperaturaAlvo]}
            onValueChange={([val]) => onAjustarTemperatura(val)}
            max={60}
            min={0}
            step={1}
            className="flex-1"
          />

          <Button
            variant="outline"
            size="icon"
            onClick={() => ajustarTemp(5)}
            disabled={temperaturaAlvo >= 60}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Temperatura maxima: 60°C (seguranca)
        </p>
      </div>

      {/* Botao Iniciar Processo */}
      {alimentoSelecionado && !processoAtivo && (
        <div className="space-y-3 p-4 bg-primary/10 rounded-xl border border-primary/30">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Alimento selecionado:</p>
            <p className="font-semibold text-foreground">{alimentoSelecionado.nome}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {alimentoSelecionado.temperatura}°C por {Math.floor(alimentoSelecionado.tempo / 60)}h 
              {alimentoSelecionado.tempo % 60 > 0 && ` ${alimentoSelecionado.tempo % 60}min`}
            </p>
          </div>
          
          <Button
            variant="default"
            size="lg"
            className="w-full h-14 text-lg gap-2"
            onClick={onIniciarProcesso}
          >
            <Play className="h-5 w-5" />
            Iniciar Desidratacao
          </Button>
        </div>
      )}

      {/* Status do processo */}
      {processoAtivo && (
        <div className="p-4 bg-primary/20 rounded-xl border border-primary/40 text-center">
          <div className="flex items-center justify-center gap-2 text-primary">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-medium">Processo em andamento</span>
          </div>
        </div>
      )}
    </div>
  )
}
