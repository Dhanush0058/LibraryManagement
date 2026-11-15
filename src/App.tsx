import React, { useState, useEffect, useCallback } from 'react';
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
import { useSwipeNavigation } from './hooks/useSwipeNavigation';
import { GestureBackIndicator } from './components/navigation/GestureBackIndicator';
import { Member } from './types';

const VALID_TABS: NavItemKey[] = [
  'dashboard', 'books', 'categories', 'members', 'issue', 'return',
  'transactions', 'overdue', 'fines', 'purchases', 'reports', 'staff',
  'settings', 'audit'
];

export const App: React.FC = () => {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavItemKey>(() => {
    const hash = window.location.hash.replace('#', '') as NavItemKey;
    return VALID_TABS.includes(hash) ? hash : 'dashboard';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [preselectedMemberForIssue, setPreselectedMemberForIssue] = useState<Member | null>(null);

  // Re-render trigger when data resets
  const [refreshKey, setRefreshKey] = useState(0);

  // Router navigation helper with HTML5 History API integration
  const navigate = useCallback((tab: NavItemKey, replace = false) => {
    if (tab === currentTab && !replace) return;

    if (replace) {
      window.history.replaceState({ tab }, '', `#${tab}`);
    } else {
      window.history.pushState({ tab }, '', `#${tab}`);
    }
    setCurrentTab(tab);
  }, [currentTab]);

  // Handle native gesture back or swipe-to-navigate action
  const handleSwipeBack = useCallback(() => {
    // Already on the main operational dashboard
    if (currentTab === 'dashboard') return;

    // Functions similarly to a native gesture back button triggering router's history back method
    if (window.history.state && window.history.length > 1) {
      window.history.back();
    } else {
      // Direct reliable fallback to operational dashboard
      navigate('dashboard');
    }
  }, [currentTab, navigate]);

  // Edge / touch swipe navigation listener hook
  const swipeState = useSwipeNavigation({
    onSwipeBack: handleSwipeBack,
    isBackAllowed: currentTab !== 'dashboard',
    threshold: 75,
  });

  // Listen to popstate event (browser back/forward button or native OS gesture back)
  useEffect(() => {
    // Initialize history state on first mount
    if (!window.history.state || !window.history.state.tab) {
      window.history.replaceState({ tab: currentTab }, '', `#${currentTab}`);
    }

    const handlePopState = (e: PopStateEvent) => {
      const targetTab = e.state?.tab as NavItemKey;
      if (targetTab && VALID_TABS.includes(targetTab)) {
        setCurrentTab(targetTab);
      } else {
        // Fallback to operational dashboard if at start of history
        setCurrentTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Safety fallback if librarian tries to open super-admin tab
  if (!isSuperAdmin && (currentTab === 'staff' || currentTab === 'settings' || currentTab === 'audit')) {
    navigate('dashboard', true);
  }

  const handleIssueBookToMember = (member: Member) => {
    setPreselectedMemberForIssue(member);
    navigate('issue');
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
    <div className="min-h-screen bg-[#FAF8F5] flex relative overflow-x-hidden">
      {/* Visual Gesture Back Indicator on touch swipe */}
      <GestureBackIndicator swipeState={swipeState} targetTitle="Operational Dashboard" />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={navigate}
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
          canGoBack={currentTab !== 'dashboard'}
          onNavigateBack={handleSwipeBack}
        />

        {/* View Router */}
        <main key={refreshKey} className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Static persistent Dashboard - remains mounted so visuals and graphs never re-animate or re-load when returning */}
          <div className={currentTab === 'dashboard' ? 'block' : 'hidden'}>
            <DashboardView onNavigate={navigate} />
          </div>

          {currentTab === 'books' && <BookListView onNavigateBack={handleSwipeBack} />}
          {currentTab === 'categories' && <CategoriesView />}
          {currentTab === 'members' && <MemberListView onIssueBookToMember={handleIssueBookToMember} />}
          {currentTab === 'issue' && (
            <IssueBookView
              preselectedMember={preselectedMemberForIssue}
              onSuccessNavigate={() => {
                setPreselectedMemberForIssue(null);
                navigate('transactions');
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
