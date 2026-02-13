"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, LogIn, LogOut, Shield, Search } from "lucide-react"
import { API_URL } from "@/lib/api"

/**
 * Panel de seguridad para empleados de seguridad
 * Permite registrar entradas y salidas de personas
 */
export default function PanelSeguridad() {
  const router = useRouter()
  const [numeroCuenta, setNumeroCuenta] = useState("")
  const [resultado, setResultado] = useState<any>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [accionExitosa, setAccionExitosa] = useState("")

  const handleBuscar = async () => {
    if (!numeroCuenta.trim()) {
      setError("Ingrese un número de cuenta")
      return
    }

    setError("")
    setResultado(null)
    setAccionExitosa("")
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/personas/${numeroCuenta}`)
      if (!res.ok) {
        setError("No se encontró ninguna persona con ese número de cuenta")
        setIsLoading(false)
        return
      }
      const data = await res.json()
      setResultado(data)
    } catch {
      setError("Error de conexión con el servidor")
    }

    setIsLoading(false)
  }

  const handleRegistrarEntrada = async () => {
    if (!resultado) return
    setIsLoading(true)
    setAccionExitosa("")

    try {
      const res = await fetch(`${API_URL}/ingresos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Id_persona: resultado.Id_persona,
          Tipo: "Peatonal",
          Motivo: "Entrada registrada por seguridad",
        }),
      })

      if (!res.ok) throw new Error("Error registrando entrada")

      setAccionExitosa("Entrada registrada exitosamente")
      setNumeroCuenta("")
      setResultado(null)
    } catch {
      setError("Error al registrar la entrada")
    }

    setIsLoading(false)
  }

  const handleRegistrarSalida = async () => {
    if (!resultado) return
    setIsLoading(true)
    setAccionExitosa("")

    try {
      const res = await fetch(`${API_URL}/salidas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Id_persona: resultado.Id_persona,
        }),
      })

      if (!res.ok) throw new Error("Error registrando salida")

      setAccionExitosa("Salida registrada exitosamente")
      setNumeroCuenta("")
      setResultado(null)
    } catch {
      setError("Error al registrar la salida")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <header className="bg-[#003876] shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#FFC107]" />
            <div>
              <h1 className="text-2xl font-bold text-white">Panel de Seguridad</h1>
              <p className="text-sm text-[#FFC107]">Control de Entradas y Salidas</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 bg-white shadow-lg">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-[#003876]">Registro de Entrada / Salida</h2>
              <p className="text-gray-600">Ingrese el número de cuenta de la persona para registrar su entrada o salida</p>
            </div>

            {/* Mensaje de éxito */}
            {accionExitosa && (
              <div className="p-4 bg-green-50 border border-green-300 rounded-lg text-green-800 text-center font-medium">
                {accionExitosa}
              </div>
            )}

            {/* Campo de búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="numeroCuenta" className="text-[#003876] font-medium text-lg">
                Número de Cuenta
              </Label>
              <div className="flex gap-2">
                <Input
                  id="numeroCuenta"
                  type="text"
                  placeholder="Ingrese el número de cuenta"
                  value={numeroCuenta}
                  onChange={(e) => { setNumeroCuenta(e.target.value); setError(""); setAccionExitosa("") }}
                  onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                  className="h-14 text-lg border-2 border-gray-300 focus:border-[#003876] focus:ring-[#003876]"
                  disabled={isLoading}
                  autoFocus
                />
                <Button
                  onClick={handleBuscar}
                  className="h-14 px-6 bg-[#003876] hover:bg-[#002855] text-white"
                  disabled={isLoading}
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            </div>

            {/* Resultado de búsqueda */}
            {resultado && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-[#003876] mb-2">Persona encontrada:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Nombre:</span>
                      <p className="font-medium text-gray-900">{resultado.Nombre} {resultado.Apellido}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">DNI:</span>
                      <p className="font-medium text-gray-900">{resultado.DNI}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleRegistrarEntrada}
                    disabled={isLoading}
                    className="h-20 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-lg font-bold"
                  >
                    <LogIn className="w-8 h-8" />
                    Registrar Entrada
                  </Button>
                  <Button
                    onClick={handleRegistrarSalida}
                    disabled={isLoading}
                    className="h-20 flex flex-col items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-lg font-bold"
                  >
                    <LogOut className="w-8 h-8" />
                    Registrar Salida
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <footer className="bg-[#003876] py-3">
        <p className="text-sm text-white text-center">© 2025 UNAH - Sistema de Control de Acceso</p>
      </footer>
    </div>
  )
}
