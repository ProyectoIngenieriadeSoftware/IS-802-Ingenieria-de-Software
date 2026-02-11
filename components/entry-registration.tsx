"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Car, UserIcon } from "lucide-react"
import { VehicleRegistration } from "@/components/vehicle-registration"
import { PhotoCapture } from "@/components/photo-capture"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"


//libreria api
import { API_URL } from "@/lib/api";


// Definición de las propiedades del componente
interface EntryRegistrationProps {
  userData: any // Datos del usuario (pasados desde el componente padre)
  onBack: () => void // Función para volver atrás
  onComplete: () => void // Función llamada cuando el registro se completa
}

// Función para obtener el periodo actual basado en la fecha
function getCurrentPeriod(): { type: string; number: string } {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  // Determinar el periodo en base al mes y día del año
  if (month >= 1 && (month < 5 || (month === 5 && day <= 15))) {
    return { type: "periodo", number: "1" }
  }
  if ((month === 5 && day > 15) || month === 6 || month === 7 || month === 8) {
    return { type: "periodo", number: "2" }
  }
  if (month >= 9 && month <= 12) {
    return { type: "periodo", number: "3" }
  }

  return { type: "periodo", number: "1" }
}

// Función para obtener el semestre actual
function getCurrentSemester(): string {
  const month = new Date().getMonth() + 1
  return month >= 1 && month <= 6 ? "1" : "2"
}

// Función para obtener la fecha mínima de entrada (si es antes de las 6 AM o después de las 10 PM, se establece para el día siguiente)
function getMinimumEntryDate(): string {
  const now = new Date()
  const currentHour = now.getHours()

  // Si es después de las 10 PM o antes de las 6 AM, la fecha mínima es mañana
  if (currentHour >= 22 || currentHour < 6) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  // Si es dentro del horario permitido, la fecha mínima es hoy
  return now.toISOString().split("T")[0]
}

// Función para obtener la hora predeterminada de entrada, ajustada al horario de la universidad
function getDefaultEntryTime(): string {
  const now = new Date()
  const currentHour = now.getHours()

  // Si está fuera del horario de la universidad, establecer 8:00 AM como hora predeterminada
  if (currentHour >= 22 || currentHour < 6) {
    return "08:00"
  }

  // Si está dentro del horario de la universidad, establecer la hora siguiente como predeterminada
  const nextHour = currentHour + 1
  if (nextHour <= 22) {
    return `${nextHour.toString().padStart(2, "0")}:00`
  }

  return "08:00"
}

