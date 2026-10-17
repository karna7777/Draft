import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Create account — Draft" };

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="app tone-charcoal" style={{ minHeight: "100vh" }} />}>
      <AuthForm mode="register" />
    </Suspense>
  );
}
