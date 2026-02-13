"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, GraduationCap, UserCheck } from "lucide-react"

/**
 * Página de registro - permite elegir entre registrarse como estudiante o empleado
 */
export default function RegistroPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSeleccion = (tipo: "estudiante" | "empleado") => {
    setIsLoading(true)
    if (tipo === "estudiante") {
      router.push("/registro-entrada")
    } else {
      router.push("/registro-empleado")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#003876] via-[#004494] to-[#003876]">
      <header className="bg-[#003876] border-b border-[#FFC107]/20 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Ingreso UNAH</h1>
            <p className="text-sm text-[#FFC107]">Registro de Usuario</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Login
          </Button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-3">Registrarse</h2>
            <p className="text-xl text-white/80">Seleccione su tipo de usuario para registrarse</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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
                    Registro para estudiantes de la UNAH
                  </p>
                </div>
                <Button
                  className="w-full h-12 text-lg font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876] shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? "Cargando..." : "Registrar Estudiante"}
                </Button>
              </button>
            </Card>

            {/* Card de Empleado */}
            <Card className="p-8 bg-white shadow-2xl border-none hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <button
                onClick={() => handleSeleccion("empleado")}
                disabled={isLoading}
                className="w-full h-full flex flex-col items-center justify-center space-y-6 text-center"
              >
                <div className="w-32 h-32 bg-[#003876] rounded-full flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-16 h-16 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-[#003876]">Empleado</h3>
                  <p className="text-gray-600 text-lg">
                    Registro para empleados de la UNAH
                  </p>
                </div>
                <Button
                  className="w-full h-12 text-lg font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876] shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? "Cargando..." : "Registrar Empleado"}
                </Button>
              </button>
            </Card>
          </div>
        </div>
      </div>

      <footer className="bg-[#003876] border-t border-[#FFC107]/20 py-3">
        <div className="container mx-auto px-4">
          <p className="text-sm text-white text-center">© 2025 UNAH - Sistema de Control de Acceso</p>
        </div>
      </footer>
    </div>
  )
}
