import React, { useState } from 'react';
import { ShoppingBag, Package } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { PosTransfer } from './components/pos/PosTransfer';
import { PosTarikTunai } from './components/pos/PosTarikTunai';
import { PosAksesoris } from './components/pos/PosAksesoris';
import { InventoryManager } from './components/inventory/InventoryManager';
import { FinanceManager } from './components/finance/FinanceManager';
import { KasbonManager } from './components/kasbon/KasbonManager';
import { ReportsView } from './components/reports/ReportsView';
import { ReceiptModal } from './components/pos/ReceiptModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { ShiftManager } from './components/shift/ShiftManager';
import { ShiftReceiptModal } from './components/shift/ShiftReceiptModal';
import { PinModal } from './components/auth/PinModal';

const MainContent: React.FC = () => {
  const { requestOwnerPin } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('shift');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenSettings = () => {
    requestOwnerPin('Buka Pengaturan Toko & Keamanan', () => {
      setIsSettingsOpen(true);
    }, 'Masukkan PIN Pemilik untuk mengubah konfigurasi toko dan PIN');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={handleOpenSettings}
      />

      {/* Sub-Header for Accessories / Inventory Switcher */}
      {(activeTab === 'aksesoris' || activeTab === 'inventory') && (
        <div className="bg-slate-900 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('aksesoris')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'aksesoris'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Kasir Aksesoris (POS)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'inventory'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Manajemen Stok & Kulakan
              </button>
            </div>
            <span className="text-xs text-slate-400 hidden sm:block">
              {activeTab === 'aksesoris' ? 'Mode Kasir Penjualan' : 'Mode Manajemen Gudang & Stok'}
            </span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'shift' && <ShiftManager />}
        {activeTab === 'transfer' && <PosTransfer />}
        {activeTab === 'tarik_tunai' && <PosTarikTunai />}
        {activeTab === 'aksesoris' && (
          <PosAksesoris onGoToInventory={() => setActiveTab('inventory')} />
        )}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'finance' && <FinanceManager />}
        {activeTab === 'kasbon' && <KasbonManager />}
        {activeTab === 'reports' && <ReportsView />}
      </main>

      {/* Global Modals */}
      <ReceiptModal />
      <ShiftReceiptModal />
      <PinModal />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
