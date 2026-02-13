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
  idLabel?: string // Etiqueta del campo de identificación (default: "Número de Cuenta")
  idPlaceholder?: string // Placeholder del campo de identificación
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


// Componente principal para el registro de entrada
export function EntryRegistration({ userData, onBack, onComplete, idLabel = "Número de Cuenta", idPlaceholder = "Ingrese su número de cuenta" }: EntryRegistrationProps) {
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

  const [numeroCuenta, setNumeroCuenta] = useState("") // Número de cuenta del estudiante
  const [entryMethod, setEntryMethod] = useState<"peatonal" | "vehicular" | null>(null) // Método de entrada seleccionado
  const [showVehicleRegistration, setShowVehicleRegistration] = useState(false) // Estado para mostrar el registro de vehículo
  const [vehicleData, setVehicleData] = useState<any>(null) // Datos del vehículo
  const [photoData, setPhotoData] = useState<string | null>(initialPhoto) // Foto del usuario
  const [periodType, setPeriodType] = useState(initialPeriod.type) // Tipo de periodo
  const [periodNumber, setPeriodNumber] = useState(initialPeriod.number) // Número del periodo
  const [isSubmitting, setIsSubmitting] = useState(false) // Estado de envío del formulario


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


  // Función para enviar el formulario de registro de entrada
  // Función para enviar el formulario de registro de entrada
// Función para enviar el formulario de registro de entrada
const handleSubmit = async () => {
  if (!photoData) {
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

    // 3️⃣ Construir objeto para el backend (fecha y hora se asignan automáticamente en el backend)
    const entryData = {
      Motivo: userData.motivoVisita || null,
      Tipo: tipoFinal,
      Id_persona: persona.Id_persona,
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
  // Si aún no eligió método, mostrar pantalla completa de selección estilo cards
  if (!entryMethod) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#003876] via-[#004494] to-[#003876]">
        <header className="bg-[#003876] border-b border-[#FFC107]/20 shadow-md">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Ingreso UNAH</h1>
              <p className="text-sm text-[#FFC107]">Sistema de Control de Acceso</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-3">Registro de Ingreso</h2>
              <p className="text-xl text-white/80">Seleccione su método de ingreso</p>
            </div>

            {/* Campo de número de cuenta */}
            <div className="max-w-md mx-auto mb-8">
              <Card className="p-6 bg-white shadow-lg">
                <Label htmlFor="numeroCuenta" className="text-[#003876] font-semibold text-lg">
                  {idLabel}
                </Label>
                <Input
                  id="numeroCuenta"
                  type="text"
                  placeholder={idPlaceholder}
                  value={numeroCuenta}
                  onChange={(e) => setNumeroCuenta(e.target.value)}
                  className="mt-2 h-12 text-lg border-2 border-gray-300 focus:border-[#003876] focus:ring-[#003876]"
                />
                {!numeroCuenta.trim() && (
                  <p className="text-sm text-amber-600 mt-1">
                    Debe ingresar su {idLabel.toLowerCase()} para continuar
                  </p>
                )}
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Card Peatonal */}
              <Card className={`p-8 bg-white shadow-2xl border-none transition-all duration-300 ${numeroCuenta.trim() ? "hover:shadow-3xl hover:scale-105 cursor-pointer" : "opacity-60"}`}>
                <button
                  onClick={() => handleEntryMethodSelect("peatonal")}
                  disabled={!numeroCuenta.trim()}
                  className="w-full h-full flex flex-col items-center justify-center space-y-6 text-center disabled:cursor-not-allowed"
                >
                  <div className="w-32 h-32 bg-[#003876] rounded-full flex items-center justify-center shadow-lg">
                    <UserIcon className="w-16 h-16 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-[#003876]">Ingreso Peatonal</h3>
                    <p className="text-gray-600 text-lg">Ingreso a pie por las entradas peatonales</p>
                  </div>
                  <Button
                    className="w-full h-12 text-lg font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876] shadow-md"
                    disabled={!numeroCuenta.trim()}
                  >
                    Seleccionar
                  </Button>
                </button>
              </Card>

              {/* Card Vehicular */}
              <Card className={`p-8 bg-white shadow-2xl border-none transition-all duration-300 ${numeroCuenta.trim() ? "hover:shadow-3xl hover:scale-105 cursor-pointer" : "opacity-60"}`}>
                <button
                  onClick={() => handleEntryMethodSelect("vehicular")}
                  disabled={!numeroCuenta.trim()}
                  className="w-full h-full flex flex-col items-center justify-center space-y-6 text-center disabled:cursor-not-allowed"
                >
                  <div className="w-32 h-32 bg-[#003876] rounded-full flex items-center justify-center shadow-lg">
                    <Car className="w-16 h-16 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-[#003876]">Ingreso Vehicular</h3>
                    <p className="text-gray-600 text-lg">Ingreso en vehículo por las entradas vehiculares</p>
                  </div>
                  <Button
                    className="w-full h-12 text-lg font-bold bg-[#FFC107] hover:bg-[#FFB300] text-[#003876] shadow-md"
                    disabled={!numeroCuenta.trim()}
                  >
                    Seleccionar
                  </Button>
                </button>
              </Card>
            </div>
          </div>
        </div>

        <footer className="bg-[#003876] border-t border-[#FFC107]/20 py-3">
          <p className="text-sm text-white text-center">© 2025 UNAH - Sistema de Control de Acceso</p>
        </footer>
      </div>
    )
  }

  // Renderizado del formulario después de elegir método
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#003876] via-[#004494] to-[#003876]">
      <header className="bg-[#003876] border-b border-[#FFC107]/20 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Ingreso UNAH</h1>
            <p className="text-sm text-[#FFC107]">Sistema de Control de Acceso</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl p-8 md:p-12 bg-white shadow-2xl border-none">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-[#003876]">Registro de Ingreso</h2>
            </div>

            {/* Detalles del ingreso */}
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


                {/* Botón de completar registro */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !photoData}
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

      <footer className="bg-[#003876] border-t border-[#FFC107]/20 py-3">
        <p className="text-sm text-white text-center">© 2025 UNAH - Sistema de Control de Acceso</p>
      </footer>
    </div>
  )
}
