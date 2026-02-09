"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#12141a]/90 backdrop-blur-xl border-b border-[#2a2e3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Image
                src="/images/police-oasis.png"
                alt="Policia Oasis Logo"
                width={44}
                height={44}
                className="rounded-full ring-2 ring-[#4a5568]/50 group-hover:ring-[#64a0e6]/50 transition-all"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[#c8d0dc] font-bold text-sm tracking-widest uppercase">Policia Oasis</span>
              <span className="text-[#5a6478] text-[10px] tracking-wider uppercase">Servir e Proteger</span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === "/"
                  ? "bg-[#1e2230] text-[#e2e8f0] shadow-sm"
                  : "text-[#7a8698] hover:text-[#c8d0dc] hover:bg-[#1a1e28]"
              }`}
            >
              Recrutamento
            </Link>
            <Link
              href="/tafs"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === "/tafs"
                  ? "bg-[#1e2230] text-[#e2e8f0] shadow-sm"
                  : "text-[#7a8698] hover:text-[#c8d0dc] hover:bg-[#1a1e28]"
              }`}
            >
              TAFs Realizados
            </Link>
            <Link
              href="/tafs-reprovados"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === "/tafs-reprovados"
                  ? "bg-[#1e2230] text-[#e2e8f0] shadow-sm"
                  : "text-[#7a8698] hover:text-[#c8d0dc] hover:bg-[#1a1e28]"
              }`}
            >
              TAFs Reprovados
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
