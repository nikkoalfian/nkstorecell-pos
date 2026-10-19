import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { KasbonRecord } from '../../types';
import { formatRupiah, formatDateIndo, cleanPhoneNumber } from '../../utils/formatters';
import {
  BookOpen,
  Plus,
  Search,
  MessageCircle,
  CheckCircle,
  Clock,
  Trash2,
  DollarSign,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';

export const KasbonManager: React.FC = () => {
  const { kasbonList, addKasbon, settleKasbon, deleteKasbon, accounts, settings } = useApp();

  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('unpaid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  // Stats
  const totalUnpaid = useMemo(() => {
    return kasbonList.filter((k) => !k.isPaid).reduce((sum, k) => sum + k.amount, 0);
  }, [kasbonList]);

  const totalPaid = useMemo(() => {
    return kasbonList.filter((k) => k.isPaid).reduce((sum, k) => sum + k.amount, 0);
  }, [kasbonList]);

  const unpaidCount = useMemo(() => kasbonList.filter((k) => !k.isPaid).length, [kasbonList]);

  const filteredList = useMemo(() => {
    return kasbonList.filter((item) => {
      const matchFilter =
        filter === 'all' ? true : filter === 'unpaid' ? !item.isPaid : item.isPaid;
      const matchSearch =
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerPhone.includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [kasbonList, filter, searchTerm]);

  const handleOpenAdd = () => {
    setCustomerName('');
    setCustomerPhone('');
    setAmount('');
    setDescription('Pulsa / Barang tempo');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !amount) return;

    addKasbon({
      customerName,
      customerPhone,
      amount: Number(amount),
      description: description || 'Kasbon pulsa/barang',
    });

    setIsAddModalOpen(false);
  };

  const handleSendReminderWA = (record: KasbonRecord) => {
    if (!record.customerPhone) {
      alert('Nomor WhatsApp pelanggan belum terdaftar pada catatan ini.');
      return;
    }

    const clean = cleanPhoneNumber(record.customerPhone);
    const text = `Halo Kak *${record.customerName}*, salam dari *${settings.storeName}*.

Sekadar mengingatkan catatan kasbon di konter kami:
📌 *Rincian:* ${record.description}
💰 *Total:* ${formatRupiah(record.amount)}
📅 *Tanggal:* ${formatDateIndo(record.date)}

Pembayaran bisa dilakukan secara tunai di konter atau transfer ya kak. Terima kasih banyak atas kerjasamanya! 🙏😊`;

    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-800/50">
          <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
            <span className="font-semibold uppercase tracking-wider">Total Kasbon Belum Lunas</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
            {formatRupiah(totalUnpaid)}
          </div>
          <p className="text-xs text-amber-200/70 mt-1">
            Dari {unpaidCount} catatan kasbon yang belum dibayar pelanggan
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Kasbon Sudah Lunas</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
            {formatRupiah(totalPaid)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Piutang yang telah berhasil ditagih</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 mb-1">Tambah Catatan Hutang Baru</div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition"
          >
            <Plus className="w-4 h-4" /> Catat Kasbon Pelanggan
          </button>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Catat kasbon pulsa, kuota, atau aksesoris
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pelanggan / no HP / keterangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('unpaid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              filter === 'unpaid'
                ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Belum Lunas ({unpaidCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              filter === 'paid'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Sudah Lunas
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              filter === 'all'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Kasbon Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
              item.isPaid
                ? 'bg-slate-900/60 border-slate-800/80 opacity-75'
                : 'bg-slate-900 border-amber-900/40 shadow-lg'
            }`}
          >
            <div>
              {/* Header: Name and Status Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{item.customerName}</h4>
                  {item.customerPhone ? (
                    <span className="text-xs font-mono text-slate-400 block">{item.customerPhone}</span>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">No HP tidak ada</span>
                  )}
                </div>

                {item.isPaid ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> LUNAS
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800/60 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> BELUM LUNAS
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 mb-2">
                {item.description}
              </p>

              {/* Date */}
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Tanggal: {formatDateIndo(item.date)}</span>
                {item.paidDate && <span className="text-emerald-400">Lunas: {formatDateIndo(item.paidDate)}</span>}
              </div>
            </div>

            {/* Bottom: Amount and Action Buttons */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">Jumlah Kasbon:</span>
                <span className={`text-base font-extrabold font-mono ${item.isPaid ? 'text-slate-400' : 'text-amber-400'}`}>
                  {formatRupiah(item.amount)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {!item.isPaid && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSendReminderWA(item)}
                      title="Kirim pesan penagihan via WhatsApp"
                      className="p-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Tagih WA
                    </button>
                    <button
                      type="button"
                      onClick={() => settleKasbon(item.id)}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" /> Lunasi
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus catatan kasbon ${item.customerName}?`)) {
                      deleteKasbon(item.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-300 transition"
                  title="Hapus Catatan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold">Tidak ada data catatan kasbon</p>
          <p className="text-xs text-slate-500 mt-1">Semua catatan telah lunas atau filter pencarian kosong.</p>
        </div>
      )}

      {/* Modal Add Kasbon */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Catat Kasbon Pelanggan Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Nama Pelanggan:</label>
                <input
                  type="text"
                  placeholder="Nama pelanggan / penghutang"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">No. WhatsApp Pelanggan (Untuk Tagih):</label>
                <input
                  type="tel"
                  placeholder="Nomor WhatsApp (08...)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Jumlah Kasbon (Rp):</label>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-bold font-mono text-amber-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Keterangan / Janji Bayar:</label>
                <input
                  type="text"
                  placeholder="Keterangan transaksi / janji bayar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!customerName || !amount}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Simpan Kasbon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
