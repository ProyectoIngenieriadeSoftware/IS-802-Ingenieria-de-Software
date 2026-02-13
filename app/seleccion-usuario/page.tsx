"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Redirige al login principal (ya no se usa esta página directamente)
export default function SeleccionUsuarioPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirigiendo...</p>
    </div>
  )
}
