"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, User, Lock, Users, UserPlus, Shield } from "lucide-react"
import { API_URL } from "@/lib/api"

/**
 * Componente de login principal unificado
 * Acepta número de cuenta de estudiante o número de empleado + contraseña
 * Redirige según el rol del usuario
 */
export default function LoginPrincipal() {
  const router = useRouter()
  const [numeroCuenta, setNumeroCuenta] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!numeroCuenta.trim()) {
      setError("Ingrese su número de cuenta o número de empleado")
      return
    }

    if (!contrasena.trim()) {
      setError("Ingrese su contraseña")
      return
    }

    setIsLoading(true)

    try {
      // Intentar autenticación contra la API
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          NumeroCuenta: numeroCuenta,
          Contrasena: contrasena,
        }),
      })

      if (!res.ok) {
        setError("Credenciales incorrectas. Verifique su número de cuenta y contraseña.")
        setIsLoading(false)
        return
      }

      const data = await res.json()

      // Generar ID de sesión
      const sid = Math.random().toString(36).substring(2, 15)

      // Guardar sesión con datos del usuario
      sessionStorage.setItem(
        `session_${sid}`,
        JSON.stringify({
          numero_cuenta: numeroCuenta,
          nombre: data.Nombre || "Usuario",
          apellido: data.Apellido || "",
          rol: data.Rol || "estudiante",
          dni: data.DNI || "",
          id_persona: data.Id_persona || null,
        })
      )

      // Redirigir según el rol
      const rol = (data.Rol || "estudiante").toLowerCase()

      if (rol === "seguridad") {
        router.push(`/seguridad?sid=${sid}`)
      } else if (rol === "administrador" || rol === "admin") {
        router.push(`/admin?sid=${sid}`)
      } else {
        // Estudiante o empleado regular → menú peatonal/vehicular
        router.push(`/registro-entrada?sid=${sid}`)
      }
    } catch {
      // Si la API no responde, usar modo demo
      const sid = Math.random().toString(36).substring(2, 15)

      sessionStorage.setItem(
        `session_${sid}`,
        JSON.stringify({
          numero_cuenta: numeroCuenta,
          nombre: "Usuario Demo",
          rol: "estudiante",
          dni: numeroCuenta,
        })
      )

      router.push(`/registro-entrada?sid=${sid}`)
    }

    setIsLoading(false)
  }

  const getUniversityHoursMessage = () => {
    const now = new Date()
    const hour = now.getHours()
    if (hour < 6 || hour >= 22) {
      return "Nota: La universidad está cerrada en este momento (horario: 6:00 AM - 10:00 PM)."
    }
    return null
  }

  const hoursMessage = getUniversityHoursMessage()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#003876] via-[#004494] to-[#003876]">
      {/* Header institucional */}
      <header className="bg-[#003876] border-b border-[#FFC107]/20 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Ingreso UNAH</h1>
            <p className="text-sm text-[#FFC107]">Sistema de Control de Acceso</p>
          </div>
        </div>
      </header>

      {/* Formulario de login */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 md:p-12 bg-white shadow-2xl border-none">
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-[#003876] rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-[#003876]">Iniciar Sesión</h2>
              <p className="text-lg text-gray-600">
                Ingresa con tu número de cuenta o número de empleado
              </p>
            </div>

            {/* Alerta de horario */}
            {hoursMessage && (
              <Alert className="border-[#FFC107] bg-[#FFC107]/10">
                <AlertCircle className="h-4 w-4 text-[#FFC107]" />
                <AlertDescription className="text-gray-700">{hoursMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo de número de cuenta / empleado */}
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Número de cuenta o número de empleado"
                    value={numeroCuenta}
                    onChange={(e) => { setNumeroCuenta(e.target.value); setError("") }}
                    className="h-14 text-lg pl-12 bg-white border-2 border-gray-300 focus:border-[#003876] focus:ring-[#003876] text-gray-900 placeholder:text-gray-400"
                    disabled={isLoading}
                    autoFocus
                    tabIndex={1}
                  />
                </div>
              </div>

              {/* Campo de contraseña */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={contrasena}
                    onChange={(e) => { setContrasena(e.target.value); setError("") }}
                    className="h-14 text-lg pl-12 bg-white border-2 border-gray-300 focus:border-[#003876] focus:ring-[#003876] text-gray-900 placeholder:text-gray-400"
                    disabled={isLoading}
                    tabIndex={2}
                  />
                </div>
                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
              </div>

              {/* Botón de inicio de sesión */}
              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876] shadow-md"
                disabled={isLoading}
                tabIndex={3}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">o también</span>
              </div>
            </div>

            {/* Opción de registrarse */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 border-[#003876] text-[#003876] hover:bg-[#003876] hover:text-white"
                onClick={() => router.push("/registro")}
                disabled={isLoading}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Registrarse
              </Button>

              {/* Opción de visitante */}
              <Button
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 border-[#FFC107] text-[#003876] hover:bg-[#FFC107] hover:text-[#003876]"
                onClick={() => router.push("/registro-visita")}
                disabled={isLoading}
              >
                <Users className="w-5 h-5 mr-2" />
                Ingreso como Visitante
              </Button>
            </div>

            {/* Separador modo demo */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">modo demo (sin base de datos)</span>
              </div>
            </div>

            {/* Botones de acceso demo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 text-base font-semibold border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                onClick={() => {
                  const sid = Math.random().toString(36).substring(2, 15)
                  sessionStorage.setItem(
                    `session_${sid}`,
                    JSON.stringify({
                      numero_cuenta: "DEMO-SEG-001",
                      nombre: "Guardia",
                      apellido: "Demo",
                      rol: "seguridad",
                      dni: "0000000000001",
                    })
                  )
                  router.push(`/seguridad?sid=${sid}`)
                }}
                disabled={isLoading}
              >
                <Shield className="w-5 h-5 mr-2" />
                Entrar como Seguridad
              </Button>

              <Button
                variant="outline"
                className="h-12 text-base font-semibold border-2 border-purple-600 text-purple-700 hover:bg-purple-600 hover:text-white"
                onClick={() => {
                  const sid = Math.random().toString(36).substring(2, 15)
                  sessionStorage.setItem(
                    `session_${sid}`,
                    JSON.stringify({
                      numero_cuenta: "DEMO-ADM-001",
                      nombre: "Administrador",
                      apellido: "Demo",
                      rol: "administrador",
                      dni: "0000000000002",
                    })
                  )
                  router.push(`/admin?sid=${sid}`)
                }}
                disabled={isLoading}
              >
                <Shield className="w-5 h-5 mr-2" />
                Entrar como Admin
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-[#003876] border-t border-[#FFC107]/20 py-3">
        <div className="container mx-auto px-4">
          <p className="text-sm text-white text-center">© 2025 UNAH - Sistema de Control de Acceso</p>
        </div>
      </footer>
    </div>
  )
}
