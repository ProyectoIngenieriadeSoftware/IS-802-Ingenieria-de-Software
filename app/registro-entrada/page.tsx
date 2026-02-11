"use client";

import { useRouter } from "next/navigation";
import { EntryRegistration } from "@/components/entry-registration";

export default function EntryRegistrationPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  const handleComplete = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen">
      <EntryRegistration
        userData={{}}
        onBack={handleBack}
        onComplete={handleComplete}
      />
    </main>
  );
}
