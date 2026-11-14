import React, { useState } from 'react';
import { ShieldAlert, Search, Filter, Clock, Download } from 'lucide-react';
import { db } from '../../services/db';
import { AuditLog } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { exportToCsv } from '../../services/reports';
import { useToast } from '../../context/ToastContext';

export const AuditLogsView: React.FC = () => {
  const { success } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const logs = db.getAuditLogs();

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      JSON.stringify(log.details || {}).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportCsv = () => {
    const exportData = filteredLogs.map(l => ({
      Timestamp: l.created_at,
      UserEmail: l.user_email || 'System',
      Action: l.action,
      Entity: l.entity,
      EntityID: l.entity_id || '',
      IPAddress: l.ip_address || '',
      Details: JSON.stringify(l.details || {})
    }));
    exportToCsv('ESIC_Library_Audit_Trail', exportData);
    success('Audit Trail Exported', 'CSV security log downloaded.');
  };

  const getActionBadge = (action: string) => {
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return <Badge variant="default">{action}</Badge>;
    if (action.includes('ISSUE')) return <Badge variant="info">{action}</Badge>;
    if (action.includes('RETURN')) return <Badge variant="success">{action}</Badge>;
    if (action.includes('PAYMENT')) return <Badge variant="purple">{action}</Badge>;
    if (action.includes('WAIVE')) return <Badge variant="warning">{action}</Badge>;
    if (action.includes('SETTINGS')) return <Badge variant="danger">{action}</Badge>;
    return <Badge>{action}</Badge>;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teal-700" />
            Institutional Security & Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all staff operations, circulation modifications, payments, and setting changes
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={handleExportCsv} className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1" /> Export Audit Log (CSV)
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, user email, entity ID, or operation details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
          >
            <option value="all">All Audit Actions</option>
            <option value="ISSUE_BOOK">ISSUE_BOOK</option>
            <option value="RETURN_BOOK">RETURN_BOOK</option>
            <option value="RECORD_FINE_PAYMENT">RECORD_FINE_PAYMENT</option>
            <option value="WAIVE_FINE">WAIVE_FINE</option>
            <option value="CREATE_BOOK">CREATE_BOOK</option>
            <option value="REGISTER_MEMBER">REGISTER_MEMBER</option>
            <option value="UPDATE_SETTINGS">UPDATE_SETTINGS</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
                <th className="px-3 py-3 text-left font-semibold">Staff Identity</th>
                <th className="px-3 py-3 text-left font-semibold">Action & Target</th>
                <th className="px-3 py-3 text-left font-semibold">Event Parameters</th>
                <th className="px-3 py-3 text-right font-semibold">Network IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      <div className="font-mono text-[11px] text-slate-800">
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <span className="font-semibold text-slate-900">{log.user_email || 'System'}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">UID: {log.user_id || 'sys'}</span>
                    </td>

                    <td className="px-3 py-3">
                      {getActionBadge(log.action)}
                      <span className="block text-[11px] font-mono text-slate-600 mt-0.5">
                        {log.entity} {log.entity_id ? `(${log.entity_id})` : ''}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-slate-600 max-w-sm">
                      <pre className="font-mono text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200 overflow-x-auto">
                        {JSON.stringify(log.details || {}, null, 1)}
                      </pre>
                    </td>

                    <td className="px-3 py-3 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
