import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { BookListView } from './components/books/BookListView';
import { CategoriesView } from './components/categories/CategoriesView';
import { MemberListView } from './components/members/MemberListView';
import { IssueBookView } from './components/circulation/IssueBookView';
import { ReturnBookView } from './components/circulation/ReturnBookView';
import { TransactionsView } from './components/circulation/TransactionsView';
import { OverdueListView } from './components/overdue/OverdueListView';
import { FineManagementView } from './components/fines/FineManagementView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { ReportsView } from './components/reports/ReportsView';
import { StaffManagementView } from './components/staff/StaffManagementView';
import { LibrarySettingsView } from './components/settings/LibrarySettingsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { Member } from './types';

export const App: React.FC = () => {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [preselectedMemberForIssue, setPreselectedMemberForIssue] = useState<Member | null>(null);

  // Re-render trigger when data resets
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Safety fallback if librarian tries to open super-admin tab
  if (!isSuperAdmin && (currentTab === 'staff' || currentTab === 'settings' || currentTab === 'audit')) {
    setCurrentTab('dashboard');
  }

  const handleIssueBookToMember = (member: Member) => {
    setPreselectedMemberForIssue(member);
    setCurrentTab('issue');
  };

  const getPageTitle = (tab: NavItemKey): string => {
    switch (tab) {
      case 'dashboard': return 'Operational Dashboard';
      case 'books': return 'Medical Book Catalog & Stock';
      case 'categories': return 'Medical Classifications';
      case 'members': return 'Student & Faculty Registry';
      case 'issue': return 'Circulation — Issue Book';
      case 'return': return 'Circulation — Return Book & Fines';
      case 'transactions': return 'Circulation Transactions Register';
      case 'overdue': return 'Overdue Books & Retrieval';
      case 'fines': return 'Fines & Payment Collections';
      case 'purchases': return 'Book Acquisitions & Stock Inward';
      case 'reports': return 'Reports & Analytics Suite';
      case 'staff': return 'Staff & Authority Management';
      case 'settings': return 'Library Circulation Settings';
      case 'audit': return 'Security Audit Trail';
      default: return 'Library Management System';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Institutional Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          pageTitle={getPageTitle(currentTab)}
          onRefreshData={() => setRefreshKey(k => k + 1)}
        />

        {/* View Router */}
        <main key={refreshKey} className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
          {currentTab === 'books' && <BookListView />}
          {currentTab === 'categories' && <CategoriesView />}
          {currentTab === 'members' && <MemberListView onIssueBookToMember={handleIssueBookToMember} />}
          {currentTab === 'issue' && (
            <IssueBookView
              preselectedMember={preselectedMemberForIssue}
              onSuccessNavigate={() => {
                setPreselectedMemberForIssue(null);
                setCurrentTab('transactions');
              }}
            />
          )}
          {currentTab === 'return' && <ReturnBookView />}
          {currentTab === 'transactions' && <TransactionsView />}
          {currentTab === 'overdue' && <OverdueListView />}
          {currentTab === 'fines' && <FineManagementView />}
          {currentTab === 'purchases' && <PurchasesView />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'staff' && <StaffManagementView />}
          {currentTab === 'settings' && <LibrarySettingsView />}
          {currentTab === 'audit' && <AuditLogsView />}
        </main>
      </div>
    </div>
  );
};

export default App;
