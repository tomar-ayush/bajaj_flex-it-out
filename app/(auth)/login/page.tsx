import { LoginForm } from "@/components/auth/login/login-form";
import loginImage from "@/public/login-image.avif";
import logo from "@/public/logo.png";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Flex It Out | Login",
  description: "Flex It Out",
};



export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-16 sm:mt-0 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/"
            className="flex rounded outline-none font-bold text-3xl focus:ring-gray-900 focus:ring-offset-2"
          >
            <Image
              src={logo}
              alt="logo"
              width={55}
              height={55}
              className="relative bottom-2 mr-2"
            />
            <div className="flex">
              FlexIt
              <span className="text-blue-600">Out</span>.
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src={loginImage}
          alt="Login Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
