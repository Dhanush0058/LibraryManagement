import React from 'react';
import { 
  LayoutDashboard, BookOpen, Layers, Users, BookUp, 
  BookDown, History, AlertCircle, IndianRupee, ShoppingCart, 
  BarChart3, UserCheck, Settings, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
    // Super admin protected
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
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold shadow-md">
            <span className="text-xl">🏛️</span>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white tracking-wide truncate">LibraCare ESIC</h1>
            <p className="text-[11px] text-teal-400 font-medium tracking-tight truncate">Medical College & Hospital</p>
            <p className="text-[10px] text-slate-400 truncate">Sangareddy, Telangana</p>
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
                  <div className="pt-3 pb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {item.section}
                  </div>
                )}
                <button
                  onClick={() => handleNavClick(item.key as NavItemKey)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-700/80 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-teal-300' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 flex flex-col gap-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>System Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Operational
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            ESIC Central Library v2.4 (Authority Portal)
          </div>
        </div>
      </aside>
    </>
  );
};
