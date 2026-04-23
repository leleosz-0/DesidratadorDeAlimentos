"use client"

import { cn } from "@/lib/utils"
import { Thermometer, Droplets } from "lucide-react"

interface TemperatureDisplayProps {
  temperatura: number
  umidade: number
  temperaturaAlvo: number
  conectado: boolean
}

export function TemperatureDisplay({ 
  temperatura, 
  umidade, 
  temperaturaAlvo,
  conectado 
}: TemperatureDisplayProps) {
  const porcentagem = Math.min(100, (temperatura / 60) * 100)
  const corTemperatura = temperatura > 55 
    ? "text-orange-400" 
    : temperatura > 40 
      ? "text-yellow-400" 
      : "text-primary"

  return (
    <div className="relative">
      {/* Indicador de conexao */}
      <div className="absolute -top-2 -right-2 flex items-center gap-1">
        <div className={cn(
          "h-2.5 w-2.5 rounded-full",
          conectado ? "bg-green-500 animate-pulse" : "bg-red-500"
        )} />
        <span className="text-xs text-muted-foreground">
          {conectado ? "Conectado" : "Desconectado"}
        </span>
      </div>

      {/* Display principal de temperatura */}
      <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-2xl border border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Thermometer className="h-5 w-5" />
          <span className="text-sm font-medium">Temperatura Atual</span>
        </div>

        <div className={cn("text-7xl font-bold tabular-nums", corTemperatura)}>
          {temperatura.toFixed(1)}
          <span className="text-3xl">°C</span>
        </div>

        {/* Barra de progresso de temperatura */}
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              temperatura > 55 ? "bg-orange-500" : temperatura > 40 ? "bg-yellow-500" : "bg-primary"
            )}
            style={{ width: `${porcentagem}%` }}
          />
        </div>

        <div className="flex justify-between w-full text-sm text-muted-foreground">
          <span>0°C</span>
          <span className="text-primary font-medium">Alvo: {temperaturaAlvo}°C</span>
          <span>60°C</span>
        </div>

        {/* Umidade */}
        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
          <Droplets className="h-4 w-4 text-blue-400" />
          <span className="text-sm">Umidade: {umidade.toFixed(0)}%</span>
        </div>

        {/* Aviso de temperatura maxima */}
        {temperatura >= 58 && (
          <div className="mt-2 px-3 py-1.5 bg-orange-500/20 text-orange-400 text-sm rounded-lg">
            Atencao: Temperatura proxima do limite!
          </div>
        )}
      </div>
    </div>
  )
}
