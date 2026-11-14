import React, { useState } from 'react';
import { 
  BookOpen, Copy, CheckCircle2, BookUp, Users, 
  GraduationCap, AlertCircle, IndianRupee, ArrowUpRight, 
  TrendingUp, Calendar, Filter, Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Legend, PieChart, Pie, Cell 
} from 'recharts';
import { db } from '../../services/db';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
}

// Warm Terracotta & Charcoal Palette from Reference
const COLORS = ['#F96849', '#1C2026', '#E8502F', '#667484', '#FB8B72', '#A1351F'];

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'this_year'>('this_month');
  const stats = db.getDashboardStats();

  const summaryCards = [
    {
      title: 'Total Book Titles',
      value: stats.totalTitles,
      icon: BookOpen,
      color: 'text-coral-600 bg-coral-50 border-coral-200',
      actionTab: 'books',
      subtext: 'Catalogued medical titles'
    },
    {
      title: 'Total Physical Copies',
      value: stats.totalPhysicalCopies,
      icon: Copy,
      color: 'text-charcoal-800 bg-charcoal-100 border-charcoal-200',
      actionTab: 'books',
      subtext: 'Individual accession units'
    },
    {
      title: 'Available Copies',
      value: stats.availableCopies,
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      actionTab: 'books',
      subtext: 'Ready for circulation'
    },
    {
      title: 'Currently Issued',
      value: stats.issuedCopies,
      icon: BookUp,
      color: 'text-coral-700 bg-coral-50 border-coral-200',
      actionTab: 'transactions',
      subtext: 'On active loan'
    },
    {
      title: 'Registered Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      actionTab: 'members',
      subtext: 'MBBS & Postgraduates'
    },
    {
      title: 'Registered Staff/Faculty',
      value: stats.totalStaff,
      icon: Users,
      color: 'text-charcoal-700 bg-charcoal-100 border-charcoal-200',
      actionTab: 'members',
      subtext: 'Doctors & Hospital Staff'
    },
    {
      title: 'Overdue Books',
      value: stats.overdueCount,
      icon: AlertCircle,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      actionTab: 'overdue',
      subtext: 'Exceeded return due date',
      alert: stats.overdueCount > 0
    },
    {
      title: 'Outstanding Fines',
      value: `₹${stats.outstandingFines.toFixed(2)}`,
      icon: IndianRupee,
      color: 'text-coral-800 bg-coral-100 border-coral-200',
      actionTab: 'fines',
      subtext: `Total Collected: ₹${stats.totalFineCollected.toFixed(2)}`
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Warm Charcoal & Terracotta Styling */}
      <div className="bg-charcoal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-charcoal-900/5 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-coral-300 border border-white/10 uppercase tracking-widest backdrop-blur-xs">
              Central Medical Library
            </span>
            <span className="text-xs text-charcoal-400">Telangana Zone</span>
          </div>
          <h2 className="text-2xl font-bold mt-2 tracking-tight text-white">
            Library Operations & Inventory Analytics
          </h2>
          <p className="text-xs text-charcoal-300 mt-1 leading-relaxed">
            Real-time live monitoring of accession cataloging, circulation loans, MBBS borrowing quotas, and overdue recovery.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="primary"
            onClick={() => onNavigate('issue')}
            className="text-xs font-bold shadow-md shadow-coral-500/30"
          >
            <BookUp className="w-3.5 h-3.5 mr-1.5" /> Issue Book
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate('return')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/15 text-xs font-semibold backdrop-blur-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-coral-300" /> Return Book
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate('reports')}
            className="text-charcoal-300 hover:text-white hover:bg-white/5 text-xs font-medium"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Reports
          </Button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-parchment-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-medium text-charcoal-600">
          <Filter className="w-4 h-4 text-coral-500" />
          <span>Operational Window:</span>
          <span className="font-bold text-charcoal-900">
            {dateFilter === 'this_month' ? 'Current Academic Month' : dateFilter === 'this_year' ? 'Academic Year 2024-25' : 'All-time Records'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-parchment-100 p-1 rounded-full border border-parchment-200">
          <button
            onClick={() => setDateFilter('this_month')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              dateFilter === 'this_month' ? 'bg-white text-coral-600 shadow-2xs' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateFilter('this_year')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              dateFilter === 'this_year' ? 'bg-white text-coral-600 shadow-2xs' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Academic Year
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              dateFilter === 'all' ? 'bg-white text-coral-600 shadow-2xs' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Summary 8 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.actionTab)}
              className="bg-white rounded-2xl p-5 border border-parchment-200 shadow-2xs hover:shadow-md hover:border-coral-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">{card.title}</span>
                <div className={`p-2.5 rounded-xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-charcoal-900 tracking-tight">{card.value}</span>
                <ArrowUpRight className="w-4 h-4 text-parchment-400 group-hover:text-coral-500 transition" />
              </div>
              <p className="mt-1 text-[11px] text-charcoal-500 flex items-center gap-1.5">
                {card.alert && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
                {card.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circulation Trends */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-parchment-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-charcoal-900 text-sm">Monthly Circulation Flow</h3>
              <p className="text-xs text-charcoal-500">Comparison of books issued versus returned</p>
            </div>
            <span className="text-[11px] text-coral-700 bg-coral-50 px-2.5 py-0.5 rounded-full border border-coral-200 font-bold">
              Academic Trend
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.circulationTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8693A1' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8693A1' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C2026', borderColor: '#2B313A', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="issued" name="Books Issued" fill="#F96849" radius={[6, 6, 0, 0]} />
                <Bar dataKey="returned" name="Books Returned" fill="#2B313A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-parchment-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-charcoal-900 text-sm">Category Inventory</h3>
              <p className="text-xs text-charcoal-500">Distribution across medical faculties</p>
            </div>
          </div>
          <div className="h-52 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  dataKey="copiesCount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={72}
                  innerRadius={42}
                  paddingAngle={3}
                >
                  {stats.categoryDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C2026', borderColor: '#2B313A', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val, name) => [`${val} Copies`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-charcoal-600 border-t border-parchment-200 pt-3">
            {stats.categoryDistribution.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                <span className="truncate">{c.code} ({c.copiesCount})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Most Borrowed Books & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Borrowed Medical Titles */}
        <div className="bg-white rounded-3xl border border-parchment-200 shadow-2xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-charcoal-900 text-sm">High-Demand Medical Titles</h3>
              <p className="text-xs text-charcoal-500">Most requested textbooks by faculty and students</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('books')} className="text-xs">
              View Catalog
            </Button>
          </div>
          <div className="space-y-3">
            {stats.mostBorrowed.length === 0 ? (
              <p className="text-xs text-charcoal-400 py-4 text-center">No circulation data recorded yet.</p>
            ) : (
              stats.mostBorrowed.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-parchment-50 border border-parchment-200">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 h-6 rounded-full bg-coral-100 text-coral-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-charcoal-900 truncate">{b.title}</h4>
                      <p className="text-[11px] text-charcoal-500 truncate">{b.author} • {b.subject}</p>
                    </div>
                  </div>
                  <Badge variant="info" className="ml-2 flex-shrink-0 font-bold">
                    {b.timesBorrowed} {b.timesBorrowed === 1 ? 'Loan' : 'Loans'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Circulation Activities */}
        <div className="bg-white rounded-3xl border border-parchment-200 shadow-2xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-charcoal-900 text-sm">Recent Circulation Log</h3>
              <p className="text-xs text-charcoal-500">Active and recent transactions</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('transactions')} className="text-xs">
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {stats.recentIssues.map(iss => (
              <div key={iss.id} className="flex items-center justify-between p-3 rounded-2xl border border-parchment-200 hover:bg-parchment-50 transition">
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-charcoal-900">{iss.issue_code}</span>
                    <Badge variant={iss.status === 'overdue' ? 'danger' : iss.status === 'returned' ? 'success' : 'info'}>
                      {iss.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-charcoal-800 font-semibold truncate mt-0.5">
                    {iss.copy?.book?.title || 'Medical Book'}
                  </p>
                  <p className="text-[11px] text-charcoal-500">
                    Issued to: {iss.member?.full_name} ({iss.member?.identifier}) • Due: {iss.due_date}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-[11px] text-charcoal-400 block">{iss.issue_date}</span>
                  {iss.overdue_days && iss.overdue_days > 0 ? (
                    <span className="text-[11px] font-bold text-rose-600">
                      +{iss.overdue_days}d overdue
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
