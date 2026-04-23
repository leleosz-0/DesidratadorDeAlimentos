import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Cpu, 
  Thermometer, 
  Fan, 
  Speaker, 
  Monitor, 
  Wifi,
  Download,
  ArrowLeft,
  Zap
} from "lucide-react"
import Link from "next/link"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configuracao do Hardware</h1>
            <p className="text-muted-foreground">Instrucoes para montar e configurar o desidratador</p>
          </div>
        </div>

        {/* Componentes necessarios */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Componentes Necessarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <ComponenteItem 
                nome="ESP32" 
                descricao="Microcontrolador principal com WiFi"
                icone={<Cpu className="h-5 w-5" />}
              />
              <ComponenteItem 
                nome="Modulo Rele" 
                descricao="Para controlar a celula Peltier"
                icone={<Zap className="h-5 w-5" />}
              />
              <ComponenteItem 
                nome="Celula Peltier" 
                descricao="Com ventoinha integrada para aquecimento"
                icone={<Fan className="h-5 w-5" />}
              />
              <ComponenteItem 
                nome="DHT11" 
                descricao="Sensor de temperatura e umidade"
                icone={<Thermometer className="h-5 w-5" />}
              />
              <ComponenteItem 
                nome="Display LCD 16x2 I2C" 
                descricao="Para exibir temperatura atual"
                icone={<Monitor className="h-5 w-5" />}
              />
              <ComponenteItem 
                nome="Buzzer" 
                descricao="Alerta sonoro quando processo termina"
                icone={<Speaker className="h-5 w-5" />}
              />
              <ComponenteItem 
                nome="Ventoinha de Exaustao" 
                descricao="Para retirar ar umido"
                icone={<Fan className="h-5 w-5" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pinagem */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conexoes (Pinagem ESP32)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4">Componente</th>
                    <th className="text-left py-2 px-4">Pino ESP32</th>
                    <th className="text-left py-2 px-4">Descricao</th>
                  </tr>
                </thead>
                <tbody>
                  <PinRow componente="DHT11 (DATA)" pino="GPIO 4" descricao="Dados do sensor" />
                  <PinRow componente="Rele Peltier" pino="GPIO 5" descricao="Controle ON/OFF" />
                  <PinRow componente="Ventoinha Exaustao" pino="GPIO 18" descricao="Controle ON/OFF" />
                  <PinRow componente="Buzzer" pino="GPIO 19" descricao="Sinal sonoro" />
                  <PinRow componente="LCD SDA" pino="GPIO 21" descricao="I2C Data" />
                  <PinRow componente="LCD SCL" pino="GPIO 22" descricao="I2C Clock" />
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Configuracao WiFi */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-primary" />
              Configuracao WiFi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Edite as seguintes linhas no codigo do ESP32:
            </p>
            <div className="bg-secondary p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`const char* ssid = "SEU_WIFI";           // Nome da sua rede
const char* password = "SUA_SENHA";       // Senha do WiFi
const char* serverUrl = "http://SEU_IP:3000/api/sensor";`}</pre>
            </div>
            <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg">
              <span className="text-primary font-bold">!</span>
              <p className="text-sm text-muted-foreground">
                Substitua <code className="bg-secondary px-1 rounded">SEU_IP</code> pelo endereco IP 
                do computador/servidor onde o aplicativo web esta rodando.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bibliotecas Arduino */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bibliotecas Arduino Necessarias</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <BibliotecaItem nome="DHT sensor library" autor="Adafruit" />
              <BibliotecaItem nome="ArduinoJson" autor="Benoit Blanchon" />
              <BibliotecaItem nome="LiquidCrystal_I2C" autor="Marco Schwartz" />
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Instale via Arduino IDE: Sketch → Include Library → Manage Libraries
            </p>
          </CardContent>
        </Card>

        {/* Download */}
        <Card>
          <CardHeader>
            <CardTitle>Download do Codigo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Baixe o codigo fonte para carregar no seu ESP32:
            </p>
            <a href="/esp32-desidratador.ino" download>
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Baixar Codigo ESP32 (.ino)
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ComponenteItem({ 
  nome, 
  descricao, 
  icone 
}: { 
  nome: string
  descricao: string
  icone: React.ReactNode 
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20 text-primary">
        {icone}
      </div>
      <div>
        <p className="font-medium text-foreground">{nome}</p>
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </div>
    </div>
  )
}

function PinRow({ 
  componente, 
  pino, 
  descricao 
}: { 
  componente: string
  pino: string
  descricao: string 
}) {
  return (
    <tr className="border-b border-border/50">
      <td className="py-2 px-4 text-foreground">{componente}</td>
      <td className="py-2 px-4">
        <Badge variant="secondary">{pino}</Badge>
      </td>
      <td className="py-2 px-4 text-muted-foreground">{descricao}</td>
    </tr>
  )
}

function BibliotecaItem({ nome, autor }: { nome: string; autor: string }) {
  return (
    <li className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
      <span className="font-medium text-foreground">{nome}</span>
      <Badge variant="outline">{autor}</Badge>
    </li>
  )
}
