"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { EntryRegistration } from "@/components/entry-registration";

export default function RegistroMaestroPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("sid");

    if (!sessionId) {
      setLoading(false);
      return;
    }

    const raw = typeof window !== "undefined"
      ? sessionStorage.getItem(`session_${sessionId}`)
      : null;

    if (raw) {
      try {
        setUserData(JSON.parse(raw));
      } catch {
        setUserData(null);
      }
    }

    setLoading(false);
  }, [searchParams]);

  const handleBack = () => {
    const sessionId = searchParams.get("sid");
    if (sessionId) sessionStorage.removeItem(`session_${sessionId}`);
    router.push("/");
  };

  const handleComplete = () => {
    const sessionId = searchParams.get("sid");
    if (sessionId) sessionStorage.removeItem(`session_${sessionId}`);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003876] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    router.replace("/");
    return null;
  }

  return (
    <main className="min-h-screen">
      <EntryRegistration
        userData={userData}
        onBack={handleBack}
        onComplete={handleComplete}
        idLabel="Número de Empleado"
        idPlaceholder="Ingrese su número de empleado"
      />
    </main>
  );
}
