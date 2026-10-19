import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ShiftRecord, ServerShiftItem } from '../../types';
import { formatRupiah, formatDateIndo, generateInvoiceNo } from '../../utils/formatters';
import {
  Clock,
  User,
  Server,
  DollarSign,
  TrendingUp,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Banknote,
  Eye,
  Trash2,
  Calendar,
  PlayCircle,
  Zap,
  ShoppingBag,
  Send,
  Sliders,
  Check,
  X,
  Calculator,
} from 'lucide-react';

export const ShiftManager: React.FC = () => {
  const {
    shifts,
    activeShift,
    openShift,
    updateActiveShiftServer,
    addShiftTopUp,
    addShiftExpense,
    closeShift,
    deleteShift,
    addTransaction,
    setActiveShiftReceipt,
    settings,
  } = useApp();

  // Buka Shift Form State
  const [showBukaShiftModal, setShowBukaShiftModal] = useState(false);
  const [bukaCashierName, setBukaCashierName] = useState(settings.ownerName || 'Nikko (Kasir Shift)');
  const [bukaCashDrawer, setBukaCashDrawer] = useState<number | ''>(1000000);
  const [bukaServer1, setBukaServer1] = useState<number | ''>(282854);
  const [bukaServer2, setBukaServer2] = useState<number | ''>(1000000);
  const [bukaServer3, setBukaServer3] = useState<number | ''>(800000);
  const [bukaServer4, setBukaServer4] = useState<number | ''>(1800000);

  // Simulation Feedback Toast
  const [simToast, setSimToast] = useState<string | null>(null);

  // Top Up & Expense Modals
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedTopUpServerId, setSelectedTopUpServerId] = useState('server-1');
  const [topUpAmount, setTopUpAmount] = useState<number | ''>('');

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('');
  const [expenseNote, setExpenseNote] = useState('');

  // STANDALONE SIMULATOR & KALKULATOR AKTUAL (Bisa diuji langsung di layar utama)
  const [simServerIdx, setSimServerIdx] = useState(0); // 0: Digipos, 1: SiDompul, 2: Mobo, 3: Multi
  const [simTotalSaldo, setSimTotalSaldo] = useState<number | ''>(282854);
  const [simSaldoAkhir, setSimSaldoAkhir] = useState<number | ''>(132748);
  const [simPenjualan, setSimPenjualan] = useState<number | ''>(186000);

  // Tutup Shift Form State
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);

  // Total Saldo Modal 4 Server (bisa diedit langsung saat rekap / pengujian)
  const [modalTotalSaldos, setModalTotalSaldos] = useState<[number | '', number | '', number | '', number | '']>([
    282854,
    1000000,
    900000,
    1800000,
  ]);

  // Saldo Akhir 4 Server
  const [finalBalances, setFinalBalances] = useState<[number | '', number | '', number | '', number | '']>([
    132748,
    760000,
    720000,
    1450000,
  ]);

  // Penjualan 4 Server
  const [serverGrossSales, setServerGrossSales] = useState<[number | '', number | '', number | '', number | '']>([
    186000,
    270000,
    200000,
    395000,
  ]);

  // Uang Fisik Kasir di Laci (Cash Opname)
  const [actualCashDrawer, setActualCashDrawer] = useState<number | ''>('');
  const [closeNotes, setCloseNotes] = useState('');

  // Preset Saldo Awal Helper
  const handleApplyPreset = (type: 'digipos' | 'standar' | 'besar' | 'kosong') => {
    if (type === 'digipos') {
      setBukaCashDrawer(500000);
      setBukaServer1(282854);
      setBukaServer2(1000000);
      setBukaServer3(800000);
      setBukaServer4(1800000);
    } else if (type === 'standar') {
      setBukaCashDrawer(1000000);
      setBukaServer1(2000000);
      setBukaServer2(1500000);
      setBukaServer3(1000000);
      setBukaServer4(2500000);
    } else if (type === 'besar') {
      setBukaCashDrawer(2500000);
      setBukaServer1(5000000);
      setBukaServer2(3500000);
      setBukaServer3(2000000);
      setBukaServer4(6000000);
    } else {
      setBukaCashDrawer('');
      setBukaServer1('');
      setBukaServer2('');
      setBukaServer3('');
      setBukaServer4('');
    }
  };

  const totalBukaServers =
    (Number(bukaServer1) || 0) +
    (Number(bukaServer2) || 0) +
    (Number(bukaServer3) || 0) +
    (Number(bukaServer4) || 0);

  // Standalone Simulator Math Calculation
  const simNumTotal = typeof simTotalSaldo === 'number' ? simTotalSaldo : 0;
  const simNumAkhir = typeof simSaldoAkhir === 'number' ? simSaldoAkhir : 0;
  const simNumSales = typeof simPenjualan === 'number' ? simPenjualan : 0;
  // RUMUS PERMINTAAN USER: (Penjualan + Saldo Akhir) - Total Saldo = Laba Bersih
  const simProfit = (simNumSales + simNumAkhir) - simNumTotal;
  const simUsage = Math.max(0, simNumTotal - simNumAkhir);

  // Set preset for standalone simulator
  const handleSetSimPreset = (type: 'digipos' | 'sidompul' | 'mobo' | 'multi') => {
    if (type === 'digipos') {
      setSimServerIdx(0);
      setSimTotalSaldo(282854);
      setSimSaldoAkhir(132748);
      setSimPenjualan(186000);
      setSimToast('✅ Uji Coba Digipos: Total 282.854, Akhir 132.748, Jual 186.000 -> Laba Bersih Rp 35.894');
    } else if (type === 'sidompul') {
      setSimServerIdx(1);
      setSimTotalSaldo(1000000);
      setSimSaldoAkhir(760000);
      setSimPenjualan(270000);
      setSimToast('✅ Uji Coba SiDompul: Total 1.000.000, Akhir 760.000, Jual 270.000 -> Laba Bersih Rp 30.000');
    } else if (type === 'mobo') {
      setSimServerIdx(2);
      setSimTotalSaldo(900000);
      setSimSaldoAkhir(720000);
      setSimPenjualan(200000);
      setSimToast('✅ Uji Coba Mobo Indosat: Total 900.000, Akhir 720.000, Jual 200.000 -> Laba Bersih Rp 20.000');
    } else if (type === 'multi') {
      setSimServerIdx(3);
      setSimTotalSaldo(1800000);
      setSimSaldoAkhir(1450000);
      setSimPenjualan(395000);
      setSimToast('✅ Uji Coba Multi PPOB: Total 1.800.000, Akhir 1.450.000, Jual 395.000 -> Laba Bersih Rp 45.000');
    }
    setTimeout(() => setSimToast(null), 3500);
  };

  // Pre-fill Close Shift when modal opens
  const handleOpenCloseModal = () => {
    if (!activeShift) return;

    // Ambil saldo berjalan dari shift aktif
    const s1Total = activeShift.servers[0]?.initialBalance + (activeShift.servers[0]?.topUpAmount || 0);
    const s2Total = activeShift.servers[1]?.initialBalance + (activeShift.servers[1]?.topUpAmount || 0);
    const s3Total = activeShift.servers[2]?.initialBalance + (activeShift.servers[2]?.topUpAmount || 0);
    const s4Total = activeShift.servers[3]?.initialBalance + (activeShift.servers[3]?.topUpAmount || 0);

    setModalTotalSaldos([s1Total, s2Total, s3Total, s4Total]);

    // Berikan nilai default yang realistis agar langsung terlihat hitungan matematisnya
    setFinalBalances([
      132748,
      s2Total > 240000 ? s2Total - 240000 : 760000,
      s3Total > 180000 ? s3Total - 180000 : 720000,
      s4Total > 350000 ? s4Total - 350000 : 1450000,
    ]);

    setServerGrossSales([
      186000,
      270000,
      200000,
      395000,
    ]);

    setActualCashDrawer(activeShift.initialCashDrawer + 186000 + 270000 + 200000 + 395000);
    setCloseNotes('');
    setShowCloseShiftModal(true);
  };

  // Auto-Fill Exact User Simulation Data:
  // Server 1 Digipos: Total 282.854, Akhir 132.748, Penjualan 186.000 -> Laba Bersih 35.894
  const handleAutoFillSimulationClose = () => {
    if (!activeShift) return;

    // 1. Set Total Saldo Modal secara eksplisit sesuai simulasi user
    setModalTotalSaldos([282854, 1000000, 900000, 1800000]);
    // 2. Set Saldo Akhir
    setFinalBalances([132748, 760000, 720000, 1450000]);
    // 3. Set Penjualan
    setServerGrossSales([186000, 270000, 200000, 395000]);

    // Perbarui saldo awal di activeShift agar tetap sinkron
    updateActiveShiftServer(0, { initialBalance: 282854 });

    // Hitung ekspektasi kas laci
    const totalSimSales = 186000 + 270000 + 200000 + 395000;
    const totalExp = activeShift.expenses.reduce((sum, e) => sum + e.amount, 0);
    const expectedDrawer =
      activeShift.initialCashDrawer +
      totalSimSales +
      activeShift.accessorySales +
      activeShift.transferAdminProfit -
      totalExp;

    setActualCashDrawer(expectedDrawer);
    setCloseNotes('Simulasi rekap shift: Server 1 Digipos terbukti laba bersih Rp 35.894');

    setSimToast('✨ Data simulasi aktual terisi: Server 1 Digipos Laba Bersih = Rp 35.894!');
    setTimeout(() => setSimToast(null), 4000);
  };

  // Quick Live Transaction Simulation during shift
  const handleQuickSimulateTransaction = (type: 'pulsa' | 'token' | 'transfer' | 'tarik' | 'aksesoris') => {
    if (!activeShift) return;

    if (type === 'pulsa') {
      addTransaction({
        invoiceNo: generateInvoiceNo('PLS'),
        type: 'pulsa',
        title: 'Pulsa Telkomsel 50.000',
        targetNumber: '081298881234',
        operator: 'Telkomsel',
        nominal: 50000,
        adminFee: 0,
        priceCost: 49800,
        totalAmount: 52000,
        profit: 2200,
        paymentMethod: 'tunai',
        amountPaid: 52000,
        changeAmount: 0,
        sourceAccountId: 'acc-server-1',
        serialNumber: 'SN' + Math.floor(100000000000 + Math.random() * 900000000000),
        status: 'sukses',
      });
      setSimToast('⚡ Transaksi Pulsa Rp 50.000 berhasil disimulasikan!');
    } else if (type === 'token') {
      addTransaction({
        invoiceNo: generateInvoiceNo('PLN'),
        type: 'token_pln',
        title: 'Token Listrik PLN 100.000',
        targetNumber: '14283920194',
        targetName: 'PAK SUKIRNO',
        operator: 'PLN',
        nominal: 100000,
        adminFee: 2500,
        priceCost: 100500,
        totalAmount: 103000,
        profit: 2500,
        paymentMethod: 'tunai',
        amountPaid: 103000,
        changeAmount: 0,
        sourceAccountId: 'acc-server-4',
        serialNumber: '2910-4820-1940-8291-5019',
        status: 'sukses',
      });
      setSimToast('⚡ Transaksi Token Listrik PLN Rp 100.000 berhasil disimulasikan!');
    } else if (type === 'transfer') {
      addTransaction({
        invoiceNo: generateInvoiceNo('TRF'),
        type: 'transfer_uang',
        title: 'Transfer Uang ke BRI',
        targetNumber: '020601048291501',
        targetName: 'HENDRA PRASETYO',
        providerBank: 'BRI',
        nominal: 350000,
        adminFee: 5000,
        priceCost: 350000,
        totalAmount: 355000,
        profit: 5000,
        paymentMethod: 'tunai',
        amountPaid: 355000,
        changeAmount: 0,
        serialNumber: 'RRN' + Math.floor(100000000000 + Math.random() * 900000000000),
        status: 'sukses',
      });
      setSimToast('💳 Transaksi Transfer Bank Rp 350.000 (Admin Rp 5.000) berhasil disimulasikan!');
    } else if (type === 'tarik') {
      addTransaction({
        invoiceNo: generateInvoiceNo('TRK'),
        type: 'tarik_tunai',
        title: 'Tarik Tunai Kasir (Transfer Masuk BCA)',
        targetName: 'RUDI HERMAWAN',
        providerBank: 'BCA',
        nominal: 200000,
        adminFee: 5000,
        priceCost: 200000,
        totalAmount: 205000,
        profit: 5000,
        paymentMethod: 'transfer_bank',
        amountPaid: 205000,
        changeAmount: 0,
        serialNumber: 'RRN' + Math.floor(100000000000 + Math.random() * 900000000000),
        status: 'sukses',
      });
      setSimToast('💵 Transaksi Tarik Tunai Rp 200.000 (Admin Rp 5.000) berhasil disimulasikan!');
    } else if (type === 'aksesoris') {
      addTransaction({
        invoiceNo: generateInvoiceNo('ACC'),
        type: 'aksesoris',
        title: 'Penjualan Kabel Data Fast Charging Type-C',
        nominal: 25000,
        adminFee: 0,
        priceCost: 12000,
        totalAmount: 25000,
        profit: 13000,
        paymentMethod: 'tunai',
        amountPaid: 25000,
        changeAmount: 0,
        serialNumber: 'POS-ACC-TEST',
        status: 'sukses',
        items: [{ name: 'Kabel Data Fast Charging Type-C 65W', quantity: 1, priceSell: 25000, priceCost: 12000 }],
      });
      setSimToast('📱 Penjualan Aksesoris Rp 25.000 (Laba Rp 13.000) berhasil disimulasikan!');
    }

    setTimeout(() => setSimToast(null), 3000);
  };

  // Calculations for Tutup Shift strictly based on user's formula:
  // Laba Bersih = (Penjualan + Saldo Akhir) - Total Saldo
  const computedShiftRecap = useMemo(() => {
    if (!activeShift) return null;

    let totalUsage = 0;
    let totalSales = 0;
    let totalPulseProfit = 0;

    const serverStats = activeShift.servers.map((srv, idx) => {
      // Total Saldo Modal (ambil dari modalTotalSaldos yang bisa diedit / disimulasikan)
      const totalAvailable = typeof modalTotalSaldos[idx] === 'number'
        ? Number(modalTotalSaldos[idx])
        : (srv.initialBalance + (srv.topUpAmount || 0));

      const finalBal = typeof finalBalances[idx] === 'number' ? Number(finalBalances[idx]) : 0;
      const usage = Math.max(0, totalAvailable - finalBal);

      const sales = typeof serverGrossSales[idx] === 'number' ? Number(serverGrossSales[idx]) : 0;

      // RUMUS SESUAI PERMINTAAN USER:
      // (penjualan + Saldo Akhir) - Total Saldo = laba bersih
      // Contoh Digipos: (186.000 + 132.748) - 282.854 = 35.894
      const profit = (sales + finalBal) - totalAvailable;

      totalUsage += usage;
      totalSales += sales;
      totalPulseProfit += profit;

      return {
        ...srv,
        finalBal,
        totalAvailable,
        usage,
        sales,
        profit,
      };
    });

    const totalExp = activeShift.expenses.reduce((sum, e) => sum + e.amount, 0);
    const overallNetProfit =
      totalPulseProfit +
      activeShift.accessoryProfit +
      activeShift.transferAdminProfit +
      activeShift.tarikTunaiAdminProfit -
      totalExp;

    const expectedCashDrawer =
      activeShift.initialCashDrawer +
      totalSales +
      activeShift.accessorySales +
      activeShift.transferAdminProfit -
      totalExp;

    const actCash = typeof actualCashDrawer === 'number' ? actualCashDrawer : expectedCashDrawer;
    const cashDiff = actCash - expectedCashDrawer;

    return {
      serverStats,
      totalUsage,
      totalSales,
      totalPulseProfit,
      totalExp,
      overallNetProfit,
      expectedCashDrawer,
      actCash,
      cashDiff,
    };
  }, [activeShift, modalTotalSaldos, finalBalances, serverGrossSales, actualCashDrawer]);

  // Handle Buka Shift Submit
  const handleBukaShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openShift({
      cashierName: bukaCashierName || 'Kasir',
      initialCashDrawer: Number(bukaCashDrawer) || 0,
      serverInitialBalances: [
        Number(bukaServer1) || 0,
        Number(bukaServer2) || 0,
        Number(bukaServer3) || 0,
        Number(bukaServer4) || 0,
      ],
      serverNames: settings.serverNames,
    });
    setShowBukaShiftModal(false);
    setSimToast('✅ Shift Baru berhasil dibuka dengan Saldo Awal 4 Server pilihan Anda!');
    setTimeout(() => setSimToast(null), 3000);
  };

  // Handle Submit Top Up
  const handleSubmitTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpAmount || Number(topUpAmount) <= 0) return;
    addShiftTopUp(selectedTopUpServerId, Number(topUpAmount));
    setShowTopUpModal(false);
    setTopUpAmount('');
  };

  // Handle Submit Expense
  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0) return;
    addShiftExpense(Number(expenseAmount), expenseNote || 'Pengeluaran operasional');
    setShowExpenseModal(false);
    setExpenseAmount('');
    setExpenseNote('');
  };

  // Handle Submit Tutup Shift
  const handleSubmitTutupShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    const totalSaldos: [number, number, number, number] = [
      Number(modalTotalSaldos[0]) || activeShift.servers[0]?.initialBalance || 0,
      Number(modalTotalSaldos[1]) || activeShift.servers[1]?.initialBalance || 0,
      Number(modalTotalSaldos[2]) || activeShift.servers[2]?.initialBalance || 0,
      Number(modalTotalSaldos[3]) || activeShift.servers[3]?.initialBalance || 0,
    ];

    const finalBals: [number, number, number, number] = [
      Number(finalBalances[0]) || 0,
      Number(finalBalances[1]) || 0,
      Number(finalBalances[2]) || 0,
      Number(finalBalances[3]) || 0,
    ];

    const sales: [number, number, number, number] = [
      Number(serverGrossSales[0]) || 0,
      Number(serverGrossSales[1]) || 0,
      Number(serverGrossSales[2]) || 0,
      Number(serverGrossSales[3]) || 0,
    ];

    closeShift({
      serverTotalBalances: totalSaldos,
      serverFinalBalances: finalBals,
      serverGrossSales: sales,
      actualFinalCashDrawer: typeof actualCashDrawer === 'number' ? actualCashDrawer : 0,
      notes: closeNotes,
    });

    setShowCloseShiftModal(false);
  };

  const serverColors = [
    'border-red-500/40 text-red-400 bg-red-950/20',
    'border-blue-500/40 text-blue-400 bg-blue-950/20',
    'border-yellow-500/40 text-yellow-400 bg-yellow-950/20',
    'border-cyan-500/40 text-cyan-400 bg-cyan-950/20',
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {simToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-medium text-xs shadow-2xl shadow-emerald-950 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{simToast}</span>
        </div>
      )}

      {/* 1. ACTIVE SHIFT HERO OR BUKA SHIFT HERO */}
      {activeShift ? (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-800/40 shadow-2xl space-y-6">
          {/* Shift Banner & Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Clock className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SHIFT AKTIF
                  </span>
                  <h2 className="text-white font-extrabold text-lg sm:text-xl">
                    Shift #{activeShift.shiftNumber} — {activeShift.cashierName}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mulai Buka: {formatDateIndo(activeShift.startTime)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowBukaShiftModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/50 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Buka shift baru dan input saldo awal kustom"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                Simulasi Buka Shift Baru
              </button>
              <button
                type="button"
                onClick={() => setShowTopUpModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-800/50 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4 text-blue-400" />
                Tambah Top Up Server
              </button>
              <button
                type="button"
                onClick={() => setShowExpenseModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-800/50 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <MinusCircle className="w-4 h-4 text-rose-400" />
                Catat Pengeluaran
              </button>
              <button
                type="button"
                onClick={handleOpenCloseModal}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                TUTUP SHIFT & REKAP
              </button>
            </div>
          </div>

          {/* 4 Servers Status Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4 text-blue-400" />
                Saldo Awal 4 Server Pulsa & Kuota Terpisah:
              </h3>
              <span className="text-[11px] text-slate-400">
                Nilai riil modal berjalan saat ini
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeShift.servers.map((srv, idx) => (
                <div
                  key={srv.serverId}
                  className={`p-4 rounded-2xl border ${serverColors[idx]} space-y-2.5`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase truncate">{srv.serverName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                      Server {idx + 1}
                    </span>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] text-slate-400 block">Total Saldo Modal:</span>
                    <div className="text-lg font-extrabold font-mono text-white">
                      {formatRupiah(srv.initialBalance + srv.topUpAmount)}
                    </div>
                    {srv.topUpAmount > 0 && (
                      <span className="text-[10px] text-blue-400 block">
                        (Awal: {formatRupiah(srv.initialBalance)} + Top Up: {formatRupiah(srv.topUpAmount)})
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex justify-between text-xs text-slate-300">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-semibold">Siap Transaksi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Shift Snapshot Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Modal Awal Kas Laci:</span>
              <div className="text-base font-bold font-mono text-white">
                {formatRupiah(activeShift.initialCashDrawer)}
              </div>
            </div>

            <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Laba Aksesoris Shift:</span>
              <div className="text-base font-bold font-mono text-emerald-400">
                +{formatRupiah(activeShift.accessoryProfit)}
              </div>
            </div>

            <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Laba Admin Transfer/Tarik:</span>
              <div className="text-base font-bold font-mono text-emerald-400">
                +{formatRupiah(activeShift.transferAdminProfit + activeShift.tarikTunaiAdminProfit)}
              </div>
            </div>

            <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Pengeluaran Kasir Shift:</span>
              <div className="text-base font-bold font-mono text-rose-400">
                -{formatRupiah(activeShift.totalExpenses)}
              </div>
            </div>
          </div>

          {/* INTERACTIVE STANDALONE CALCULATOR & SIMULATOR FOR SERVER NET PROFIT */}
          <div className="p-5 rounded-3xl bg-slate-950/95 border-2 border-emerald-500/40 shadow-2xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    Kalkulator & Simulator Laba Bersih Server Pulsa
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Rumus Aktual Terverifikasi
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Uji coba langsung rumus perhitungan laba bersih server secara real-time dengan angka riil Anda.
                  </p>
                </div>
              </div>

              {/* Formula Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-600/60 text-xs font-mono text-emerald-300">
                <span className="font-bold text-amber-300">RUMUS:</span>
                <span>(Penjualan + Saldo Akhir) - Total Saldo = Laba Bersih</span>
              </div>
            </div>

            {/* Quick Presets Row */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-slate-400 font-medium text-[11px]">Pilih Uji Coba Cepat:</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSetSimPreset('digipos')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border flex items-center gap-1.5 ${
                    simServerIdx === 0 && simTotalSaldo === 282854 && simSaldoAkhir === 132748 && simPenjualan === 186000
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/40'
                      : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-700/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  ✨ Contoh Digipos (Laba Rp 35.894)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetSimPreset('sidompul')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-300 border border-blue-900 font-semibold text-xs transition"
                >
                  Server 2 SiDompul
                </button>
                <button
                  type="button"
                  onClick={() => handleSetSimPreset('mobo')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-yellow-300 border border-yellow-900 font-semibold text-xs transition"
                >
                  Server 3 Mobo
                </button>
                <button
                  type="button"
                  onClick={() => handleSetSimPreset('multi')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-900 font-semibold text-xs transition"
                >
                  Server 4 Multi PPOB
                </button>
              </div>
            </div>

            {/* Server Selector Tab */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {activeShift.servers.map((srv, idx) => (
                <button
                  key={srv.serverId}
                  type="button"
                  onClick={() => {
                    setSimServerIdx(idx);
                    if (idx === 0) {
                      setSimTotalSaldo(282854);
                      setSimSaldoAkhir(132748);
                      setSimPenjualan(186000);
                    } else if (idx === 1) {
                      setSimTotalSaldo(1000000);
                      setSimSaldoAkhir(760000);
                      setSimPenjualan(270000);
                    } else if (idx === 2) {
                      setSimTotalSaldo(900000);
                      setSimSaldoAkhir(720000);
                      setSimPenjualan(200000);
                    } else {
                      setSimTotalSaldo(1800000);
                      setSimSaldoAkhir(1450000);
                      setSimPenjualan(395000);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    simServerIdx === idx
                      ? 'bg-slate-850 border-emerald-500 shadow-md text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span>Server {idx + 1}</span>
                    {simServerIdx === idx && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-xs font-bold truncate text-slate-200 mt-0.5">{srv.serverName}</div>
                </button>
              ))}
            </div>

            {/* 3 Interactive Inputs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Input 1: Total Saldo */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-blue-900/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-300">
                    1. Total Saldo Modal (Rp):
                  </label>
                  <span className="text-[10px] text-slate-400">Awal + Topup</span>
                </div>
                <input
                  type="number"
                  value={simTotalSaldo}
                  onChange={(e) => setSimTotalSaldo(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 282854"
                  className="w-full bg-slate-950 border border-blue-800/60 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-blue-400"
                />
                <span className="text-[10px] text-slate-400 block font-mono">
                  {formatRupiah(simNumTotal)}
                </span>
              </div>

              {/* Input 2: Saldo Akhir */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    2. Saldo Akhir Server (Rp):
                  </label>
                  <span className="text-[10px] text-slate-400">Sisa pulsa</span>
                </div>
                <input
                  type="number"
                  value={simSaldoAkhir}
                  onChange={(e) => setSimSaldoAkhir(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 132748"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-400"
                />
                <span className="text-[10px] text-slate-400 block font-mono">
                  {formatRupiah(simNumAkhir)}
                </span>
              </div>

              {/* Input 3: Total Penjualan */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-emerald-900/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-300">
                    3. Total Penjualan Pulsa (Rp):
                  </label>
                  <span className="text-[10px] text-slate-400">Omset diterima</span>
                </div>
                <input
                  type="number"
                  value={simPenjualan}
                  onChange={(e) => setSimPenjualan(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 186000"
                  className="w-full bg-slate-950 border border-emerald-800/60 rounded-xl px-3 py-2 text-base font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                />
                <span className="text-[10px] text-emerald-400/80 block font-mono">
                  {formatRupiah(simNumSales)}
                </span>
              </div>
            </div>

            {/* Real-Time Mathematical Result Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase text-emerald-300 block">
                    HASIL LABA BERSIH TERHITUNG OTOMATIS:
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Hasil kalkulasi rumus: (Penjualan + Saldo Akhir) - Total Saldo
                  </p>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 flex items-center gap-1">
                  <span>+{formatRupiah(simProfit)}</span>
                </div>
              </div>

              {/* Step-by-step Math Breakdown */}
              <div className="p-3 bg-slate-950/90 rounded-xl border border-emerald-900/50 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">Langkah Penjumlahan & Pengurangan:</span>
                  <div className="text-emerald-300 font-bold mt-0.5">
                    ({formatRupiah(simNumSales)} + {formatRupiah(simNumAkhir)}) - {formatRupiah(simNumTotal)}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    = {formatRupiah(simNumSales + simNumAkhir)} - {formatRupiah(simNumTotal)} = <strong className="text-emerald-400 font-extrabold">+{formatRupiah(simProfit)}</strong>
                  </div>
                </div>

                <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800 md:pl-3">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Pemakaian Saldo Modal:</span>
                    <strong className="text-amber-300 font-bold">{formatRupiah(simUsage)}</strong>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-300 mt-1">
                    <span>Margin dari Penjualan:</span>
                    <strong className="text-emerald-400 font-bold">
                      {simNumSales > 0 ? ((simProfit / simNumSales) * 100).toFixed(1) : '0'}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    updateActiveShiftServer(simServerIdx, { initialBalance: simNumTotal });
                    setSimToast(`💾 Saldo Awal Server ${simServerIdx + 1} diperbarui menjadi ${formatRupiah(simNumTotal)}!`);
                    setTimeout(() => setSimToast(null), 3000);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  Simpan Saldo Modal ({formatRupiah(simNumTotal)}) ke Shift Berjalan
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Pre-fill Tutup Shift with these exact simulator numbers
                    setModalTotalSaldos((prev) => {
                      const copy = [...prev] as [number | '', number | '', number | '', number | ''];
                      copy[simServerIdx] = simNumTotal;
                      return copy;
                    });
                    setFinalBalances((prev) => {
                      const copy = [...prev] as [number | '', number | '', number | '', number | ''];
                      copy[simServerIdx] = simNumAkhir;
                      return copy;
                    });
                    setServerGrossSales((prev) => {
                      const copy = [...prev] as [number | '', number | '', number | '', number | ''];
                      copy[simServerIdx] = simNumSales;
                      return copy;
                    });
                    setShowCloseShiftModal(true);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Buka Tutup Shift & Terapkan Angka Ini
                </button>
              </div>
            </div>
          </div>

          {/* LIVE SIMULATOR TESTING TOOL */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-900/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Simulator Cepat Transaksi Shift (Uji Coba Langsung)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                Klik tombol di bawah untuk simulasi transaksi berjalan:
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSimulateTransaction('pulsa')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-blue-950 border border-slate-800 hover:border-blue-700/60 text-left transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                  <Zap className="w-3.5 h-3.5" /> Pulsa 50k
                </div>
                <div className="text-[10px] text-slate-400">Server 1 (Digipos)</div>
                <div className="text-[10px] font-mono text-emerald-400 font-semibold">+Laba Rp 2.200</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSimulateTransaction('token')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-700/60 text-left transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                  <Zap className="w-3.5 h-3.5" /> Token PLN 100k
                </div>
                <div className="text-[10px] text-slate-400">Server 4 (Multi)</div>
                <div className="text-[10px] font-mono text-emerald-400 font-semibold">+Laba Rp 2.500</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSimulateTransaction('transfer')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-700/60 text-left transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px]">
                  <Send className="w-3.5 h-3.5" /> Transfer BRI
                </div>
                <div className="text-[10px] text-slate-400">Kirim Rp 350.000</div>
                <div className="text-[10px] font-mono text-emerald-400 font-semibold">+Admin Rp 5.000</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSimulateTransaction('tarik')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-700/60 text-left transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <Banknote className="w-3.5 h-3.5" /> Tarik Tunai
                </div>
                <div className="text-[10px] text-slate-400">Tarik Rp 200.000</div>
                <div className="text-[10px] font-mono text-emerald-400 font-semibold">+Admin Rp 5.000</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSimulateTransaction('aksesoris')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-purple-950 border border-slate-800 hover:border-purple-700/60 text-left transition space-y-1"
              >
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px]">
                  <ShoppingBag className="w-3.5 h-3.5" /> Kabel C 65W
                </div>
                <div className="text-[10px] text-slate-400">Jual Rp 25.000</div>
                <div className="text-[10px] font-mono text-emerald-400 font-semibold">+Laba Rp 13.000</div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* BUKA SHIFT BARU FORM (STANDALONE) */
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-white font-extrabold text-xl">Buka Shift Baru Kasir</h2>
                <p className="text-xs text-slate-400">
                  Masukkan saldo awal laci kasir dan saldo 4 server pulsa saat memulai tugas shift.
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              <span className="text-slate-400 text-[11px] mr-1">Preset Cepat:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('digipos')}
                className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold hover:bg-emerald-900"
              >
                Contoh Digipos (Rp 282.854)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('standar')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                Standar
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('besar')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                Konter Besar
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('kosong')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <form onSubmit={handleBukaShiftSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Nama Kasir yang Bertugas:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={bukaCashierName}
                    onChange={(e) => setBukaCashierName(e.target.value)}
                    placeholder="Contoh: Nikko / Kasir Shift 1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Modal Awal Kas di Laci Kasir (Uang Kembalian):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={bukaCashDrawer}
                    onChange={(e) => setBukaCashDrawer(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 1000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm font-bold font-mono text-emerald-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Input Saldo Awal 4 Server */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4 text-blue-400" />
                Input Saldo Awal 4 Server Pulsa:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Server 1 */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-red-900/40 space-y-2">
                  <span className="text-xs font-bold text-red-400 truncate block">
                    {settings.serverNames?.[0] || 'Server 1 (Digipos Telkomsel)'}
                  </span>
                  <label className="text-[10px] text-slate-400 block">Saldo Awal (Rp):</label>
                  <input
                    type="number"
                    value={bukaServer1}
                    onChange={(e) => setBukaServer1(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                {/* Server 2 */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-blue-900/40 space-y-2">
                  <span className="text-xs font-bold text-blue-400 truncate block">
                    {settings.serverNames?.[1] || 'Server 2 (SiDompul XL-Axis)'}
                  </span>
                  <label className="text-[10px] text-slate-400 block">Saldo Awal (Rp):</label>
                  <input
                    type="number"
                    value={bukaServer2}
                    onChange={(e) => setBukaServer2(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Server 3 */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-yellow-900/40 space-y-2">
                  <span className="text-xs font-bold text-yellow-400 truncate block">
                    {settings.serverNames?.[2] || 'Server 3 (Mobo Indosat)'}
                  </span>
                  <label className="text-[10px] text-slate-400 block">Saldo Awal (Rp):</label>
                  <input
                    type="number"
                    value={bukaServer3}
                    onChange={(e) => setBukaServer3(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>

                {/* Server 4 */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-900/40 space-y-2">
                  <span className="text-xs font-bold text-cyan-400 truncate block">
                    {settings.serverNames?.[3] || 'Server 4 (Multi PPOB)'}
                  </span>
                  <label className="text-[10px] text-slate-400 block">Saldo Awal (Rp):</label>
                  <input
                    type="number"
                    value={bukaServer4}
                    onChange={(e) => setBukaServer4(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Total Modal Summary */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">Total Modal 4 Server: </span>
                <span className="font-mono font-bold text-blue-400">{formatRupiah(totalBukaServers)}</span>
                <span className="text-slate-500 ml-2">| Kas Laci: </span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatRupiah(Number(bukaCashDrawer) || 0)}
                </span>
              </div>
              <div className="text-sm font-bold text-white">
                Total Modal Awal Shift: <span className="font-mono text-emerald-400">{formatRupiah(totalBukaServers + (Number(bukaCashDrawer) || 0))}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <CheckCircle2 className="w-5 h-5" />
              Buka Shift Kasir Sekarang
            </button>
          </form>
        </div>
      )}

      {/* 2. RIWAYAT REKAP SHIFT SEBELUMNYA */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-4">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-sm">Riwayat Rekap Shift Kasir</h3>
          </div>
          <span className="text-xs text-slate-400">{shifts.length} shift tersimpan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">No. Shift / Kasir</th>
                <th className="py-3 px-4 font-semibold">Waktu Buka / Tutup</th>
                <th className="py-3 px-4 font-semibold text-right">Penjualan 4 Server</th>
                <th className="py-3 px-4 font-semibold text-right">Laba Pulsa (4 Server)</th>
                <th className="py-3 px-4 font-semibold text-right">Total Laba Bersih Shift</th>
                <th className="py-3 px-4 font-semibold text-center">Status Uang Kasir</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {shifts.map((s) => {
                const isOpen = s.status === 'open';

                return (
                  <tr key={s.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>Shift #{s.shiftNumber}</span>
                        {isOpen && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{s.cashierName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[11px] text-slate-300">{formatDateIndo(s.startTime)}</div>
                      <div className="text-[10px] text-slate-500">
                        {s.endTime ? `Tutup: ${formatDateIndo(s.endTime)}` : 'Sedang berjalan...'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {formatRupiah(s.totalPulseSales)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                      +{formatRupiah(s.totalPulseProfit)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-400">
                      +{formatRupiah(s.netProfit)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isOpen ? (
                        <span className="text-[10px] text-slate-500 italic">Belum tutup</span>
                      ) : (s.cashDifference || 0) === 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                          PAS
                        </span>
                      ) : (s.cashDifference || 0) > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800/60">
                          +{formatRupiah(s.cashDifference || 0)}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800/60">
                          {formatRupiah(s.cashDifference || 0)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveShiftReceipt(s)}
                          className="p-1.5 rounded-lg bg-blue-900/50 hover:bg-blue-600 text-blue-300 hover:text-white transition"
                          title="Lihat Rekap Struk & Kirim WA"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {!isOpen && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus data shift #${s.shiftNumber}?`)) {
                                deleteShift(s.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-300 transition"
                            title="Hapus Rekap"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL SIMULASI BUKA SHIFT BARU */}
      {showBukaShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/80">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-base">
                  Simulasi Buka Shift Baru (Input Saldo Awal Kustom)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBukaShiftModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBukaShiftSubmit} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Presets */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-400 font-medium">Pilih Preset Cepat:</span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('digipos')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold hover:bg-emerald-900"
                  >
                    Contoh Digipos (Rp 282.854)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('standar')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold"
                  >
                    Standar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('besar')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold"
                  >
                    Konter Besar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('kosong')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"
                  >
                    Kosongkan (Input Bebas)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Nama Kasir:</label>
                  <input
                    type="text"
                    value={bukaCashierName}
                    onChange={(e) => setBukaCashierName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Modal Awal Kas Laci (Rp):
                  </label>
                  <input
                    type="number"
                    value={bukaCashDrawer}
                    onChange={(e) => setBukaCashDrawer(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono font-bold text-emerald-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Saldo 4 Server Inputs */}
              <div className="space-y-2">
                <span className="text-slate-300 font-bold uppercase block">
                  Saldo Awal 4 Server Pulsa:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-red-900/40 space-y-1">
                    <span className="text-red-400 font-bold block">{settings.serverNames?.[0]}</span>
                    <input
                      type="number"
                      value={bukaServer1}
                      onChange={(e) => setBukaServer1(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Saldo Awal Server 1"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-blue-900/40 space-y-1">
                    <span className="text-blue-400 font-bold block">{settings.serverNames?.[1]}</span>
                    <input
                      type="number"
                      value={bukaServer2}
                      onChange={(e) => setBukaServer2(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Saldo Awal Server 2"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-yellow-900/40 space-y-1">
                    <span className="text-yellow-400 font-bold block">{settings.serverNames?.[2]}</span>
                    <input
                      type="number"
                      value={bukaServer3}
                      onChange={(e) => setBukaServer3(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Saldo Awal Server 3"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-yellow-500"
                      required
                    />
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-cyan-900/40 space-y-1">
                    <span className="text-cyan-400 font-bold block">{settings.serverNames?.[3]}</span>
                    <input
                      type="number"
                      value={bukaServer4}
                      onChange={(e) => setBukaServer4(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Saldo Awal Server 4"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Modal 4 Server:</span>
                <span className="font-mono font-bold text-blue-400 text-sm">
                  {formatRupiah(totalBukaServers)}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBukaShiftModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/30"
                >
                  Mulai Buka Shift Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TUTUP SHIFT & REKAP 4 SERVER (WITH USER EXACT FORMULA!) */}
      {showCloseShiftModal && activeShift && computedShiftRecap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/80">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    Rekap Tutup Shift #{activeShift.shiftNumber}
                  </h3>
                  <p className="text-[11px] text-slate-400">Kasir: {activeShift.cashierName}</p>
                </div>
              </div>

              {/* Formula Badge Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-[11px] text-emerald-300 font-mono">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                <span>(Penjualan + Saldo Akhir) - Total Saldo = Laba Bersih</span>
              </div>
            </div>

            <form onSubmit={handleSubmitTutupShift} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Auto-Fill Simulation Button Banner */}
              <div className="p-3.5 bg-gradient-to-r from-blue-950/60 to-indigo-950/40 border border-blue-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-200">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Uji coba dengan contoh Anda? Klik tombol di samping untuk <strong>mengisi otomatis contoh Digipos</strong> (Total Saldo: 282.854, Akhir: 132.748, Jual: 186.000 $\rightarrow$ Laba 35.894)!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillSimulationClose}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 shadow transition"
                >
                  ✨ Isi Contoh Digipos Otomatis
                </button>
              </div>

              {/* 4 Servers Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-400" />
                  Rincian 4 Server Pulsa (Saldo Awal, Saldo Akhir, Penjualan & Laba):
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {computedShiftRecap.serverStats.map((srv, idx) => (
                    <div
                      key={srv.serverId}
                      className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3"
                    >
                      {/* Server Title & Total Saldo Modal */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs">{srv.serverName}</span>
                          {idx === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setModalTotalSaldos((prev) => {
                                  const copy = [...prev] as [number | '', number | '', number | '', number | ''];
                                  copy[0] = 282854;
                                  return copy;
                                });
                                setFinalBalances((prev) => {
                                  const copy = [...prev] as [number | '', number | '', number | '', number | ''];
                                  copy[0] = 132748;
                                  return copy;
                                });
                                setServerGrossSales((prev) => {
                                  const copy = [...prev] as [number | '', number | '', number | '', number | ''];
                                  copy[0] = 186000;
                                  return copy;
                                });
                              }}
                              className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                              title="Klik untuk isi simulasi contoh aktual Digipos"
                            >
                              Isi Contoh Digipos
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                          Server {idx + 1}
                        </span>
                      </div>

                      {/* 3 Inputs: Total Saldo Modal, Saldo Akhir & Penjualan */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* 1. Total Saldo Modal */}
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1 font-medium truncate" title="Total Saldo = Saldo Awal + Top Up">
                            1. Total Saldo (Rp):
                          </label>
                          <input
                            type="number"
                            placeholder="Contoh: 282854"
                            value={modalTotalSaldos[idx]}
                            onChange={(e) => {
                              const val = e.target.value === '' ? '' : Number(e.target.value);
                              setModalTotalSaldos((prev) => {
                                const copy = [...prev] as [number | '', number | '', number | '', number | ''];
                                copy[idx] = val;
                                return copy;
                              });
                            }}
                            className="w-full bg-slate-900 border border-blue-900/50 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-blue-300 focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>

                        {/* 2. Saldo Akhir */}
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1 font-medium truncate" title="Saldo Sisa saat tutup shift">
                            2. Saldo Akhir (Rp):
                          </label>
                          <input
                            type="number"
                            placeholder="Contoh: 132748"
                            value={finalBalances[idx]}
                            onChange={(e) => {
                              const val = e.target.value === '' ? '' : Number(e.target.value);
                              setFinalBalances((prev) => {
                                const copy = [...prev] as [number | '', number | '', number | '', number | ''];
                                copy[idx] = val;
                                return copy;
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>

                        {/* 3. Total Penjualan */}
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1 font-medium truncate" title="Total uang penjualan diterima">
                            3. Penjualan (Rp):
                          </label>
                          <input
                            type="number"
                            placeholder="Contoh: 186000"
                            value={serverGrossSales[idx]}
                            onChange={(e) => {
                              const val = e.target.value === '' ? '' : Number(e.target.value);
                              setServerGrossSales((prev) => {
                                const copy = [...prev] as [number | '', number | '', number | '', number | ''];
                                copy[idx] = val;
                                return copy;
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>

                      {/* Automatic Results Box */}
                      <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">Pemakaian Saldo Modal (Total - Akhir):</span>
                          <span className="font-mono font-semibold text-amber-300">
                            {formatRupiah(srv.usage)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                          <div>
                            <span className="text-emerald-400 font-bold block text-[11px]">Laba Bersih Otomatis:</span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              ({formatRupiah(srv.sales)} + {formatRupiah(srv.finalBal)}) - {formatRupiah(srv.totalAvailable)}
                            </span>
                          </div>
                          <div className="text-sm font-extrabold font-mono text-emerald-400">
                            +{formatRupiah(srv.profit)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automatic Net Profit Summary Box */}
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-300 font-semibold uppercase">
                    Hasil Total Laba Bersih Shift Secara Otomatis:
                  </span>
                  <span className="text-xl font-extrabold font-mono text-emerald-400">
                    +{formatRupiah(computedShiftRecap.overallNetProfit)}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-900/60 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-400 block">Laba 4 Server:</span>
                    <strong className="text-emerald-400">
                      +{formatRupiah(computedShiftRecap.totalPulseProfit)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Laba Aksesoris:</span>
                    <strong className="text-emerald-400">
                      +{formatRupiah(activeShift.accessoryProfit)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Laba Admin Bank:</span>
                    <strong className="text-emerald-400">
                      +{formatRupiah(activeShift.transferAdminProfit + activeShift.tarikTunaiAdminProfit)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pengeluaran:</span>
                    <strong className="text-rose-400">
                      -{formatRupiah(computedShiftRecap.totalExp)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Cash Drawer Reconciliation */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  Rekonsiliasi Kas Laci Kasir (Cash Opname):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">
                      Uang Kas Yang Seharusnya Ada di Laci:
                    </span>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-base font-bold font-mono text-white">
                      {formatRupiah(computedShiftRecap.expectedCashDrawer)}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      (Modal Awal + Jual Pulsa + Aksesoris + Admin Bank - Beban)
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Hitungan Uang Fisik Nyata di Laci Kasir (Rp):
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={actualCashDrawer}
                      onChange={(e) => setActualCashDrawer(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-base font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <div className="mt-1 flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Selisih Kasir:</span>
                      <strong
                        className={
                          computedShiftRecap.cashDiff === 0
                            ? 'text-emerald-400'
                            : computedShiftRecap.cashDiff > 0
                            ? 'text-blue-400'
                            : 'text-rose-400'
                        }
                      >
                        {computedShiftRecap.cashDiff === 0
                          ? '✅ Uang Kas Pas'
                          : computedShiftRecap.cashDiff > 0
                          ? `🟢 Lebih: +${formatRupiah(computedShiftRecap.cashDiff)}`
                          : `🔴 Minus: ${formatRupiah(computedShiftRecap.cashDiff)}`}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-slate-400 block mb-1">Catatan Penutupan Shift (Opsional):</label>
                <input
                  type="text"
                  placeholder="Contoh: Shift lancar, server 2 sempat gangguan 10 menit"
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseShiftModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Selesai Tutup Shift & Cetak Struk Rekap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TOP UP SERVER DI TENGAH SHIFT */}
      {showTopUpModal && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4 text-xs">
            <h3 className="font-bold text-white text-base">Tambah Top Up Saldo Server</h3>

            <form onSubmit={handleSubmitTopUp} className="space-y-4">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Pilih Server:</label>
                <select
                  value={selectedTopUpServerId}
                  onChange={(e) => setSelectedTopUpServerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {activeShift.servers.map((srv) => (
                    <option key={srv.serverId} value={srv.serverId}>
                      {srv.serverName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">
                  Jumlah Tambah Saldo (Rp):
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 500000"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-bold font-mono text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Simpan Top Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EXPENSE KASIR */}
      {showExpenseModal && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4 text-xs">
            <h3 className="font-bold text-white text-base">Catat Pengeluaran Shift</h3>

            <form onSubmit={handleSubmitExpense} className="space-y-4">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Nominal Pengeluaran (Rp):</label>
                <input
                  type="number"
                  placeholder="Contoh: 20000"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-bold font-mono text-rose-400 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Keterangan / Keperluan:</label>
                <input
                  type="text"
                  placeholder="Contoh: Beli air mineral / Makan siang"
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                >
                  Catat Beban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
