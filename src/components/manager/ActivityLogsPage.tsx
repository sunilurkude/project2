import React, { useState, useMemo } from 'react';
import { AuditLog } from '../../types';
import {
  DocumentTextIcon,
  SearchCircleIcon,
  TrashIcon,
} from '../icons/FeatureIcons';

interface ActivityLogsPageProps {
  auditLogs: AuditLog[];
}

const ActivityLogsPage: React.FC<ActivityLogsPageProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Extract unique action types for the filter dropdown
  const actionTypes = useMemo(() => {
    const types = new Set<string>();
    auditLogs.forEach(log => types.add(log.action));
    return Array.from(types).sort();
  }, [auditLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    let logs = auditLogs;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      logs = logs.filter(log =>
        log.action.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.userName?.toLowerCase().includes(q) ||
        log.userId?.toLowerCase().includes(q) ||
        log.userRole?.toLowerCase().includes(q)
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      logs = logs.filter(log => log.action === actionFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      logs = logs.filter(log => log.userRole === roleFilter);
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom).getTime();
      logs = logs.filter(log => new Date(log.createdAt).getTime() >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo).getTime() + 86400000; // Include the end day
      logs = logs.filter(log => new Date(log.createdAt).getTime() <= toDate);
    }

    return logs;
  }, [auditLogs, searchQuery, actionFilter, roleFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchQuery('');
    setActionFilter('all');
    setRoleFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchQuery || actionFilter !== 'all' || roleFilter !== 'all' || dateFrom || dateTo;

  // Role badge colors
  const roleBadgeClass = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-light text-gray-800 flex items-center">
          <DocumentTextIcon className="w-6 h-6 text-orange-500 mr-2" />
          Activity Logs
        </h2>
        <span className="text-sm text-gray-500 font-light">
          {filteredLogs.length} of {auditLogs.length} entries
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <SearchCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            />
          </div>

          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            <option value="all">All Actions</option>
            {actionTypes.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            <option value="all">All Roles</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
          </select>

          {/* Date from */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            title="From date"
          />

          {/* Date to */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            title="To date"
          />
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Logs Table */}
      {filteredLogs.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                <tr className="text-gray-600 text-sm">
                  <th className="p-4 font-normal w-44">Date/Time</th>
                  <th className="p-4 font-normal w-36">Action</th>
                  <th className="p-4 font-normal w-24">Role</th>
                  <th className="p-4 font-normal w-40">User Name</th>
                  <th className="p-4 font-normal">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-800 text-sm font-light whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${roleBadgeClass(log.userRole)}`}>
                        {log.userRole}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="font-medium text-gray-900">{log.userName}</div>
                      <div className="text-xs text-gray-500 font-mono">{log.userId}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-light break-words max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-light text-lg">
            {auditLogs.length === 0
              ? 'No audit logs available yet.'
              : 'No logs match your current filters.'}
          </p>
          {auditLogs.length > 0 && hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLogsPage;
