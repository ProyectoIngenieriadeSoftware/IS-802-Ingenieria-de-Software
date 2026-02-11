"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { VisitorRegistration } from "@/components/visitor-registration"

export default function VisitorRegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [dni, setDni] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sid = searchParams.get("sid")

    // Si hay sid, intentar cargar datos de sesión existente
    if (sid) {
      try {
        const saved = sessionStorage.getItem(`session_${sid}`)
        if (saved) {
          const data = JSON.parse(saved)
          setDni(data.dni ?? "")
        }
      } catch {
        // Ignorar errores de parsing
      }
    }

    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  const handleBack = () => router.push("/")

  const handleComplete = (visitorData: any) => {
    console.log("Registro completado:", visitorData)

    // Generar un sid si no existe
    const sid = searchParams.get("sid") || crypto.randomUUID()

    const userData = {
      dni: visitorData.dni,
      nombre: visitorData.nombre,
      apellido: visitorData.apellido,
      tipo: "visitante",
      email: visitorData.email,
      telefono: visitorData.telefono,
      tipoVisita: visitorData.tipoVisita,
    }

    sessionStorage.setItem(`session_${sid}`, JSON.stringify(userData))

    router.push(`/registro-entrada?sid=${sid}`)
  }

  return (
    <main className="min-h-screen">
      <VisitorRegistration dni={dni} onBack={handleBack} onComplete={handleComplete} />
    </main>
  )
}

