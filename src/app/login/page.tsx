"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { LoadingScreen } from "@/components/LoadingScreen";
import { MIN_PASSWORD_LENGTH, validateCredentials, type CredentialErrors } from "@/lib/auth-errors";

type Mode = "login" | "register";

const inputClass =
  "w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10";

export default function LoginPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<CredentialErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  if (loading || user) return <LoadingScreen />;

  const isLogin = mode === "login";

  function switchMode() {
    setMode(isLogin ? "register" : "login");
    setErrors({});
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateCredentials(email, password);
    setErrors(found);
    setSubmitError(null);
    if (Object.keys(found).length > 0) return;
    setSubmitting(true);
    try {
      if (isLogin) await signIn(email, password);
      else await signUp(email, password);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se ha podido completar la operación.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Seguimiento de candidaturas
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            {isLogin
              ? "Entra para ver y actualizar tus candidaturas."
              : "Crea una cuenta para empezar a registrar tus candidaturas."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
        >
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`${inputClass} ${errors.email ? "border-red-500" : "border-stone-300"}`}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? "password-error" : "password-hint"}
              className={`${inputClass} ${errors.password ? "border-red-500" : "border-stone-300"}`}
            />
            {errors.password ? (
              <p id="password-error" className="mt-1 text-xs text-red-600">
                {errors.password}
              </p>
            ) : (
              <p id="password-hint" className="mt-1 text-xs text-stone-500">
                Mínimo {MIN_PASSWORD_LENGTH} caracteres.
              </p>
            )}
          </div>

          {submitError && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? isLogin
                ? "Entrando…"
                : "Creando cuenta…"
              : isLogin
                ? "Iniciar sesión"
                : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-stone-600">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600"
          >
            {isLogin ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </p>
      </div>
    </main>
  );
}
