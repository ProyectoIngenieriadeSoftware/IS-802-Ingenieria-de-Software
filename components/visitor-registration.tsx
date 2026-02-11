"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { PhotoCapture } from "@/components/photo-capture"

//mi libreria de api
import { API_URL } from "@/lib/api";



// Definición de las propiedades que recibe el componente
interface VisitorRegistrationProps {
  dni: string // DNI del visitante
  onBack: () => void // Función para regresar al paso anterior
  onComplete: (visitorData: any) => void // Función llamada cuando el registro del visitante se complete
}

export function VisitorRegistration({ dni, onBack, onComplete }: VisitorRegistrationProps) {
  // Estado que maneja los datos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    tipoVisita: "",
    tipoVisitaOtro: "",
    motivo: "",
  })

  const [photoData, setPhotoData] = useState<string | null>(null) // Estado para la foto de reconocimiento facial
  const [isSubmitting, setIsSubmitting] = useState(false) // Estado para manejar el envío del formulario

  // Función que maneja los cambios en los campos de entrada del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Función que maneja los cambios en la selección de tipo de visita
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipoVisita: value, tipoVisitaOtro: "" })) // Resetea "tipoVisitaOtro" cuando el tipo de visita cambia
  }

  // Función para capturar la foto del usuario
  const handlePhotoCapture = (photo: string) => {
    setPhotoData(photo)
  }

  // Función que maneja el envío del formulario
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validaciones
  if (formData.tipoVisita === "otro" && !formData.tipoVisitaOtro.trim()) {
    alert("Por favor especifica el tipo de visita");
    return;
  }

  if (!photoData) {
    alert("Por favor tome una foto para el reconocimiento facial");
    return;
  }

  setIsSubmitting(true);

  try {
    //
    // 1️⃣ Crear PERSONA
    //
    const personaRes = await fetch(`${API_URL}/personas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Nombre: formData.nombre,
        Apellido: formData.apellido,
        DNI: dni,
        Email: formData.email,
        Telefono: formData.telefono
      })
    });

    if (!personaRes.ok) {
      throw new Error("Error creando la persona");
    }

    const persona = await personaRes.json();

    //
    // 2️⃣ Crear VISITA
    //
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
        FotoBase64: photoData
      })
    });

    if (!visitaRes.ok) {
      throw new Error("Error registrando la visita");
    }

    const visita = await visitaRes.json();

   onComplete({
  dni,
  name: formData.nombre,
  apellido: formData.apellido,
  tipoVisita: finalTipoVisita,
  motivo: formData.motivo,
  email: formData.email,
  telefono: formData.telefono,
  photoBase64: photoData,
  id_persona: persona.Id_persona,
  id_visita: visita.Id_visita ?? visita.id ?? null
});


  } catch (error) {
    console.error(error);
    alert("Error de conexión con el servidor");
  }

  setIsSubmitting(false);
};



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
              <p className="text-gray-600">
                DNI <span className="font-mono font-medium">{dni}</span> no registrado. Complete el formulario.
              </p>
            </div>

            {/* Formulario de registro */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    tabIndex={1}
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
                    tabIndex={2}
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
                  tabIndex={3}
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
                  tabIndex={4}
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
                  <SelectTrigger className="border-gray-300 focus:border-[#003876] focus:ring-[#003876]" tabIndex={5}>
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
                    tabIndex={6}
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
                  tabIndex={7}
                  className="border-gray-300 focus:border-[#003876] focus:ring-[#003876] min-h-[100px]"
                  placeholder="Describe detalladamente el motivo de tu visita a la UNAH"
                  disabled={isSubmitting}
                />
              </div>

              {/* Reconocimiento facial */}
              <div className="border-t pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#003876]">Mi rostro (enrolamiento)</h3>
                  <p className="text-sm text-gray-600">
                    Permite ingresar por FACIAL en portones con lector facial. (Demo: guardamos la imagen como base64).
                  </p>
                  <PhotoCapture
                    onPhotoCapture={handlePhotoCapture}
                    existingPhoto={null}
                  />
                </div>
              </div>

              {/* Botón para completar el registro de visita */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876]"
                disabled={isSubmitting || !photoData}
                tabIndex={8}
              >
                {isSubmitting ? "Registrando..." : "Continuar con Registro de Ingreso"}
              </Button>
            </form>
          </div>
        </Card>
      </div>

      <footer className="bg-[#003876] py-3">
        <p className="text-sm text-white text-center">© 2025 UNAH - Sistema de Control de Acceso</p>
      </footer>
    </div>
  )
}