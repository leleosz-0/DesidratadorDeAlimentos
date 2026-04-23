"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Timer, Play, Square, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface TimerDisplayProps {
  tempoRestante: number // em segundos
  tempoTotal: number // em segundos
  ativo: boolean
  alimentoNome: string | null
  onPausar: () => void
  onParar: () => void
}

function formatarTempoRestante(segundos: number): string {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  const segs = segundos % 60

  if (horas > 0) {
    return `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}:${segs.toString().padStart(2, "0")}`
  }
  return `${minutos.toString().padStart(2, "0")}:${segs.toString().padStart(2, "0")}`
}

export function TimerDisplay({
  tempoRestante,
  tempoTotal,
  ativo,
  alimentoNome,
  onParar
}: TimerDisplayProps) {
  const [mostrarAlerta, setMostrarAlerta] = useState(false)
  const progresso = tempoTotal > 0 ? ((tempoTotal - tempoRestante) / tempoTotal) * 100 : 0

  // Efeito de alerta quando tempo acabar
  useEffect(() => {
    if (tempoRestante === 0 && tempoTotal > 0) {
      setMostrarAlerta(true)
      // Som de alerta (simula buzzer)
      if (typeof window !== "undefined" && "AudioContext" in window) {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 800
        oscillator.type = "sine"
        gainNode.gain.value = 0.3
        
        oscillator.start()
        setTimeout(() => {
          oscillator.stop()
          audioContext.close()
        }, 1000)
      }
    } else {
      setMostrarAlerta(false)
    }
  }, [tempoRestante, tempoTotal])

  if (!ativo && tempoTotal === 0) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-2xl border border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Timer className="h-5 w-5" />
          <span className="text-sm font-medium">Timer</span>
        </div>
        <p className="text-muted-foreground text-center">
          Selecione um alimento para iniciar o processo
        </p>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex flex-col items-center gap-4 p-6 bg-card rounded-2xl border transition-all duration-300",
      mostrarAlerta ? "border-primary bg-primary/10 animate-pulse" : "border-border"
    )}>
      {/* Alerta de conclusao */}
      {mostrarAlerta && (
        <div className="flex items-center gap-2 text-primary animate-bounce">
          <Bell className="h-6 w-6" />
          <span className="font-bold text-lg">Processo Concluido!</span>
          <Bell className="h-6 w-6" />
        </div>
      )}

      <div className="flex items-center gap-2 text-muted-foreground">
        <Timer className="h-5 w-5" />
        <span className="text-sm font-medium">
          {alimentoNome || "Processo Manual"}
        </span>
      </div>

      {/* Display do tempo */}
      <div className={cn(
        "text-5xl font-bold tabular-nums",
        ativo ? "text-primary" : "text-muted-foreground"
      )}>
        {formatarTempoRestante(tempoRestante)}
      </div>

      {/* Barra de progresso */}
      <div className="w-full">
        <Progress value={progresso} className="h-2" />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{Math.round(progresso)}% concluido</span>
          <span>{formatarTempoRestante(tempoTotal)} total</span>
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-3 mt-2">
        {ativo && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onParar}
            className="gap-2"
          >
            <Square className="h-4 w-4" />
            Parar
          </Button>
        )}
        {mostrarAlerta && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={onParar}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Novo Processo
          </Button>
        )}
      </div>
    </div>
  )
}
