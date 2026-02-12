"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Shield, Users, LogIn, LogOut, Car, BarChart3 } from "lucide-react"
import { API_URL } from "@/lib/api"

/**
 * Panel de administración con reportería de datos
 */
export default function PanelAdmin() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"ingresos" | "personas" | "vehiculos">("ingresos")
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchData = async (endpoint: string) => {
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/${endpoint}`)
      if (!res.ok) throw new Error("Error obteniendo datos")
      const result = await res.json()
      setData(Array.isArray(result) ? result : [result])
    } catch {
      setError("Error de conexión con el servidor. Verifique que el backend esté activo.")
      setData([])
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
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <header className="bg-[#003876] shadow-md">
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
        {/* Tabs de navegación */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#003876] text-white"
                  : "bg-white text-[#003876] border-2 border-[#003876] hover:bg-[#003876] hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Contenido */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#003876] capitalize">
                Reporte de {activeTab}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData(activeTab)}
                className="text-[#003876] border-[#003876]"
                disabled={isLoading}
              >
                Actualizar
              </Button>
            </div>

            {error && (
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

      <footer className="bg-[#003876] py-3">
        <p className="text-sm text-white text-center">© 2025 UNAH - Sistema de Control de Acceso</p>
      </footer>
    </div>
  )
}
