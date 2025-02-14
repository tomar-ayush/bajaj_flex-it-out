"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { NextResponse } from "next/server";
import React, { useState } from "react";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [name, setName] = useState("")
  const [otp, setOtp] = useState("")
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Handle credentials login
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email: identifier, password, otp }) })

    const data = await res.json()
    if (res?.status != 201) {
      console.log(res)
      setError(data.message || "error while registration");
      return;
    }

    const signInResponse = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    if (signInResponse?.error) {
      setError("Sign-in failed after registration");
    } else {
      // On successful sign in, you can redirect as needed
      window.location.href = "/dashboard";
    }



  };

  // Handle login with Google
  const handleGoogleLogin = async () => {
    await signIn("google", {
      redirect: true,
      callbackUrl: "/dashboard",
    });
  };

  const sendOtp = async () => {
    const req = await fetch("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ email: identifier }) })
    if (req.ok) {
      window.alert("otp sent")
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@gmail.com"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="otp">OTP</Label>
          <Input
            id="otp"
            placeholder="Enter 6-digit OTP"
            type="text"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button
            type="button"
            onClick={sendOtp}
            className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600"
          >
            Send OTP
          </Button>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="cpassword">Confirm Password</Label>

          </div>
          <Input
            id="cpassword"
            type="password"
            required
            value={cpassword}
            onChange={(e) => setCPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full bg-blue-500">
          Login
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button variant="outline" onClick={handleGoogleLogin} className="w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="mr-2 h-4 w-4"
          >
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          Continue with Google
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  );
}
