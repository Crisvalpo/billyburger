'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, MessageCircle, Heart, Tv, Settings } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 bg-[#08090b] border-t border-white/5 pt-12 pb-24 text-zinc-400 text-xs">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
        {/* Logo and branding */}
        <div className="relative w-14 h-14 rounded-full p-2 bg-gradient-to-tr from-amber-500 to-orange-500 shadow-xl shadow-orange-500/20 mb-3">
          <Image
            src="/images/logo.png"
            alt="Billy Burger"
            width={56}
            height={56}
            className="w-full h-full object-contain filter invert"
          />
        </div>

        <h3 className="text-lg font-black text-white tracking-tight">
          BILLY<span className="text-amber-400">BURGER</span>
        </h3>
        <p className="mt-1 text-zinc-400 max-w-sm">
          Hamburguesas caseras, sándwiches tradicionales, chorrillanas para compartir y la mejor atención.
        </p>

        {/* Contact buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href="https://wa.me/56932553527"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center gap-2 border border-white/5 transition"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>+56 9 3255 3527</span>
          </a>
          <a
            href="tel:+56932553527"
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center gap-2 border border-white/5 transition"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span>Llamar al Local</span>
          </a>
        </div>

        {/* System Links */}
        <div className="mt-8 pt-6 border-t border-white/5 w-full flex flex-wrap items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div className="flex items-center gap-4 mx-auto sm:mx-0">
            <Link href="/tv" className="hover:text-amber-400 flex items-center gap-1 transition">
              <Tv className="w-3.5 h-3.5" />
              <span>Modo Cartelería TV</span>
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-amber-400 flex items-center gap-1 transition">
              <Settings className="w-3.5 h-3.5" />
              <span>Gestión / Admin</span>
            </Link>
          </div>

          <p className="mx-auto sm:mx-0 flex items-center gap-1">
            <span>Diseñado con</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>por Narkis & Luke</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
