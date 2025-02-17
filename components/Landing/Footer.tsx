import Image from "next/image";
import logo from "@/public/logo.png";

export const Footer = () => {
  return (
    <footer className="bg-white text-[#BCBCBC] text-sm py-10 text-center">
      <div className="container">
        <div className="inline-flex relative before:content-[''] before:top-2 before:bottom-0 before:w-full before:blur before:bg-[linear-gradient(to_right,#F87BFF,#FB92CF,#FFDD9B,#C2F0B1,#2FD8FE)] before:absolute">
          <Image src={logo} alt="logo" height={40} className="relative" />
        </div>
        <p className="mt-6">&copy; 2025
       Made with ❤️ by Aryan and Ayush.</p>
      </div>
    </footer>
  );
};
