import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "TextPrep Pro — NLP Text Preprocessing App",
  description: "A simple and powerful text preprocessing tool for NLP and machine learning projects.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-canvas text-ink font-sans text-body antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#15181e",
              color: "#ffffff",
              borderRadius: "8px",
              fontSize: "14px",
              border: "1px solid #3b3d45",
            },
          }}
        />
      </body>
    </html>
  )
}
