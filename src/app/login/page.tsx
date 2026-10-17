import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign in — Draft" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="app tone-charcoal" style={{ minHeight: "100vh" }} />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
