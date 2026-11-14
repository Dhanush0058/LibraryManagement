import React from 'react';
import { 
  LayoutDashboard, BookOpen, Layers, Users, BookUp, 
  BookDown, History, AlertCircle, IndianRupee, ShoppingCart, 
  BarChart3, UserCheck, Settings, ShieldAlert, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';

export type NavItemKey = 
  | 'dashboard'
  | 'books'
  | 'categories'
  | 'members'
  | 'issue'
  | 'return'
  | 'transactions'
  | 'overdue'
  | 'fines'
  | 'purchases'
  | 'reports'
  | 'staff'
  | 'settings'
  | 'audit';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { isSuperAdmin } = useAuth();

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Core' },
    { key: 'books', label: 'Book Inventory', icon: BookOpen, section: 'Catalog' },
    { key: 'categories', label: 'Categories', icon: Layers, section: 'Catalog' },
    { key: 'members', label: 'Members Directory', icon: Users, section: 'Members' },
    { key: 'issue', label: 'Issue Book', icon: BookUp, section: 'Circulation' },
    { key: 'return', label: 'Return Book', icon: BookDown, section: 'Circulation' },
    { key: 'transactions', label: 'All Transactions', icon: History, section: 'Circulation' },
    { key: 'overdue', label: 'Overdue Tracker', icon: AlertCircle, section: 'Finance & Compliance' },
    { key: 'fines', label: 'Fines & Payments', icon: IndianRupee, section: 'Finance & Compliance' },
    { key: 'purchases', label: 'Purchases & Stock', icon: ShoppingCart, section: 'Acquisition' },
    { key: 'reports', label: 'Reports & Analytics', icon: BarChart3, section: 'Reports' },
    ...(isSuperAdmin
      ? [
          { key: 'staff', label: 'Staff Management', icon: UserCheck, section: 'Administration' },
          { key: 'settings', label: 'Library Settings', icon: Settings, section: 'Administration' },
          { key: 'audit', label: 'Audit Logs', icon: ShieldAlert, section: 'Administration' },
        ]
      : []),
  ];

  const handleNavClick = (key: NavItemKey) => {
    onSelectTab(key);
    onCloseMobile();
  };

  return (
    <>
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-charcoal-950/70 backdrop-blur-xs z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-charcoal-900 text-charcoal-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } border-r border-charcoal-800`}
      >
        {/* Brand Header with Warm Terracotta Emblem */}
        <div className="p-5 border-b border-charcoal-800 bg-charcoal-950 flex items-center gap-3">
          <Logo size="md" variant="coral" />
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white tracking-wide truncate flex items-center gap-1.5">
              LibraCare <span className="text-[10px] text-coral-400 font-mono font-normal">v2.4</span>
            </h1>
            <p className="text-[11px] text-coral-400 font-semibold tracking-tight truncate">ESIC Medical College</p>
            <p className="text-[10px] text-charcoal-400 truncate">Sangareddy, Telangana</p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;
            const prevItem = navItems[idx - 1];
            const isNewSection = !prevItem || prevItem.section !== item.section;

            return (
              <React.Fragment key={item.key}>
                {isNewSection && (
                  <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                    {item.section}
                  </div>
                )}
                <button
                  onClick={() => handleNavClick(item.key as NavItemKey)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-coral-500 text-white shadow-md shadow-coral-500/20 font-bold'
                      : 'text-charcoal-400 hover:bg-charcoal-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-charcoal-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-charcoal-800 bg-charcoal-950/60 text-[11px] text-charcoal-400 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-charcoal-400 text-[10px]">Cloud Link</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Supabase Live
            </span>
          </div>
          <div className="text-[10px] text-charcoal-500">
            Authority Management Console
          </div>
        </div>
      </aside>
    </>
  );
};
