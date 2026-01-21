import type { Metadata } from "next";
import DefaultBanner from "@/assets/images/default-banner.png";

export const metadata: Metadata = {
  title: "OPanel"
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-[100vw] h-[100vh] flex">
      <div className="flex-2/5 h-full bg-cover bg-center max-lg:hidden" style={{ backgroundImage: `url(${DefaultBanner.src})` }}/>
      <div className="flex-3/5 border-l shadow-2xl z-10 flex justify-center items-center">
        {children}
      </div>
    </div>
  );
}
