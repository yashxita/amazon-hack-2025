"use client"
import AuthForm from "@/components/AuthForm";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Home() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const router=useRouter();
  const handleToggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"))
  }

  const handleSuccess = (token: string) => {
    console.log("User logged in")
    localStorage.setItem("token", token) // optional if not using interceptor
    router.push("/") // <-- redirect to landing page
  }

  return (
   <AuthForm
      mode={mode}
      onToggleMode={handleToggleMode}
      onSuccess={handleSuccess}
    />
  );
}