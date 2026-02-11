"use client"

// Importación de tipos y componentes necesarios
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"


//libreria api
import { API_URL } from "@/lib/api";

// Componente principal que maneja la entrada del DNI
export function DniInput() {
  const router = useRouter() // Hook de Next.js para manejar rutas
  const [dni, setDni] = useState("") // Estado para almacenar el DNI ingresado
  const [error, setError] = useState("") // Estado para manejar mensajes de error
  const [isLoading, setIsLoading] = useState(false) // Estado para mostrar el estado de carga

  /**
   * Función que valida el formato del DNI.
   * Verifica:
   * 1. Si contiene solo números.
   * 2. Si tiene exactamente 13 dígitos.
   * 3. Si el código de departamento y municipio son válidos.
   * 4. Si el año de nacimiento es válido.
   */
  const validateDni = (value: string): boolean => {
    // Validación para asegurar que el DNI solo contenga números
    if (!/^\d+$/.test(value)) {
      setError("El DNI solo debe contener números")
      return false
    }

    // Validación para verificar que el DNI tenga exactamente 13 dígitos
    if (value.length !== 13) {
      setError("El DNI debe tener exactamente 13 dígitos")
      return false
    }

    // Validación del código de departamento (debe estar entre 01 y 18)
    const departmentCode = Number.parseInt(value.substring(0, 2))
    if (departmentCode < 1 || departmentCode > 18) {
      setError("Formato de DNI inválido")
      return false
    }

    // Validación del código de municipio (debe estar entre 01 y 99)
    const municipioCode = Number.parseInt(value.substring(2, 4))
    if (municipioCode < 1 || municipioCode > 99) {
      setError("Formato de DNI inválido")
      return false
    }

    // Validación del año de nacimiento (debe ser un año entre 1900 y el año actual)
    const birthYear = Number.parseInt(value.substring(4, 8))
    const currentYear = new Date().getFullYear()
    if (birthYear < 1900 || birthYear > currentYear) {
      setError("Formato de DNI inválido")
      return false
    }

    setError("") // Limpiar cualquier error
    return true // El DNI es válido
  }

  /**
   * Maneja los cambios en el input del DNI
   * Permite solo números y un máximo de 13 caracteres
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Solo permitir números y un máximo de 13 caracteres
    if (/^\d*$/.test(value) && value.length <= 13) {
      setDni(value)
      setError("") // Limpiar el error cuando el valor cambia
    }
  }

  /**
   * Función que maneja la búsqueda del DNI en la base de datos
   * 1. Si el DNI existe en la base de datos de la UNAH o en la base de visitantes:
   *    Redirige a la autenticación con contraseña.
   * 2. Si no existe en ninguna de las bases:
   *    Redirige al registro de nueva visita.
   */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateDni(dni)) return;

  setIsLoading(true);
  

  try {
    //
    // 1️⃣ Buscar persona interna de la UNAH
    //
    const personaRes = await fetch(`${API_URL}/personas/${dni}`);

    if (personaRes.ok) {
      const persona = await personaRes.json();

      const roles: string[] = [];

      // Buscar estudiante
      const estRes = await fetch(`${API_URL}/estudiantes/por-persona/${persona.Id_persona}`);
      if (estRes.ok) roles.push("estudiante");

      // Buscar empleado
      const empRes = await fetch(`${API_URL}/empleados/por-persona/${persona.Id_persona}`);
      if (empRes.ok) roles.push("empleado");

      // Si es interno
      if (roles.length > 0) {
        const sid = Math.random().toString(36).substring(2, 15);

        sessionStorage.setItem(
          `session_${sid}`,
          JSON.stringify({
            dni: persona.DNI,
            name: `${persona.Nombre} ${persona.Apellido}`,
            roles,
          })
        );

        router.push(`/autenticacion?sid=${sid}`);
        setIsLoading(false);
        return;
      }
    }

    //
    // 2️⃣ Buscar visitante existente
    //
    const visitaRes = await fetch(`${API_URL}/visitas/persona/${dni}`);

    if (visitaRes.ok) {
      const visitas = await visitaRes.json();

      if (Array.isArray(visitas) && visitas.length > 0) {
        const v = visitas[0];

        const sid = Math.random().toString(36).substring(2, 15);

        sessionStorage.setItem(
          `session_${sid}`,
          JSON.stringify({
            dni,
            name: `${v.persona.Nombre} ${v.persona.Apellido}`,
            roles: ["visitante"],
          })
        );

        router.push(`/autenticacion?sid=${sid}`);
        setIsLoading(false);
        return;
      }
    }

    //
    // 3️⃣ No existe → enviar a registro
    //
    const newSid = Math.random().toString(36).substring(2, 15);

    sessionStorage.setItem(
      `session_${newSid}`,
      JSON.stringify({
        dni,
        isNewVisitor: true,
      })
    );

    router.push(`/registro-visita?sid=${newSid}`);
  } catch (error) {
    console.error(error);
    setError("No se pudo conectar al servidor");
  }

  setIsLoading(false);
};


  /**
   * Función que determina si la universidad está abierta
   * Horario: 6:00 AM - 10:00 PM
   */
  const getUniversityHoursMessage = () => {
    const now = new Date()
    const hour = now.getHours()

    // Si es fuera del horario de apertura, mostrar mensaje
    if (hour < 6 || hour >= 22) {
      return "Nota: La universidad está cerrada en este momento (horario: 6:00 AM - 10:00 PM). Puedes registrar tu entrada para mañana."
    }
    return null // Dentro del horario de apertura
  }

  const hoursMessage = getUniversityHoursMessage() // Obtener el mensaje de horario

  // Renderizado del componente
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#003876] via-[#004494] to-[#003876]">
      {/* Header con branding UNAH */}
      <header className="bg-[#003876] border-b border-[#FFC107]/20 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Ingreso UNAH</h1>
            <p className="text-sm text-[#FFC107]">Panel de escritorio</p>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            Inicio
          </Button>
        </div>
      </header>

      {/* Formulario principal de ingreso de DNI */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 md:p-12 bg-white shadow-2xl border-none">
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <h2 className="text-4xl font-bold text-[#003876]">Bienvenido</h2>
              <p className="text-lg text-gray-600">
                Escribe tu DNI y presiona buscar.
                <br />
                Te mostraremos los perfiles disponibles.
              </p>
            </div>

            {/* Alerta de horario fuera de operación */}
            {hoursMessage && (
              <Alert className="border-[#FFC107] bg-[#FFC107]/10">
                <AlertCircle className="h-4 w-4 text-[#FFC107]" />
                <AlertDescription className="text-gray-700">{hoursMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                {/* Input de DNI con validación en tiempo real */}
                <Input
                  type="text"
                  placeholder="DNI"
                  value={dni}
                  onChange={handleInputChange}
                  className="h-14 text-lg bg-white border-2 border-gray-300 focus:border-[#003876] focus:ring-[#003876] text-gray-900 placeholder:text-gray-400"
                  maxLength={13}
                  disabled={isLoading}
                  autoFocus
                  tabIndex={1}
                />
                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                <p className="text-xs text-gray-500">Ejemplo: 0209200500236 (13 dígitos sin guiones)</p>
              </div>

              {/* Botón de búsqueda con colores institucionales */}
              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876] shadow-md"
                disabled={isLoading || dni.length !== 13}
                tabIndex={2}
              >
                {isLoading ? "Buscando..." : "Buscar"}
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Footer institucional */}
      <footer className="bg-[#003876] border-t border-[#FFC107]/20 py-3">
        <div className="container mx-auto px-4">
          <p className="text-sm text-white text-center">© 2025 UNAH (demo). Backend en http://localhost:3000</p>
        </div>
      </footer>
    </div>
  )
}
