"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CheckCircle, Clock, Mail } from "lucide-react"

//mi libreria de api
import { API_URL } from "@/lib/api";



// Definición de las propiedades que recibe el componente
interface VisitorRegistrationProps {
  dni: string // DNI del visitante
  onBack: () => void // Función para regresar al paso anterior
  onComplete: (visitorData: any) => void // Función llamada cuando el registro del visitante se complete
}

export function VisitorRegistration({ dni: initialDni, onBack, onComplete }: VisitorRegistrationProps) {
  // Estado que maneja los datos del formulario
  const [formData, setFormData] = useState({
    dni: initialDni || "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    tipoVisita: "",
    tipoVisitaOtro: "",
    motivo: "",
    fechaVisita: "",
    horaVisita: "",
  })

  const [dniError, setDniError] = useState("") // Estado para el error de validación del DNI
  const [isSubmitting, setIsSubmitting] = useState(false) // Estado para manejar el envío del formulario
  const [showSummary, setShowSummary] = useState(false) // Estado para mostrar el resumen

  // Función que maneja los cambios en los campos de entrada del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Validar DNI en tiempo real
    if (name === "dni") {
      const soloNumeros = value.replace(/\D/g, "")
      setFormData((prev) => ({ ...prev, dni: soloNumeros }))
      if (soloNumeros.length > 0 && soloNumeros.length !== 14) {
        setDniError("El DNI debe tener exactamente 14 dígitos")
      } else {
        setDniError("")
      }
    }
  }

  // Función que maneja los cambios en la selección de tipo de visita
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipoVisita: value, tipoVisitaOtro: "" }))
  }

  // Obtener la fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // Calcular la hora fin de la visita (12 horas después)
  const getEndTime = () => {
    if (!formData.horaVisita || !formData.fechaVisita) return ""
    const [hours, minutes] = formData.horaVisita.split(":").map(Number)
    const endHours = (hours + 12) % 24
    const nextDay = hours + 12 >= 24
    const endTime = `${String(endHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    return nextDay ? `${endTime} (día siguiente)` : endTime
  }

  // Obtener label del tipo de visita
  const getTipoVisitaLabel = (value: string) => {
    const tipos: Record<string, string> = {
      proveedor: "Proveedor",
      paciente: "Paciente (Clínica/Hospital)",
      familiar: "Familiar de estudiante",
      consulta_administrativa: "Consulta administrativa",
      entrevista: "Entrevista",
      evento: "Asistencia a evento",
      otro: "Otro",
    }
    return tipos[value] || value
  }

  // Función que valida y muestra el resumen antes de enviar
  const handleShowSummary = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.dni.length !== 14) {
      alert("El DNI debe tener exactamente 14 dígitos")
      return
    }

    if (formData.tipoVisita === "otro" && !formData.tipoVisitaOtro.trim()) {
      alert("Por favor especifica el tipo de visita")
      return
    }

    if (!formData.fechaVisita) {
      alert("Por favor selecciona la fecha de la visita")
      return
    }

    if (!formData.horaVisita) {
      alert("Por favor selecciona la hora de inicio de la visita")
      return
    }

    setShowSummary(true)
  }

  // Función que maneja el envío del formulario
  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // 1. Crear PERSONA
      const personaRes = await fetch(`${API_URL}/personas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Nombre: formData.nombre,
          Apellido: formData.apellido,
          DNI: formData.dni,
          Email: formData.email,
          Telefono: formData.telefono
        })
      });

      if (!personaRes.ok) {
        throw new Error("Error creando la persona");
      }

      const persona = await personaRes.json();

      // 2. Crear VISITA
      const finalTipoVisita =
        formData.tipoVisita === "otro"
          ? formData.tipoVisitaOtro
          : formData.tipoVisita;

      const visitaRes = await fetch(`${API_URL}/visitas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Id_persona: persona.Id_persona,
          TipoVisita: finalTipoVisita,
          Motivo: formData.motivo,
          Email: formData.email,
          Telefono: formData.telefono,
          FechaVisita: formData.fechaVisita,
          HoraVisita: formData.horaVisita,
        })
      });

      if (!visitaRes.ok) {
        throw new Error("Error registrando la visita");
      }

      const visita = await visitaRes.json();

      onComplete({
        dni: formData.dni,
        name: formData.nombre,
        apellido: formData.apellido,
        tipoVisita: finalTipoVisita,
        motivo: formData.motivo,
        email: formData.email,
        telefono: formData.telefono,
        fechaVisita: formData.fechaVisita,
        horaVisita: formData.horaVisita,
        id_persona: persona.Id_persona,
        id_visita: visita.Id_visita ?? visita.id ?? null
      });

    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    }

    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <header className="bg-[#003876] shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">SISTEMA DE INGRESO</h1>
            <p className="text-sm text-[#FFC107]">Universidad Nacional Autónoma de Honduras</p>
          </div>
          {/* Botón para volver al paso anterior */}
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 bg-white shadow-lg">
          <div className="space-y-6">
            <div className="space-y-2">
              {/* Título del formulario */}
              <h2 className="text-2xl font-bold text-[#003876]">Registro de Visita</h2>
              <p className="text-gray-600">Complete el formulario para registrar su visita.</p>
            </div>

            {!showSummary ? (
              /* Formulario de registro */
              <form onSubmit={handleShowSummary} className="space-y-4">
                {/* Campo de DNI */}
                <div className="space-y-2">
                  <Label htmlFor="dni" className="text-[#003876] font-medium">
                    DNI (Documento Nacional de Identidad) *
                  </Label>
                  <Input
                    id="dni"
                    name="dni"
                    type="text"
                    value={formData.dni}
                    onChange={handleInputChange}
                    required
                    maxLength={14}
                    tabIndex={1}
                    className={`border-gray-300 focus:border-[#003876] focus:ring-[#003876] ${dniError ? "border-red-500" : ""}`}
                    placeholder="Ingrese su número de DNI (14 dígitos)"
                    disabled={isSubmitting}
                  />
                  {dniError && (
                    <p className="text-xs text-red-500">{dniError}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-[#003876] font-medium">
                      Nombre *
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      type="text"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      tabIndex={2}
                      className="border-gray-300 focus:border-[#003876] focus:ring-[#003876]"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellido" className="text-[#003876] font-medium">
                      Apellido *
                    </Label>
                    <Input
                      id="apellido"
                      name="apellido"
                      type="text"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      required
                      tabIndex={3}
                      className="border-gray-300 focus:border-[#003876] focus:ring-[#003876]"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Correo electrónico */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#003876] font-medium">
                    Correo Electrónico *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    tabIndex={4}
                    className="border-gray-300 focus:border-[#003876] focus:ring-[#003876]"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-[#003876] font-medium">
                    Teléfono *
                  </Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                    tabIndex={5}
                    className="border-gray-300 focus:border-[#003876] focus:ring-[#003876]"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Selección del tipo de visita */}
                <div className="space-y-2">
                  <Label htmlFor="tipoVisita" className="text-[#003876] font-medium">
                    Tipo de Visita *
                  </Label>
                  <Select value={formData.tipoVisita} onValueChange={handleSelectChange} disabled={isSubmitting}>
                    <SelectTrigger className="border-gray-300 focus:border-[#003876] focus:ring-[#003876]" tabIndex={6}>
                      <SelectValue placeholder="Seleccione el tipo de visita" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proveedor">Proveedor</SelectItem>
                      <SelectItem value="paciente">Paciente (Clínica/Hospital)</SelectItem>
                      <SelectItem value="familiar">Familiar de estudiante</SelectItem>
                      <SelectItem value="consulta_administrativa">Consulta administrativa</SelectItem>
                      <SelectItem value="entrevista">Entrevista</SelectItem>
                      <SelectItem value="evento">Asistencia a evento</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Campo de tipo de visita si se seleccionó "otro" */}
                {formData.tipoVisita === "otro" && (
                  <div className="space-y-2">
                    <Label htmlFor="tipoVisitaOtro" className="text-[#003876] font-medium">
                      Especifique el tipo de visita *
                    </Label>
                    <Input
                      id="tipoVisitaOtro"
                      name="tipoVisitaOtro"
                      type="text"
                      value={formData.tipoVisitaOtro}
                      onChange={handleInputChange}
                      required
                      tabIndex={7}
                      className="border-gray-300 focus:border-[#003876] focus:ring-[#003876]"
                      placeholder="Describa el tipo de visita"
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {/* Justificación o motivo de la visita */}
                <div className="space-y-2">
                  <Label htmlFor="motivo" className="text-[#003876] font-medium">
                    Justificación / Motivo de la Visita *
                  </Label>
                  <Textarea
                    id="motivo"
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleInputChange}
                    required
                    tabIndex={8}
                    className="border-gray-300 focus:border-[#003876] focus:ring-[#003876] min-h-[100px]"
                    placeholder="Describe detalladamente el motivo de tu visita a la UNAH"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Selección de fecha y hora de visita */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-[#003876] mb-4">Programar fecha y hora de visita</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fechaVisita" className="text-[#003876] font-medium">
                        Día de la visita *
                      </Label>
                      <Input
                        id="fechaVisita"
                        name="fechaVisita"
                        type="date"
                        value={formData.fechaVisita}
                        onChange={handleInputChange}
                        required
                        min={getMinDate()}
                        tabIndex={9}
                        className="border-gray-300 focus:border-[#003876] focus:ring-[#003876]"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="horaVisita" className="text-[#003876] font-medium">
                        Hora de inicio de la visita *
                      </Label>
                      <Input
                        id="horaVisita"
                        name="horaVisita"
                        type="time"
                        value={formData.horaVisita}
                        onChange={handleInputChange}
                        required
                        tabIndex={10}
                        className="border-gray-300 focus:border-[#003876] focus:ring-[#003876]"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Aviso de las 12 horas */}
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2">
                    <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium">Aviso importante</p>
                      <p className="text-xs text-amber-700">
                        Tiene un plazo de <strong>12 horas</strong> a partir de la hora elegida para realizar su visita a la universidad.
                        {formData.horaVisita && formData.fechaVisita && (
                          <span> Su visita será válida desde las <strong>{formData.horaVisita}</strong> hasta las <strong>{getEndTime()}</strong>.</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botón para ver resumen */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876]"
                  disabled={isSubmitting}
                  tabIndex={11}
                >
                  Revisar y Confirmar Registro
                </Button>
              </form>
            ) : (
              /* Resumen de las respuestas del formulario */
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#003876]">Resumen de su registro</h3>
                <p className="text-sm text-gray-600">Por favor verifique que la información sea correcta antes de confirmar.</p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">DNI</p>
                      <p className="text-sm text-gray-900">{formData.dni}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Nombre completo</p>
                      <p className="text-sm text-gray-900">{formData.nombre} {formData.apellido}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Correo electrónico</p>
                      <p className="text-sm text-gray-900">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Teléfono</p>
                      <p className="text-sm text-gray-900">{formData.telefono}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Tipo de visita</p>
                      <p className="text-sm text-gray-900">
                        {formData.tipoVisita === "otro" ? formData.tipoVisitaOtro : getTipoVisitaLabel(formData.tipoVisita)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Fecha de visita</p>
                      <p className="text-sm text-gray-900">{new Date(formData.fechaVisita + "T00:00:00").toLocaleDateString("es-HN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Hora de inicio</p>
                      <p className="text-sm text-gray-900">{formData.horaVisita}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Válido hasta</p>
                      <p className="text-sm text-gray-900">{getEndTime()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Motivo de la visita</p>
                    <p className="text-sm text-gray-900">{formData.motivo}</p>
                  </div>
                </div>

                {/* Mensaje de confirmación por correo */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Confirmación por correo electrónico</p>
                    <p className="text-xs text-blue-700">
                      Se enviará una confirmación de su visita al correo <strong>{formData.email}</strong> junto con este resumen de sus respuestas al formulario.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 text-base font-bold border-[#003876] text-[#003876] hover:bg-[#003876]/10"
                    onClick={() => setShowSummary(false)}
                    disabled={isSubmitting}
                  >
                    Editar información
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 h-12 text-base font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876]"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Registrando..." : "Confirmar Registro"}
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
