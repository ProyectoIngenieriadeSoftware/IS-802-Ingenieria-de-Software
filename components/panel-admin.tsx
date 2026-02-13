"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Users, LogIn, Car, BarChart3 } from "lucide-react"
import { API_URL } from "@/lib/api"

// Datos demo para cuando no hay conexión con el backend
const DEMO_DATA: Record<string, any[]> = {
  ingresos: [
    { Id_ingreso: 1, Id_persona: 1, Tipo: "Peatonal", Motivo: "Clases", Fecha: "2025-02-10", Hora: "07:30:00" },
    { Id_ingreso: 2, Id_persona: 2, Tipo: "Vehicular", Motivo: "Trabajo", Fecha: "2025-02-10", Hora: "08:00:00" },
    { Id_ingreso: 3, Id_persona: 3, Tipo: "Peatonal", Motivo: "Visita administrativa", Fecha: "2025-02-10", Hora: "09:15:00" },
    { Id_ingreso: 4, Id_persona: 4, Tipo: "Peatonal", Motivo: "Clases", Fecha: "2025-02-11", Hora: "07:45:00" },
    { Id_ingreso: 5, Id_persona: 1, Tipo: "Vehicular", Motivo: "Clases", Fecha: "2025-02-11", Hora: "10:00:00" },
  ],
  personas: [
    { Id_persona: 1, Nombre: "Carlos", Apellido: "Martinez", DNI: "0801199900123", Email: "carlos@unah.hn", Telefono: "99887766" },
    { Id_persona: 2, Nombre: "Maria", Apellido: "Lopez", DNI: "0801200000456", Email: "maria@unah.hn", Telefono: "99112233" },
    { Id_persona: 3, Nombre: "Jose", Apellido: "Hernandez", DNI: "0801198500789", Email: "jose@unah.hn", Telefono: "99445566" },
    { Id_persona: 4, Nombre: "Ana", Apellido: "Garcia", DNI: "0801199700321", Email: "ana@unah.hn", Telefono: "99778899" },
  ],
  vehiculos: [
    { Id_vehiculo: 1, Placa: "PAA-1234", Marca: "Toyota", Modelo: "Corolla", Color: "Blanco", Id_persona: 1 },
    { Id_vehiculo: 2, Placa: "PBB-5678", Marca: "Honda", Modelo: "Civic", Color: "Negro", Id_persona: 2 },
    { Id_vehiculo: 3, Placa: "PCC-9012", Marca: "Hyundai", Modelo: "Tucson", Color: "Gris", Id_persona: 1 },
  ],
}

/**
 * Panel de administración con reportería de datos
 */
export default function PanelAdmin() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"ingresos" | "personas" | "vehiculos">("ingresos")
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isDemo, setIsDemo] = useState(false)

  const fetchData = async (endpoint: string) => {
    setIsLoading(true)
    setError("")
    setIsDemo(false)
    try {
      const res = await fetch(`${API_URL}/${endpoint}`)
      if (!res.ok) throw new Error("Error obteniendo datos")
      const result = await res.json()
      setData(Array.isArray(result) ? result : [result])
    } catch {
      // Usar datos demo si no hay conexión
      setIsDemo(true)
      setData(DEMO_DATA[endpoint] || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const endpoints: Record<string, string> = {
      ingresos: "ingresos",
      personas: "personas",
      vehiculos: "vehiculos",
    }
    fetchData(endpoints[activeTab])
  }, [activeTab])

  const tabs = [
    { id: "ingresos" as const, label: "Ingresos", icon: LogIn },
    { id: "personas" as const, label: "Personas", icon: Users },
    { id: "vehiculos" as const, label: "Vehículos", icon: Car },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#003876] via-[#004494] to-[#003876]">
      <header className="bg-[#003876] border-b border-[#FFC107]/20 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#FFC107]" />
            <div>
              <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
              <p className="text-sm text-[#FFC107]">Reportería del Sistema</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="flex-1 container mx-auto p-4 space-y-4">
        {/* Banner demo */}
        {isDemo && (
          <div className="p-3 bg-[#FFC107]/20 border border-[#FFC107]/40 rounded-lg text-white text-center text-sm font-medium">
            Modo Demo - Mostrando datos de ejemplo (sin conexión al backend)
          </div>
        )}

        {/* Tabs de navegación */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#FFC107] text-[#003876] font-bold"
                  : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Contenido */}
        <Card className="p-6 bg-white shadow-2xl border-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#003876] capitalize">
                Reporte de {activeTab}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData(activeTab)}
                className="text-[#003876] border-[#003876] hover:bg-[#003876] hover:text-white"
                disabled={isLoading}
              >
                Actualizar
              </Button>
            </div>

            {error && !isDemo && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Cargando datos...</div>
            ) : data.length === 0 && !error ? (
              <div className="text-center py-8 text-gray-500">No hay registros disponibles</div>
            ) : data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#003876] text-white">
                      {Object.keys(data[0]).map((key) => (
                        <th key={key} className="px-4 py-3 text-left font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-4 py-3 border-b border-gray-200 text-gray-700">
                            {val !== null && val !== undefined ? String(val) : "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <div className="text-sm text-gray-500 text-right">
              Total de registros: {data.length}
            </div>
          </div>
        </Card>
      </div>

      <footer className="bg-[#003876] border-t border-[#FFC107]/20 py-3">
        <p className="text-sm text-white text-center">© 2025 UNAH - Sistema de Control de Acceso</p>
      </footer>
    </div>
  )
}
