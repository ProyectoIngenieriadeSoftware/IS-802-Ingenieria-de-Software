"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserCheck, Users, GraduationCap } from "lucide-react"

/**
 * Componente para seleccionar el tipo de usuario a registrar
 * Permite al empleado elegir entre registrar visitante o estudiante
 */
export function SeleccionUsuario() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [empleadoNombre, setEmpleadoNombre] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Obtener información del empleado de la sesión
    const sid = searchParams.get("sid")
    
    if (!sid) {
      router.push("/empleado-login")
      return
    }

    /**const sessionData = sessionStorage.getItem(`empleado_session_${sid}`)**/
    const sessionData = sessionStorage.getItem(`session_${sid}`)

    if (!sessionData) {
      router.push("/empleado-login")
      return
    }

    const empleado = JSON.parse(sessionData)
    setEmpleadoNombre(empleado.nombre)
  }, [searchParams, router])

  /**
   * Maneja la selección de tipo de usuario
   */
  const handleSeleccion = (tipo: "visitante" | "estudiante" | "maestro") => {
    setIsLoading(true)
    const sid = searchParams.get("sid")

    // Guardar el tipo de usuario seleccionado en la sesión
    /**const sessionData = sessionStorage.getItem(`empleado_session_${sid}`)
    if (sessionData) {
      const empleado = JSON.parse(sessionData)
      empleado.tipoUsuarioSeleccionado = tipo

      sessionStorage.setItem(`empleado_session_${sid}`, JSON.stringify(empleado))
    }**/
    const sessionData = sessionStorage.getItem(`session_${sid}`)

    if (sessionData) {
      const empleado = JSON.parse(sessionData)
      empleado.tipoUsuarioSeleccionado = tipo

      sessionStorage.setItem(`session_${sid}`, JSON.stringify(empleado))
    }


    // Redirigir según la selección
    /*if (tipo === "visitante") {
      router.push(`/dni-input?sid=${sid}`)
    } else {
      router.push(`/registro-estudiante?sid=${sid}`)
    }**/
    // Redirigir según la selección
    if (tipo === "visitante") {
      router.push(`/registro-visita?sid=${sid}`)
    } else if (tipo === "maestro") {
      router.push(`/registro-maestro?sid=${sid}`)
    } else {
      router.push(`/registro-entrada?sid=${sid}`)
    }
  }

  /**
   * Maneja el cierre de sesión
   */
  const handleCerrarSesion = () => {
    const sid = searchParams.get("sid")
    if (sid) {
      /**sessionStorage.removeItem(`empleado_session_${sid}`)**/
      sessionStorage.removeItem(`session_${sid}`)
    }
    router.push("/empleado-login")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#003876] via-[#004494] to-[#003876]">
      {/* Header institucional */}
      <header className="bg-[#003876] border-b border-[#FFC107]/20 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Ingreso UNAH</h1>
            <p className="text-sm text-[#FFC107]">
              Empleado: {empleadoNombre || "Cargando..."}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/10"
            onClick={handleCerrarSesion}
          >
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Selección de tipo de usuario */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-3">
              Selecciona el tipo de usuario
            </h2>
            <p className="text-xl text-white/80">
              ¿A quién deseas registrar hoy?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card de Visitante */}
            <Card className="p-8 bg-white shadow-2xl border-none hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <button
                onClick={() => handleSeleccion("visitante")}
                disabled={isLoading}
                className="w-full h-full flex flex-col items-center justify-center space-y-6 text-center"
              >
                <div className="w-32 h-32 bg-[#003876] rounded-full flex items-center justify-center shadow-lg">
                  <Users className="w-16 h-16 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-[#003876]">Visitante</h3>
                  <p className="text-gray-600 text-lg">
                    Registrar persona externa que viene de visita a la universidad
                  </p>
                </div>
                <Button
                  className="w-full h-12 text-lg font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876] shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? "Cargando..." : "Seleccionar Visitante"}
                </Button>
              </button>
            </Card>

            {/* Card de Estudiante */}
            <Card className="p-8 bg-white shadow-2xl border-none hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <button
                onClick={() => handleSeleccion("estudiante")}
                disabled={isLoading}
                className="w-full h-full flex flex-col items-center justify-center space-y-6 text-center"
              >
                <div className="w-32 h-32 bg-[#003876] rounded-full flex items-center justify-center shadow-lg">
                  <UserCheck className="w-16 h-16 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-[#003876]">Estudiante</h3>
                  <p className="text-gray-600 text-lg">
                    Registrar entrada de estudiante de la UNAH
                  </p>
                </div>
                <Button
                  className="w-full h-12 text-lg font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876] shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? "Cargando..." : "Seleccionar Estudiante"}
                </Button>
              </button>
            </Card>

            {/* Card de Empleado */}
            <Card className="p-8 bg-white shadow-2xl border-none hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <button
                onClick={() => handleSeleccion("maestro")}
                disabled={isLoading}
                className="w-full h-full flex flex-col items-center justify-center space-y-6 text-center"
              >
                <div className="w-32 h-32 bg-[#003876] rounded-full flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-16 h-16 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-[#003876]">Empleado</h3>
                  <p className="text-gray-600 text-lg">
                    Registrar entrada de empleado de la UNAH
                  </p>
                </div>
                <Button
                  className="w-full h-12 text-lg font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876] shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? "Cargando..." : "Seleccionar Empleado"}
                </Button>
              </button>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#003876] border-t border-[#FFC107]/20 py-3">
        <div className="container mx-auto px-4">
          <p className="text-sm text-white text-center">© 2025 UNAH (demo). Backend en http://localhost:3000</p>
        </div>
      </footer>
    </div>
  )
}