// Componente principal para el registro de entrada
export function EntryRegistration({ userData, onBack, onComplete }: EntryRegistrationProps) {
  const initialPeriod = useMemo(() => {
    // Determina el periodo inicial basado en los roles del usuario
    if (userData.roles && !userData.roles.includes("visitante")) {
      return getCurrentPeriod()
    }
    return { type: "periodo", number: "1" }
}, [userData?.roles])


  const initialPhoto = useMemo(() => {
    // Verifica si el usuario tiene una foto registrada
    if (userData.hasPhoto && userData.photoBase64) {
      return userData.photoBase64
    }
    return null
  }, [userData.hasPhoto, userData.photoBase64])

  const [entryMethod, setEntryMethod] = useState<"peatonal" | "vehicular" | null>(null) // Método de entrada seleccionado
  const [showVehicleRegistration, setShowVehicleRegistration] = useState(false) // Estado para mostrar el registro de vehículo
  const [vehicleData, setVehicleData] = useState<any>(null) // Datos del vehículo
  const [photoData, setPhotoData] = useState<string | null>(initialPhoto) // Foto del usuario
  const [plannedEntryDate, setPlannedEntryDate] = useState(getMinimumEntryDate()) // Fecha de entrada planificada
  const [plannedEntryTime, setPlannedEntryTime] = useState(getDefaultEntryTime()) // Hora de entrada planificada
  const [estimatedExitTime, setEstimatedExitTime] = useState("") // Hora estimada de salida
  const [periodType, setPeriodType] = useState(initialPeriod.type) // Tipo de periodo
  const [periodNumber, setPeriodNumber] = useState(initialPeriod.number) // Número del periodo
  const [isSubmitting, setIsSubmitting] = useState(false) // Estado de envío del formulario

  // Función para obtener las opciones de horas disponibles para la entrada (6:00 AM a 10:00 PM)
  const getEntryTimeOptions = () => {
    const times: string[] = []
    for (let hour = 6; hour <= 22; hour++) {
      times.push(`${hour.toString().padStart(2, "0")}:00`)
      if (hour < 22) {
        times.push(`${hour.toString().padStart(2, "0")}:30`)
      }
    }
    return times
  }

  // Función para obtener las opciones de horas válidas para la salida en base a la hora de entrada
  const getValidExitTimes = () => {
    if (!plannedEntryTime) return []

    const times: string[] = []
    const [entryHour, entryMinute] = plannedEntryTime.split(":").map(Number)
    const closingHour = 22

    const startHour = entryMinute >= 30 ? entryHour + 1 : entryHour

    for (let hour = startHour; hour <= closingHour; hour++) {
      if (hour === startHour && entryMinute < 30) {
        times.push(`${hour.toString().padStart(2, "0")}:30`)
      } else {
        times.push(`${hour.toString().padStart(2, "0")}:00`)
        if (hour < closingHour) {
          times.push(`${hour.toString().padStart(2, "0")}:30`)
        }
      }
    }

    return times
  }

  // Función para seleccionar el método de entrada (peatonal o vehicular)
  const handleEntryMethodSelect = (method: "peatonal" | "vehicular") => {
    setEntryMethod(method)
    if (method === "vehicular") {
      setShowVehicleRegistration(true) // Mostrar el formulario de registro de vehículo si se selecciona "vehicular"
    }
  }

  // Función llamada cuando se registra un vehículo
 const handleVehicleRegistered = (vehicle: any) => {
  console.log("🚗 Datos recibidos del registro:", vehicle);

  setVehicleData({
    placa: vehicle.placa || "Sin placa",
    marca: vehicle.marca || "Sin marca",
    modelo: vehicle.modelo || "Sin modelo",
    color: vehicle.color || "Sin color",
  });

  setShowVehicleRegistration(false);
};



  // Función para capturar la foto del usuario
  const handlePhotoCapture = (photo: string) => {
    setPhotoData(photo)
  }

  // Función para cambiar el método de entrada (por si el usuario quiere cambiar de peatonal a vehicular o viceversa)
  const handleChangeEntryMethod = () => {
    setEntryMethod(null)
    setVehicleData(null)
  }

  // Función para manejar el cambio de la hora de entrada
  const handleEntryTimeChange = (newTime: string) => {
    setPlannedEntryTime(newTime)
    // Limpiar la hora estimada de salida cuando se cambie la hora de entrada
    setEstimatedExitTime("")
  }

  // Función para enviar el formulario de registro de entrada
  // Función para enviar el formulario de registro de entrada
// Función para enviar el formulario de registro de entrada
const handleSubmit = async () => {
  if (!photoData || !plannedEntryDate || !plannedEntryTime) {
    alert("Por favor complete todos los campos requeridos");
    return;
  }

  if (userData.roles && !userData.roles.includes("visitante") && (!periodType || !periodNumber)) {
    alert("Por favor seleccione el tipo de periodo y el periodo actual");
    return;
  }

  setIsSubmitting(true);

  try {
    // 1️⃣ Obtener Id_persona desde la API
    const personaRes = await fetch(`${API_URL}/personas/${userData.dni}`);
    if (!personaRes.ok) {
      alert("No se pudo obtener información del usuario");
      setIsSubmitting(false);
      return;
    }
    const persona = await personaRes.json();

    // 2️⃣ Convertir peatonal/vehicular → Peatonal/Vehicular
    const tipoFinal =
      entryMethod === "peatonal"
        ? "Peatonal"
        : entryMethod === "vehicular"
        ? "Vehicular"
        : null;

    if (!tipoFinal) {
      alert("Seleccione un método de ingreso");
      setIsSubmitting(false);
      return;
    }

    // 3️⃣ Construir objeto EXACTO para el backend
    const entryData = {
      Fecha: plannedEntryDate,
      Hora_entrada: plannedEntryTime,
      Hora_salida:
        estimatedExitTime && estimatedExitTime !== "none"
          ? estimatedExitTime
          : null,
      Motivo: userData.motivoVisita || null,
      Tipo: tipoFinal,
      Id_persona: persona.Id_persona, // 🔥 CLAVE REAL
    };

    // 4️⃣ Enviar registro
    const res = await fetch(`${API_URL}/ingresos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entryData),
    });

    if (!res.ok) {
      throw new Error("Error en backend");
    }

    alert("Registro de ingreso completado exitosamente");
    onComplete();
  } catch (error) {
    console.error(error);
    alert("Error al conectar con el servidor");
  }

  setIsSubmitting(false);
};


if (showVehicleRegistration) {
  return (
    <VehicleRegistration
      onBack={() => setShowVehicleRegistration(false)}
      onComplete={handleVehicleRegistered}
      dni={userData.dni}
    />
  )
}


  // Renderizado del formulario principal
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
        <Card className="w-full max-w-3xl p-8 md:p-12 bg-white shadow-lg">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-[#003876]">Registro de Ingreso</h2>
              <p className="text-gray-600 mt-2">
                {userData.name} - DNI: {userData.dni}
              </p>
            </div>

            {/* Selección de método de ingreso */}
            {!entryMethod && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#003876]">Seleccione método de ingreso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleEntryMethodSelect("peatonal")}
                    className="h-32 flex flex-col items-center justify-center gap-3 bg-[#003876] hover:bg-[#002855] text-white"
                    tabIndex={1}
                  >
                    <UserIcon className="w-12 h-12" />
                    <span className="text-lg font-medium">Ingreso Peatonal</span>
                  </Button>
                  <Button
                    onClick={() => handleEntryMethodSelect("vehicular")}
                    className="h-32 flex flex-col items-center justify-center gap-3 bg-[#003876] hover:bg-[#002855] text-white"
                    tabIndex={2}
                  >
                    <Car className="w-12 h-12" />
                    <span className="text-lg font-medium">Ingreso Vehicular</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Mostrar detalles del ingreso según el método seleccionado */}
            {entryMethod && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Método de ingreso:</span>
                    <span className="font-medium text-[#003876] capitalize">{entryMethod}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangeEntryMethod}
                    className="text-[#003876] border-[#003876] hover:bg-[#003876] hover:text-white bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cambiar método
                  </Button>
                </div>

                {/* Registro de vehículo */}
                {entryMethod === "vehicular" && (
                  <div className="space-y-4">
                    {vehicleData ? (
                      <div className="p-4 bg-gray-100 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Vehículo registrado:</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowVehicleRegistration(true)}
                            className="text-[#003876] border-[#003876] hover:bg-[#003876] hover:text-white bg-transparent"
                          >
                            Cambiar vehículo
                          </Button>
                        </div>
                        <div className="text-[#003876]">
                          <p>
                            <strong>Placa:</strong> {vehicleData.placa}
                          </p>
                          <p>
                            <strong>Marca:</strong> {vehicleData.marca}
                          </p>
                          <p>
                            <strong>Modelo:</strong> {vehicleData.modelo}
                          </p>
                          <p>
                            <strong>Color:</strong> {vehicleData.color}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowVehicleRegistration(true)}
                        className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-[#003876] font-bold"
                      >
                        Registrar Vehículo
                      </Button>
                    )}
                  </div>
                )}

                {/* Formulario de datos académicos y foto */}
                {userData.roles && !userData.roles.includes("visitante") && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-lg font-semibold text-foreground">Información Académica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="periodType" className="text-foreground">
                          Tipo de Periodo
                        </Label>
                        <Select
                          value={periodType}
                          onValueChange={(value) => {
                            setPeriodType(value)
                            if (value === "semestral") {
                              setPeriodNumber(getCurrentSemester())
                            } else {
                              setPeriodNumber(getCurrentPeriod().number)
                            }
                          }}
                        >
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Seleccione tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="semestral">Semestral</SelectItem>
                            <SelectItem value="periodo">Periodo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="periodNumber" className="text-foreground">
                          {periodType === "semestral" ? "Semestre" : "Periodo"}
                        </Label>
                        <Select value={periodNumber} onValueChange={setPeriodNumber}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                          <SelectContent>
                            {periodType === "semestral" ? (
                              <>
                                <SelectItem value="1">1er Semestre</SelectItem>
                                <SelectItem value="2">2do Semestre</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="1">1er Periodo</SelectItem>
                                <SelectItem value="2">2do Periodo</SelectItem>
                                <SelectItem value="3">3er Periodo</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Foto del usuario */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Mi rostro (enrolamiento)</h3>
                  {userData.hasPhoto && !photoData ? (
                    <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                      ✓ Ya tienes una foto registrada en el sistema. No es necesario tomar una nueva, pero puedes
                      actualizarla si lo deseas.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Permite ingresar por FACIAL en portones con lector facial. (Demo: guardamos la imagen como
                      base64).
                    </p>
                  )}
                  <PhotoCapture
                    onPhotoCapture={handlePhotoCapture}
                    existingPhoto={userData.hasPhoto ? userData.photoBase64 : null}
                  />
                </div>

                {/* Fecha y hora de entrada */}
                <div className="space-y-2">
                  <Label htmlFor="entryDate" className="text-foreground">
                    Fecha de entrada a la universidad
                  </Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={plannedEntryDate}
                    onChange={(e) => setPlannedEntryDate(e.target.value)}
                    min={getMinimumEntryDate()}
                    className="bg-input border-border text-foreground"
                  />
                  {(new Date().getHours() >= 22 || new Date().getHours() < 6) && (
                    <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                      💡 Puede registrar su entrada para mañana o días posteriores. Seleccione la fecha y hora en que
                      planea ingresar a la universidad.
                    </p>
                  )}
                </div>

                {/* Hora planificada de entrada */}
                <div className="space-y-2">
                  <Label htmlFor="entryTime" className="text-foreground">
                    Hora planificada de entrada (Horario UNAH: 6:00 AM - 10:00 PM)
                  </Label>
                  <Select value={plannedEntryTime} onValueChange={handleEntryTimeChange}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Seleccione hora de entrada" />
                    </SelectTrigger>
                    <SelectContent>
                      {getEntryTimeOptions().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Seleccione la hora en que planea entrar a la universidad
                  </p>
                </div>

                {/* Hora estimada de salida */}
                <div className="space-y-2">
                  <Label htmlFor="exitTime" className="text-foreground">
                    Hora estimada de salida (opcional)
                  </Label>
                  <Select value={estimatedExitTime} onValueChange={setEstimatedExitTime} disabled={!plannedEntryTime}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue
                        placeholder={plannedEntryTime ? "Seleccione hora de salida (opcional)" : "Primero seleccione hora de entrada"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin hora estimada</SelectItem>
                      {getValidExitTimes().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Opcional: ¿a qué hora aproximada saldrá de la universidad?
                  </p>
                </div>

                {/* Información del registro */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-blue-900">📋 Información del registro</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Registrando ahora:</span>
                    <span className="font-medium text-blue-900">
                      {new Date().toLocaleDateString("es-HN")} a las{" "}
                      {new Date().toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Entrada planificada:</span>
                    <span className="font-medium text-blue-900">
                      {plannedEntryDate || "Seleccione fecha"} {plannedEntryTime ? `a las ${plannedEntryTime}` : ""}
                    </span>
                  </div>
                </div>

                {/* Botón de completar registro */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !photoData || !plannedEntryDate || !plannedEntryTime}
                  className="w-full h-12 text-base font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876]"
                  tabIndex={20}
                >
                  {isSubmitting ? "Registrando ingreso..." : "Completar Registro"}
                </Button>
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
