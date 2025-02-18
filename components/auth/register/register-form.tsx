"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { validateRegistrationForm } from "@/utils/validation-utils";
import { toast } from "@/hooks/use-toast";

interface FormErrors {
  [key: string]: string;
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [formData, setFormData] = useState({
    name: "",
    identifier: "",
    password: "",
    cpassword: "",
    otp: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    const validationErrors = validateRegistrationForm(
      formData.name,
      formData.identifier,
      formData.password,
      formData.cpassword,
      formData.otp
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.identifier,
          password: formData.password,
          otp: formData.otp,
        }),
      });

      const data = await res.json();

      if (res.status !== 201) {
        throw new Error(data.message || "Error during registration");
      }

      const signInResponse = await signIn("credentials", {
        redirect: false,
        identifier: formData.identifier,
        password: formData.password,
      });

      if (signInResponse?.error) {
        throw new Error("Sign-in failed after registration");
      }

      window.location.href = "/dashboard";
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
      // toast({ title: "User created succesfully", variant: "success" })
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", {
      redirect: true,
      callbackUrl: "/dashboard",
    });
  };

  const sendOtp = async () => {
    if (!formData.identifier) {
      setErrors({ identifier: "Please enter an email address first" });
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.identifier }),
      });

      if (!res.ok) {
        throw new Error("Failed to send OTP");
      }

      setOtpSent(true);
      toast({ title: "OTP sent succesfully", variant: "success" })
    } catch (error) {
      setErrors({
        otp: error instanceof Error ? error.message : "Failed to send OTP",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your Full Name"
            required
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="identifier">Email</Label>
          <Input
            id="identifier"
            type="email"
            placeholder="example@gmail.com"
            required
            value={formData.identifier}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.identifier}
          />
          {errors.identifier && (
            <p className="text-sm text-red-500">{errors.identifier}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="otp">OTP</Label>
          <div className="flex gap-2">
            <Input
              id="otp"
              placeholder="Enter 6-digit OTP"
              type="text"
              maxLength={6}
              required
              value={formData.otp}
              onChange={handleChange}
              disabled={isLoading || !otpSent}
              aria-invalid={!!errors.otp}
            />
            <Button
              type="button"
              onClick={sendOtp}
              disabled={isLoading || !formData.identifier}
              className="whitespace-nowrap"
            >
              {isLoading ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
            </Button>
          </div>
          {errors.otp && (
            <p className="text-sm text-red-500">{errors.otp}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cpassword">Confirm Password</Label>
          <Input
            id="cpassword"
            type="password"
            required
            value={formData.cpassword}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.cpassword}
          />
          {errors.cpassword && (
            <p className="text-sm text-red-500">{errors.cpassword}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>

        <div className="relative text-center">
          <span className="bg-background px-2 text-muted-foreground text-sm relative z-10">
            Or continue with
          </span>
          <div className="absolute inset-0 top-1/2 border-t border-border -z-10" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full"
        >
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
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4 hover:text-primary">
          Sign in
        </a>
      </div>
    </form>
  );
}
