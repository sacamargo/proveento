import { redirect } from "next/navigation";

import { NewRequestForm } from "@/components/request/new-request-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/profile";

export default async function NewRequestPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            Nueva solicitud
          </CardTitle>
          <CardDescription>
            Publica lo que necesitas. Los proveedores cotizan a ciegas; nadie
            verá tu contacto comercial cruzado hasta que aceptes una propuesta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewRequestForm />
        </CardContent>
      </Card>
    </main>
  );
}
