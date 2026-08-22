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
      <body className="min-h-screen bg-[#03050a] flex items-center justify-center p-0 md:py-6 font-sans antialiased text-gray-100 selection:bg-purple-600 selection:text-white">
        {/* Mobile Device Shell */}
        <div className="w-full max-w-[420px] h-screen md:h-[860px] max-h-screen md:max-h-[860px] galaxy-bg stars-overlay md:rounded-[44px] shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden border-0 md:border-[8px] md:border-[#121727]">
          
          {/* Top Notch / Speaker */}
          <div className="hidden md:flex justify-center pt-2.5 pb-1 bg-transparent shrink-0">
            <div className="w-20 h-3.5 bg-[#121727] rounded-full border border-purple-500/20"></div>
          </div>

          {/* Root Content Frame */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}