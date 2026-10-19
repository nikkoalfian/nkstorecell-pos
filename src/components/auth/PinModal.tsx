import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, X, Delete, AlertCircle } from 'lucide-react';

export const PinModal: React.FC = () => {
  const { pinModal, closePinModal, unlockOwner, verifyOwnerPin } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (pinModal.isOpen) {
      setPinInput('');
      setErrorMsg(null);
    }
  }, [pinModal.isOpen]);

  if (!pinModal.isOpen) return null;

  const handleDigitClick = (digit: string) => {
    if (pinInput.length < 6) {
      const next = pinInput + digit;
      setPinInput(next);
      setErrorMsg(null);
      // Auto verify when 4 digits reached
      if (next.length === 4) {
        if (verifyOwnerPin(next)) {
          unlockOwner(next);
          if (pinModal.onSuccess) {
            pinModal.onSuccess();
          }
          closePinModal();
        } else {
          setErrorMsg('PIN Pemilik salah! Coba lagi.');
        }
      }
    }
  };

  const handleDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-center space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={closePinModal}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shield Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950">
          <Lock className="w-7 h-7" />
        </div>

        {/* Title & Desc */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-white text-lg tracking-tight">
            {pinModal.title || 'Verifikasi PIN Pemilik'}
          </h3>
          <p className="text-xs text-slate-400 px-2">
            {pinModal.description || 'Masukkan 4 digit PIN Owner untuk mengakses fitur ini'}
          </p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex justify-center items-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pinInput.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-amber-400 scale-125 shadow-md shadow-amber-500/50'
                    : 'bg-slate-800 border-2 border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Virtual Numpad */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigitClick(num)}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg active:scale-95 transition shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-3 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-400 font-semibold text-xs transition"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg active:scale-95 transition shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="py-3 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition active:scale-95"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Hint text */}
        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
          <span>PIN bawaan default: <strong className="text-slate-400 font-mono">1234</strong></span>
        </div>
      </div>
    </div>
  );
};
