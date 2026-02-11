/**"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { VisitorRegistration } from "@/components/visitor-registration"

export default function VisitorRegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Estado para guardar el DNI leído desde sessionStorage
  const [dni, setDni] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const sid = searchParams.get("sid")
    if (!sid) return

    const saved = sessionStorage.getItem(`session_${sid}`)
    if (!saved) return

    try {
      const data = JSON.parse(saved)
      setDni(data.dni || null)
    } catch {
      setDni(null)
    }
  }, [searchParams])

  // Aún cargando
  if (dni === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  // Regresar
  const handleBack = () => {
    router.push("/")
  }

  // Cuando se termina de registrar
  const handleComplete = (visitorData: any) => {
    console.log("Registro completado:", visitorData)

    const sid = searchParams.get("sid")
    if (!sid) return

    const userData = {
      dni: visitorData.dni,
      name: visitorData.nombre,
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
      <VisitorRegistration
        dni={dni}
        onBack={handleBack}
        onComplete={handleComplete}
      />
    </main>
  )
}**/

"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { VisitorRegistration } from "@/components/visitor-registration"

export default function VisitorRegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [dni, setDni] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sid = searchParams.get("sid")

    // Si no hay sid, regresa al inicio (o al login que uses)
    if (!sid) {
      setLoading(false)
      router.replace("/")
      return
    }

    try {
      const saved = sessionStorage.getItem(`session_${sid}`)

      // Si no hay sesión, regresa
      if (!saved) {
        setLoading(false)
        router.replace("/")
        return
      }

      const data = JSON.parse(saved)
      setDni(data.dni ?? "")
    } catch {
      setDni("")
    } finally {
      setLoading(false)
    }
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  const handleBack = () => router.push("/")

  const handleComplete = (visitorData: any) => {
    const sid = searchParams.get("sid")
    if (!sid) return

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

    // Si tu flujo es: visitante -> luego entrada
    router.push(`/registro-entrada?sid=${sid}`)
  }

  return (
    <main className="min-h-screen">
      <VisitorRegistration dni={dni ?? ""} onBack={handleBack} onComplete={handleComplete} />
    </main>
  )
}

