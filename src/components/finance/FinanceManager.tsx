import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AccountBalance } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  Wallet,
  ArrowRightLeft,
  PlusCircle,
  MinusCircle,
  Building2,
  Server,
  Banknote,
  QrCode,
  DollarSign,
  TrendingUp,
  RefreshCw,
  X,
  Check,
} from 'lucide-react';

export const FinanceManager: React.FC = () => {
  const { accounts, updateAccountBalance, transferBetweenAccounts, adjustCashMutation } = useApp();

  const [activeModal, setActiveModal] = useState<'transfer' | 'income_expense' | 'edit_balance' | null>(null);
  const [selectedAcc, setSelectedAcc] = useState<AccountBalance | null>(null);

  // Transfer Form State
  const [transferFromId, setTransferFromId] = useState<string>(accounts[0]?.id || '');
  const [transferToId, setTransferToId] = useState<string>(accounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState<number | ''>('');
  const [transferNotes, setTransferNotes] = useState('');

  // Income / Expense Form State
  const [opType, setOpType] = useState<'masuk' | 'keluar'>('keluar');
  const [opAccountId, setOpAccountId] = useState<string>(accounts[0]?.id || '');
  const [opAmount, setOpAmount] = useState<number | ''>('');
  const [opCategory, setOpCategory] = useState<'Operasional' | 'Setor Kas' | 'Tarik Modal' | 'Top Up Server' | 'Koreksi Saldo' | 'Lainnya'>('Operasional');
  const [opNotes, setOpNotes] = useState('');

  // Direct Balance Edit Form
  const [newBalanceInput, setNewBalanceInput] = useState<number>(0);

  const totalLiquidAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getAccountIcon = (type: AccountBalance['type']) => {
    switch (type) {
      case 'cash':
        return <Banknote className="w-5 h-5" />;
      case 'server_pulsa':
        return <Server className="w-5 h-5" />;
      case 'bank':
        return <Building2 className="w-5 h-5" />;
      case 'ewallet':
        return <QrCode className="w-5 h-5" />;
    }
  };

  const handleOpenTransfer = () => {
    setTransferFromId(accounts[0]?.id || '');
    setTransferToId(accounts[1]?.id || '');
    setTransferAmount('');
    setTransferNotes('Pindah saldo / Setoran kas');
    setActiveModal('transfer');
  };

  const handleOpenOp = (type: 'masuk' | 'keluar') => {
    setOpType(type);
    setOpAccountId(accounts[0]?.id || '');
    setOpAmount('');
    setOpCategory(type === 'keluar' ? 'Operasional' : 'Lainnya');
    setOpNotes(type === 'keluar' ? 'Biaya operasional toko' : 'Pendapatan non-transaksi');
    setActiveModal('income_expense');
  };

  const handleOpenEditBalance = (acc: AccountBalance) => {
    setSelectedAcc(acc);
    setNewBalanceInput(acc.balance);
    setActiveModal('edit_balance');
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(transferAmount);
    if (!amt || amt <= 0 || transferFromId === transferToId) return;

    transferBetweenAccounts(transferFromId, transferToId, amt, transferNotes);
    setActiveModal(null);
  };

  const handleExecuteOp = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(opAmount);
    if (!amt || amt <= 0) return;

    adjustCashMutation({
      type: opType,
      fromAccountId: opType === 'keluar' ? opAccountId : undefined,
      toAccountId: opType === 'masuk' ? opAccountId : undefined,
      amount: amt,
      category: opCategory,
      notes: opNotes,
    });
    setActiveModal(null);
  };

  const handleSaveBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAcc) return;
    updateAccountBalance(selectedAcc.id, newBalanceInput);
    setActiveModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Total Aset Saldo Kas & Rekening */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold block mb-1">
            Total Modal Likuid Konter (Kas & Saldo)
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
            {formatRupiah(totalLiquidAssets)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Total akumulasi uang kasir di laci fisik, saldo server chip pulsa, dan saldo bank operasional.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleOpenTransfer}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-900/30 transition"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Pindah / Mutasi Saldo
          </button>
          <button
            type="button"
            onClick={() => handleOpenOp('keluar')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-rose-300 border border-slate-700 hover:border-rose-700 font-semibold text-xs flex items-center gap-2 transition"
          >
            <MinusCircle className="w-4 h-4 text-rose-400" />
            Catat Pengeluaran Toko
          </button>
          <button
            type="button"
            onClick={() => handleOpenOp('masuk')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-900/50 text-emerald-300 border border-slate-700 hover:border-emerald-700 font-semibold text-xs flex items-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            Catat Kas Masuk
          </button>
        </div>
      </div>

      {/* Accounts List Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Rincian Akun & Dompet Konter
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: acc.color }}
                    >
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{acc.name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        {acc.type === 'cash'
                          ? 'Uang Tunai Fisik'
                          : acc.type === 'server_pulsa'
                          ? 'Server Pulsa / PPOB'
                          : acc.type === 'bank'
                          ? 'Rekening Bank'
                          : 'Dompet Digital / QRIS'}
                      </span>
                    </div>
                  </div>
                </div>

                {acc.accountNumber && (
                  <div className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 mb-2">
                    No. Rek / Akun: <strong className="text-slate-200">{acc.accountNumber}</strong>
                  </div>
                )}

                {acc.description && (
                  <p className="text-[11px] text-slate-500 mb-2">{acc.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Saldo Saat Ini:</span>
                  <div className="text-xl font-bold font-mono text-white">{formatRupiah(acc.balance)}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEditBalance(acc)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                  title="Sesuaikan Saldo Manual"
                >
                  Edit Saldo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Mutasi / Transfer Saldo */}
      {activeModal === 'transfer' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                Pindah / Mutasi Saldo
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Dari Akun (Sumber):</label>
                <select
                  value={transferFromId}
                  onChange={(e) => setTransferFromId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatRupiah(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Ke Akun (Tujuan):</label>
                <select
                  value={transferToId}
                  onChange={(e) => setTransferToId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatRupiah(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Jumlah Yang Dipindahkan (Rp):</label>
                <input
                  type="number"
                  min="1"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 1000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-bold font-mono text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Keterangan / Alasan:</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!transferAmount || transferFromId === transferToId}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Proses Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Income / Expense */}
      {activeModal === 'income_expense' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {opType === 'keluar' ? 'Catat Pengeluaran Toko / Kasir' : 'Catat Pemasukan Kas'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteOp} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  {opType === 'keluar' ? 'Diambil Dari Akun:' : 'Dimasukkan Ke Akun:'}
                </label>
                <select
                  value={opAccountId}
                  onChange={(e) => setOpAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatRupiah(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Nominal (Rp):</label>
                <input
                  type="number"
                  min="1"
                  value={opAmount}
                  onChange={(e) => setOpAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 25000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-bold font-mono text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Kategori:</label>
                <select
                  value={opCategory}
                  onChange={(e) => setOpCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Operasional">Operasional (ATK, Struk, Listrik Toko)</option>
                  <option value="Top Up Server">Top Up Server Pulsa</option>
                  <option value="Setor Kas">Setor Kas ke Bank</option>
                  <option value="Tarik Modal">Tarik Modal / Prive Pemilik</option>
                  <option value="Koreksi Saldo">Koreksi Saldo</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Keterangan / Catatan:</label>
                <input
                  type="text"
                  placeholder="Contoh: Beli 5 roll kertas struk thermal 58mm"
                  value={opNotes}
                  onChange={(e) => setOpNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!opAmount}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                    opType === 'keluar' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  <Check className="w-4 h-4" /> Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Balance Direct */}
      {activeModal === 'edit_balance' && selectedAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Penyesuaian Saldo Manual</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBalance} className="p-5 space-y-4 text-xs">
              <div>
                <div className="text-slate-400 mb-1">Akun:</div>
                <div className="font-semibold text-white text-sm">{selectedAcc.name}</div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Set Saldo Baru Real (Rp):</label>
                <input
                  type="number"
                  value={newBalanceInput}
                  onChange={(e) => setNewBalanceInput(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-bold font-mono text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Gunakan ini saat melakukan opname kas atau jika ada selisih fisik di kasir / mutasi bank.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Update Saldo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
