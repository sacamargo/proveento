import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/profile";

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>
            Regístrate como comprador. El rol por defecto es BUYER.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <SignupForm />
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
