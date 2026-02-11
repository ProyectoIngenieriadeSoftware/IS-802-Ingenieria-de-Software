"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Car, UserIcon, Clock, Mail } from "lucide-react"
import { PhotoCapture } from "@/components/photo-capture"

//mi libreria de api
import { API_URL } from "@/lib/api";

// Marcas y modelos de vehículos
const MARCAS = [
  "Toyota", "Honda", "Nissan", "Mazda", "Hyundai", "Kia",
  "Ford", "Chevrolet", "Mitsubishi", "Suzuki", "Otro",
]

const MODELOS_POR_MARCA: Record<string, string[]> = {
  Toyota: ["Corolla", "Camry", "RAV4", "Hilux", "Prado", "Yaris", "4Runner", "Tacoma"],
  Honda: ["Civic", "Accord", "CR-V", "HR-V", "Pilot", "Fit", "Odyssey"],
  Nissan: ["Sentra", "Altima", "Versa", "Kicks", "X-Trail", "Frontier", "Pathfinder"],
  Mazda: ["Mazda3", "Mazda6", "CX-3", "CX-5", "CX-9", "BT-50"],
  Hyundai: ["Accent", "Elantra", "Tucson", "Santa Fe", "Creta", "Kona"],
  Kia: ["Rio", "Forte", "Sportage", "Sorento", "Seltos", "Soul"],
  Ford: ["Fiesta", "Focus", "Escape", "Explorer", "F-150", "Ranger", "Mustang"],
  Chevrolet: ["Spark", "Cruze", "Equinox", "Traverse", "Silverado", "Colorado"],
  Mitsubishi: ["Mirage", "Lancer", "Outlander", "Montero", "L200"],
  Suzuki: ["Swift", "Vitara", "Jimny", "Ertiga", "Ciaz"],
}

