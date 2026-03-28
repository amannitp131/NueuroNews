import "./globals.css";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "../components/core/AuthProvider";
import ModernNavbar from "../components/core/ModernNavbar";

const displayFont = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const monoFont = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });

export const metadata = {
  title: "NeuroNews - Personal Business Intelligence OS",
  description: "AI-powered personalized business intelligence from live news streams"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${monoFont.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <ModernNavbar />
          <div className="pt-16">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
