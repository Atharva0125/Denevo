import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Denevo App",
  description: "From Promise to Done",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 flex items-center justify-center p-0 md:py-8 font-sans antialiased text-gray-900 selection:bg-purple-500 selection:text-white">
        {/* Mobile Device Frame Mockup */}
        <div className="w-full max-w-[420px] min-h-screen md:min-h-[860px] md:h-[860px] bg-white md:rounded-[44px] shadow-2xl flex flex-col relative overflow-hidden border-0 md:border-[8px] md:border-slate-800">
          
          {/* Native-style Speaker Notch Bar (Desktop Only) */}
          <div className="hidden md:flex justify-center pt-2 pb-1 bg-white">
            <div className="w-20 h-4 bg-slate-900 rounded-full"></div>
          </div>

          {/* App Screen Content Viewport */}
          <div className="flex-1 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}