const COLORES = ["Blanco", "Negro", "Gris", "Plata", "Rojo", "Azul", "Verde", "Amarillo", "Naranja", "Café", "Otro"]


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
    // Campos de vehículo
    placa: "",
    marca: "",
    modelo: "",
    color: "",
    otraMarca: "",
    otroModelo: "",
    otroColor: "",
  })

  const [dniError, setDniError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [entryMethod, setEntryMethod] = useState<"peatonal" | "vehicular" | null>(null)
  const [placaValidation, setPlacaValidation] = useState<{ isValid: boolean; message: string } | null>(null)
  const [photoData, setPhotoData] = useState<string | null>(null)

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

  // Maneja el cambio en el input de placa (formato hondureño: ABC1234)
  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase()
    value = value.replace(/[^A-Z0-9]/g, "")

    if (value.length <= 3) {
      value = value.replace(/[^A-Z]/g, "")
    } else if (value.length <= 7) {
      const letters = value.slice(0, 3).replace(/[^A-Z]/g, "")
      const numbers = value.slice(3, 7).replace(/[^0-9]/g, "")
      value = letters + numbers
    } else {
      value = value.slice(0, 7)
    }

    setFormData((prev) => ({ ...prev, placa: value }))

    const placaRegex = /^[A-Z]{3}[0-9]{4}$/
    if (value.length === 7) {
      if (placaRegex.test(value)) {
        setPlacaValidation({ isValid: true, message: "✓ Formato de placa válido" })
      } else {
        setPlacaValidation({ isValid: false, message: "✗ Formato incorrecto" })
      }
    } else if (value.length > 0) {
      setPlacaValidation({ isValid: false, message: `Faltan ${7 - value.length} caracteres` })
    } else {
      setPlacaValidation(null)
    }
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

  // Modelos disponibles según la marca seleccionada
  const modelosDisponibles =
    formData.marca && formData.marca !== "Otro" ? [...MODELOS_POR_MARCA[formData.marca], "Otro"] : ["Otro"]

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

    // Validaciones de vehículo si es ingreso vehicular
    if (entryMethod === "vehicular") {
      const placaRegex = /^[A-Z]{3}[0-9]{4}$/
      if (!placaRegex.test(formData.placa)) {
        alert("La placa debe tener el formato ABC1234")
        return
      }
      if (!formData.marca) {
        alert("Por favor selecciona la marca del vehículo")
        return
      }
      if (!formData.modelo) {
        alert("Por favor selecciona el modelo del vehículo")
        return
      }
      if (!formData.color) {
        alert("Por favor selecciona el color del vehículo")
        return
      }
      if (formData.marca === "Otro" && !formData.otraMarca.trim()) {
        alert("Por favor especifica la marca del vehículo")
        return
      }
      if (formData.modelo === "Otro" && !formData.otroModelo.trim()) {
        alert("Por favor especifica el modelo del vehículo")
        return
      }
      if (formData.color === "Otro" && !formData.otroColor.trim()) {
        alert("Por favor especifica el color del vehículo")
        return
      }
    }

    if (!photoData) {
      alert("Por favor tome su foto para el enrolamiento facial")
      return
    }

    setShowSummary(true)
  }

  // Función para capturar la foto
  const handlePhotoCapture = (photo: string) => {
    setPhotoData(photo)
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

      // 2. Registrar vehículo si es ingreso vehicular
      if (entryMethod === "vehicular") {
        const marcasRes = await fetch(`${API_URL}/referencias/marcas`);
        const marcasBD = await marcasRes.json();

        const marcaEncontrada = marcasBD.find(
          (m: any) => m.Marca?.toLowerCase() === formData.marca?.toLowerCase()
        );

        if (marcaEncontrada) {
          const modelosRes = await fetch(`${API_URL}/referencias/modelos/${marcaEncontrada.Id_marca}`);
          const modelosBD = await modelosRes.json();

          const nombreModelo = formData.modelo === "Otro" ? formData.otroModelo : formData.modelo;
          const normalize = (str: string) =>
            str?.toLowerCase()?.trim()?.normalize("NFD")?.replace(/[\u0300-\u036f]/g, "")?.replace(/[-–—]/g, "-");

          const modeloEncontrado = modelosBD.find(
            (m: any) => normalize(m.Modelo) === normalize(nombreModelo)
          );

          if (modeloEncontrado) {
            await fetch(`${API_URL}/vehiculos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                Id_modelo: modeloEncontrado.Id_modelo,
                Color: formData.color === "Otro" ? formData.otroColor : formData.color,
                Ano: new Date().getFullYear(),
                Matricula: formData.placa,
                Id_persona: persona.Id_persona,
              }),
            });
          }
        }
      }

      // 3. Crear VISITA
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
          TipoIngreso: entryMethod === "peatonal" ? "Peatonal" : "Vehicular",
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
        tipoIngreso: entryMethod,
        vehiculo: entryMethod === "vehicular" ? {
          placa: formData.placa,
          marca: formData.marca === "Otro" ? formData.otraMarca : formData.marca,
          modelo: formData.modelo === "Otro" ? formData.otroModelo : formData.modelo,
          color: formData.color === "Otro" ? formData.otroColor : formData.color,
        } : null,
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
              <h2 className="text-2xl font-bold text-[#003876]">Registro de Visita</h2>
              <p className="text-gray-600">Complete el formulario para registrar su visita.</p>
            </div>

            {/* Paso 1: Selección de método de ingreso */}
            {!entryMethod && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#003876]">Seleccione método de ingreso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => setEntryMethod("peatonal")}
                    className="h-32 flex flex-col items-center justify-center gap-3 bg-[#003876] hover:bg-[#002855] text-white"
                  >
                    <UserIcon className="w-12 h-12" />
                    <span className="text-lg font-medium">Ingreso Peatonal</span>
                  </Button>
                  <Button
                    onClick={() => setEntryMethod("vehicular")}
                    className="h-32 flex flex-col items-center justify-center gap-3 bg-[#003876] hover:bg-[#002855] text-white"
                  >
                    <Car className="w-12 h-12" />
                    <span className="text-lg font-medium">Ingreso Vehicular</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 2: Formulario (después de elegir método) */}
            {entryMethod && !showSummary && (
              <div className="space-y-4">
                {/* Indicador del método seleccionado */}
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    {entryMethod === "peatonal" ? (
                      <UserIcon className="w-5 h-5 text-[#003876]" />
                    ) : (
                      <Car className="w-5 h-5 text-[#003876]" />
                    )}
                    <span className="text-sm text-gray-600">Método de ingreso:</span>
                    <span className="font-medium text-[#003876] capitalize">{entryMethod}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEntryMethod(null)}
                    className="text-[#003876] border-[#003876] hover:bg-[#003876] hover:text-white bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Cambiar
                  </Button>
                </div>

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

                  {/* Campos de vehículo (solo si es ingreso vehicular) */}
                  {entryMethod === "vehicular" && (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold text-[#003876] mb-4">Información del Vehículo</h3>

                      <div className="space-y-4">
                        {/* Placa */}
                        <div className="space-y-2">
                          <Label htmlFor="placa" className="text-[#003876] font-medium">
                            Placa <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            id="placa"
                            name="placa"
                            type="text"
                            value={formData.placa}
                            onChange={handlePlacaChange}
                            placeholder="ABC1234"
                            maxLength={7}
                            required
                            className="bg-white border-gray-300 focus:border-[#003876] focus:ring-[#003876] font-mono text-lg"
                            disabled={isSubmitting}
                          />
                          {placaValidation && (
                            <p className={`text-xs font-medium ${placaValidation.isValid ? "text-green-600" : "text-amber-600"}`}>
                              {placaValidation.message}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">Formato: 3 letras seguidas de 4 números (Ej: ABC1234)</p>
                        </div>

                        {/* Marca */}
                        <div className="space-y-2">
                          <Label htmlFor="marca" className="text-[#003876] font-medium">
                            Marca <span className="text-red-600">*</span>
                          </Label>
                          <Select
                            value={formData.marca}
                            onValueChange={(value) =>
                              setFormData((prev) => ({ ...prev, marca: value, modelo: "", otraMarca: "", otroModelo: "" }))
                            }
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="bg-white border-gray-300 focus:border-[#003876] focus:ring-[#003876]">
                              <SelectValue placeholder="Seleccione la marca" />
                            </SelectTrigger>
                            <SelectContent>
                              {MARCAS.map((marca) => (
                                <SelectItem key={marca} value={marca}>
                                  {marca}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {formData.marca === "Otro" && (
                          <div className="space-y-2">
                            <Label htmlFor="otraMarca" className="text-[#003876] font-medium">
                              Especifique la marca <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              id="otraMarca"
                              name="otraMarca"
                              type="text"
                              value={formData.otraMarca}
                              onChange={(e) => setFormData((prev) => ({ ...prev, otraMarca: e.target.value }))}
                              placeholder="Ingrese la marca del vehículo"
                              required
                              className="bg-white border-gray-300 focus:border-[#003876] focus:ring-[#003876]"
                              disabled={isSubmitting}
                            />
                          </div>
                        )}

                        {/* Modelo */}
                        {formData.marca && (
                          <div className="space-y-2">
                            <Label htmlFor="modelo" className="text-[#003876] font-medium">
                              Modelo <span className="text-red-600">*</span>
                            </Label>
                            <Select
                              value={formData.modelo}
                              onValueChange={(value) => setFormData((prev) => ({ ...prev, modelo: value, otroModelo: "" }))}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger className="bg-white border-gray-300 focus:border-[#003876] focus:ring-[#003876]">
                                <SelectValue placeholder="Seleccione el modelo" />
                              </SelectTrigger>
                              <SelectContent>
                                {modelosDisponibles.map((modelo) => (
                                  <SelectItem key={modelo} value={modelo}>
                                    {modelo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">Modelos disponibles para {formData.marca}</p>
                          </div>
                        )}

                        {formData.modelo === "Otro" && (
                          <div className="space-y-2">
                            <Label htmlFor="otroModelo" className="text-[#003876] font-medium">
                              Especifique el modelo <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              id="otroModelo"
                              name="otroModelo"
                              type="text"
                              value={formData.otroModelo}
                              onChange={(e) => setFormData((prev) => ({ ...prev, otroModelo: e.target.value }))}
                              placeholder="Ingrese el modelo del vehículo"
                              required
                              className="bg-white border-gray-300 focus:border-[#003876] focus:ring-[#003876]"
                              disabled={isSubmitting}
                            />
                          </div>
                        )}

                        {/* Color */}
                        <div className="space-y-2">
                          <Label htmlFor="color" className="text-[#003876] font-medium">
                            Color <span className="text-red-600">*</span>
                          </Label>
                          <Select
                            value={formData.color}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, color: value, otroColor: "" }))}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="bg-white border-gray-300 focus:border-[#003876] focus:ring-[#003876]">
                              <SelectValue placeholder="Seleccione el color" />
                            </SelectTrigger>
                            <SelectContent>
                              {COLORES.map((color) => (
                                <SelectItem key={color} value={color}>
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {formData.color === "Otro" && (
                          <div className="space-y-2">
                            <Label htmlFor="otroColor" className="text-[#003876] font-medium">
                              Especifique el color <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              id="otroColor"
                              name="otroColor"
                              type="text"
                              value={formData.otroColor}
                              onChange={(e) => setFormData((prev) => ({ ...prev, otroColor: e.target.value }))}
                              placeholder="Ingrese el color del vehículo"
                              required
                              className="bg-white border-gray-300 focus:border-[#003876] focus:ring-[#003876]"
                              disabled={isSubmitting}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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

                  {/* Captura de foto para enrolamiento facial */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-[#003876] mb-2">Foto para enrolamiento facial</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Tome una foto de su rostro para el registro de ingreso facial a la universidad.
                    </p>
                    <PhotoCapture onPhotoCapture={handlePhotoCapture} existingPhoto={null} />
                  </div>

                  {/* Botón para ver resumen */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876]"
                    disabled={isSubmitting || !photoData}
                  >
                    Revisar y Confirmar Registro
                  </Button>
                </form>
              </div>
            )}

            {/* Paso 3: Resumen de las respuestas del formulario */}
            {showSummary && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#003876]">Resumen de su registro</h3>
                <p className="text-sm text-gray-600">Por favor verifique que la información sea correcta antes de confirmar.</p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Método de ingreso</p>
                      <p className="text-sm text-gray-900 capitalize">{entryMethod}</p>
                    </div>
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

                  {/* Datos del vehículo en el resumen */}
                  {entryMethod === "vehicular" && (
                    <div className="border-t pt-3 mt-3">
                      <p className="text-xs text-gray-500 font-medium mb-2">Datos del vehículo</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Placa</p>
                          <p className="text-sm text-gray-900 font-mono">{formData.placa}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Marca</p>
                          <p className="text-sm text-gray-900">{formData.marca === "Otro" ? formData.otraMarca : formData.marca}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Modelo</p>
                          <p className="text-sm text-gray-900">{formData.modelo === "Otro" ? formData.otroModelo : formData.modelo}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Color</p>
                          <p className="text-sm text-gray-900">{formData.color === "Otro" ? formData.otroColor : formData.color}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Foto en el resumen */}
                  {photoData && (
                    <div className="border-t pt-3 mt-3">
                      <p className="text-xs text-gray-500 font-medium mb-2">Foto de enrolamiento facial</p>
                      <img src={photoData} alt="Foto de enrolamiento" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                    </div>
                  )}
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
