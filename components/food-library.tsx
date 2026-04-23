"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Alimento } from "@/lib/types"
import { formatarTempo } from "@/lib/alimentos-database"
import { 
  Apple, 
  Banana, 
  Cherry, 
  Grape, 
  Leaf, 
  Carrot, 
  Beef, 
  Fish,
  Circle,
  Citrus,
  Search
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FoodLibraryProps {
  alimentos: Alimento[]
  categorias: string[]
  onSelectAlimento: (alimento: Alimento) => void
  alimentoSelecionado: string | null
}

const iconeMap: Record<string, React.ComponentType<{ className?: string }>> = {
  apple: Apple,
  banana: Banana,
  cherry: Cherry,
  grape: Grape,
  leaf: Leaf,
  carrot: Carrot,
  beef: Beef,
  fish: Fish,
  circle: Circle,
  citrus: Citrus,
  drumstick: Beef,
}

function getIcone(icone: string) {
  const Icone = iconeMap[icone] || Leaf
  return Icone
}

export function FoodLibrary({
  alimentos,
  categorias,
  onSelectAlimento,
  alimentoSelecionado
}: FoodLibraryProps) {
  const [busca, setBusca] = useState("")
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(categorias[0] || "Frutas")

  const alimentosFiltrados = alimentos.filter(a => {
    const matchBusca = a.nome.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = busca ? true : a.categoria === categoriaSelecionada
    return matchBusca && matchCategoria
  })

  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-2xl border border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Biblioteca de Alimentos</h3>
        <Badge variant="secondary">{alimentos.length} itens</Badge>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar alimento..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Categorias */}
      {!busca && (
        <Tabs value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-secondary/50 p-1">
            {categorias.map(cat => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="text-xs px-3 py-1.5"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categorias.map(cat => (
            <TabsContent key={cat} value={cat} className="mt-3">
              <ScrollArea className="h-[280px]">
                <div className="grid gap-2">
                  {alimentosFiltrados
                    .filter(a => a.categoria === cat)
                    .map(alimento => (
                      <AlimentoCard
                        key={alimento.id}
                        alimento={alimento}
                        selecionado={alimentoSelecionado === alimento.id}
                        onSelect={() => onSelectAlimento(alimento)}
                      />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Resultados da busca */}
      {busca && (
        <ScrollArea className="h-[320px]">
          <div className="grid gap-2">
            {alimentosFiltrados.length > 0 ? (
              alimentosFiltrados.map(alimento => (
                <AlimentoCard
                  key={alimento.id}
                  alimento={alimento}
                  selecionado={alimentoSelecionado === alimento.id}
                  onSelect={() => onSelectAlimento(alimento)}
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum alimento encontrado
              </p>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

interface AlimentoCardProps {
  alimento: Alimento
  selecionado: boolean
  onSelect: () => void
}

function AlimentoCard({ alimento, selecionado, onSelect }: AlimentoCardProps) {
  const Icone = getIcone(alimento.icone)

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full h-auto p-3 justify-start gap-3 border transition-all",
        selecionado 
          ? "border-primary bg-primary/10 hover:bg-primary/20" 
          : "border-transparent hover:border-border hover:bg-secondary/50"
      )}
      onClick={onSelect}
    >
      <div className={cn(
        "flex items-center justify-center h-10 w-10 rounded-lg",
        selecionado ? "bg-primary text-primary-foreground" : "bg-secondary"
      )}>
        <Icone className="h-5 w-5" />
      </div>
      <div className="flex flex-col items-start gap-0.5">
        <span className="font-medium">{alimento.nome}</span>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>{alimento.temperatura}°C</span>
          <span>•</span>
          <span>{formatarTempo(alimento.tempo)}</span>
        </div>
      </div>
    </Button>
  )
}
