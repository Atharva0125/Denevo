import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Denevo AI",
  description: "From Promise to Done",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#03050a] flex items-center justify-center p-0 md:py-8 font-sans antialiased text-gray-100 selection:bg-purple-600 selection:text-white">
        {/* Mobile Device Frame */}
        <div className="w-full max-w-[420px] min-h-screen md:min-h-[860px] md:h-[860px] galaxy-bg stars-overlay md:rounded-[44px] shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(147,51,234,0.2)] flex flex-col relative overflow-hidden border-0 md:border-[8px] md:border-[#121727]">
          
          {/* Speaker Notch */}
          <div className="hidden md:flex justify-center pt-2.5 pb-1 bg-transparent">
            <div className="w-20 h-4 bg-[#121727] rounded-full border border-purple-500/20"></div>
          </div>

          {/* App Content Viewport */}
          <div className="flex-1 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}