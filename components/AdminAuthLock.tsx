'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, KeyRound, ArrowLeft, Loader2, ShieldCheck, Delete } from 'lucide-react';

interface AdminAuthLockProps {
  onAuthenticated: () => void;
}

export function AdminAuthLock({ onAuthenticated }: AdminAuthLockProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (pinValue?: string) => {
    const pinToTest = pinValue !== undefined ? pinValue : pin;
    if (!pinToTest.trim()) return;

    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToTest }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('billy_admin_auth', data.token);
        }
        onAuthenticated();
      } else {
        setError(data.error || 'PIN incorrecto. Intenta de nuevo.');
        setPin('');
      }
    } catch (err: any) {
      setError('Error al verificar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (num: string) => {
    if (loading) return;
    if (pin.length < 8) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        handleSubmit(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (loading) return;
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#090a0d] text-white flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
      <div className="w-full max-w-sm bg-[#12141c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in duration-300">
        {/* Logo and Lock Emblem */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center p-2 shadow-xl shadow-amber-500/20">
            <Image
              src="/images/logo-icon.png"
              alt="BillyBurger"
              width={42}
              height={42}
              className="object-contain"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-black/90 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        <h1 className="text-xl font-black text-white tracking-wide">
          Acceso de Dueños
        </h1>
        <p className="text-xs text-zinc-400 mt-1 mb-6">
          Ingresa el PIN de seguridad para gestionar la carta y menuboards
        </p>

        {/* PIN Dots Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                pin.length > idx
                  ? 'bg-amber-400 border-amber-400 scale-110 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-black/60 border-zinc-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="w-full mb-4 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-in shake">
            {error}
          </div>
        )}

        {/* Teclado Numérico Táctil */}
        <div className="w-full grid grid-cols-3 gap-2.5 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={loading}
              onClick={() => handleKeyPress(digit)}
              className="h-14 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 active:bg-amber-500 active:text-black font-black text-lg transition border border-white/5 active:scale-95 disabled:opacity-50"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            disabled={loading || pin.length === 0}
            onClick={() => {
              setPin('');
              setError('');
            }}
            className="h-14 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-wider transition border border-white/5 active:scale-95 disabled:opacity-30"
          >
            Limpiar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 active:bg-amber-500 active:text-black font-black text-lg transition border border-white/5 active:scale-95 disabled:opacity-50"
          >
            0
          </button>
          <button
            type="button"
            disabled={loading || pin.length === 0}
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 font-bold flex items-center justify-center transition border border-white/5 active:scale-95 disabled:opacity-30"
            title="Borrar dígito"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Botón de Entrada Alternativo */}
        <button
          type="button"
          disabled={loading || pin.length === 0}
          onClick={() => handleSubmit()}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 active:scale-98 disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          <span>Desbloquear Panel</span>
        </button>

        <div className="mt-6 pt-4 border-t border-white/5 w-full flex items-center justify-center">
          <Link
            href="/"
            className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la Carta</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
