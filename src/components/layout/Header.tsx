import React from 'react';
import { Menu, LogOut, RotateCcw, User, Shield, BookCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { useToast } from '../../context/ToastContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  pageTitle: string;
  onRefreshData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, pageTitle, onRefreshData }) => {
  const { user, isSuperAdmin, logout, switchPersona } = useAuth();
  const { success } = useToast();

  const handleResetData = () => {
    if (window.confirm('Reset all demo library data to default state? This will repopulate standard ESIC medical textbooks, members, issues, and fine records.')) {
      db.initIfEmpty(true);
      success('Library Database Reset', 'All records have been reset to default institutional demo state.');
      if (onRefreshData) onRefreshData();
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-parchment-200 shadow-2xs px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-xl text-charcoal-600 hover:bg-parchment-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-charcoal-900 tracking-tight">{pageTitle}</h2>
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-coral-50 text-coral-700 border border-coral-200">
              Authority Portal
            </span>
          </div>
          <p className="text-[11px] text-charcoal-500 hidden sm:block">
            ESIC Medical College & Hospital — Central Library Management
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Role Persona Switcher for Live Demo */}
        <div className="hidden sm:flex items-center bg-parchment-100 rounded-full p-1 border border-parchment-200 text-xs">
          <span className="text-[11px] font-medium text-charcoal-500 px-2.5 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-coral-500" /> Persona:
          </span>
          <button
            onClick={() => switchPersona('super_admin')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              isSuperAdmin 
                ? 'bg-charcoal-900 text-white shadow-xs' 
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
            title="Switch to Super Admin (Full administrative access)"
          >
            Super Admin
          </button>
          <button
            onClick={() => switchPersona('librarian')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              !isSuperAdmin 
                ? 'bg-coral-500 text-white shadow-xs' 
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
            title="Switch to Librarian (Operational circulation access)"
          >
            Librarian
          </button>
        </div>

        {/* Reset Demo State Button */}
        <button
          onClick={handleResetData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-parchment-300 text-xs font-medium text-charcoal-600 hover:bg-parchment-100 hover:text-charcoal-900 transition"
          title="Reset database to default mock medical records"
        >
          <RotateCcw className="w-3.5 h-3.5 text-coral-600" />
          <span className="hidden md:inline">Reset Demo</span>
        </button>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 pl-2 sm:border-l border-parchment-200">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-charcoal-900 leading-tight">
              {user?.full_name?.split('(')[0] || 'Authority Staff'}
            </span>
            <span className="text-[10px] font-semibold text-coral-600 capitalize flex items-center justify-end gap-1">
              {isSuperAdmin ? <Shield className="w-2.5 h-2.5" /> : <BookCheck className="w-2.5 h-2.5" />}
              {user?.role === 'super_admin' ? 'Super Admin' : 'Librarian'}
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-charcoal-900 text-white border-2 border-coral-500 flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.full_name?.charAt(0) || 'A'}
          </div>

          <button
            onClick={logout}
            className="p-2 text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
            title="Log out of library system"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
