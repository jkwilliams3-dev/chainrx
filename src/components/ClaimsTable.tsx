import { useState } from 'react';
import { Search, Download, ChevronUp, ChevronDown, Eye, ChevronLeft, ChevronRight, X, SlidersHorizontal } from 'lucide-react';
import type { Claim, ClaimStatus, Priority } from '../types';
import { useClaimsStore } from '../store/claimsStore';
import {
  formatCurrency,
  STATUS_COLORS,
  RESOLVED_STATUS_COLORS,
} from '../utils/claimsUtils';

interface ClaimsTableProps {
  onSelectClaim: (claim: Claim) => void;
}

const STATUS_OPTIONS: (ClaimStatus | 'ALL')[] = ['ALL', 'INTAKE', 'VERIFICATION', 'ADJUDICATION', 'REVIEW', 'RESOLVED'];
const PRIORITY_OPTIONS: (Priority | 'ALL')[] = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function ClaimsTable({ onSelectClaim }: ClaimsTableProps) {
  const {
    filters, setFilter, resetFilters,
    sortKey, sortDir, setSort,
    page, setPage, getTotalPages,
    getPaginatedClaims, getFilteredClaims,
    exportCSV,
  } = useClaimsStore();

  const [showFilters, setShowFilters] = useState(false);

  const claims = getPaginatedClaims();
  const totalFiltered = getFilteredClaims().length;
  const totalPages = getTotalPages();

  const SortIcon = ({ col }: { col: keyof Claim }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-sky-500" />
      : <ChevronDown size={12} className="text-sky-500" />;
  };

  const handleSort = (col: keyof Claim) => setSort(col);

  return (
    <div className="card flex flex-col gap-0">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search claims, patients, ICD codes…"
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
              className="input-field pl-9"
            />
            {filters.search && (
              <button
                onClick={() => setFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={e => setFilter('status', e.target.value as ClaimStatus | 'ALL')}
            className="input-field w-auto"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
            ))}
          </select>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-sky-50 border-sky-200 text-sky-700' : ''}`}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          {/* Export */}
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Priority</label>
              <select
                value={filters.priority}
                onChange={e => setFilter('priority', e.target.value as Priority | 'ALL')}
                className="input-field"
              >
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p} value={p}>{p === 'ALL' ? 'All Priorities' : p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => setFilter('startDate', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => setFilter('endDate', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Amount Range</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={e => setFilter('minAmount', e.target.value)}
                  className="input-field"
                />
                <span className="text-slate-400 text-sm">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={e => setFilter('maxAmount', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            <div className="col-span-2 md:col-span-4 flex justify-end">
              <button onClick={resetFilters} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                <X size={12} />
                Reset filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {[
                { label: 'Claim ID', key: 'id' as keyof Claim },
                { label: 'Patient', key: 'patientName' as keyof Claim },
                { label: 'Provider', key: 'provider' as keyof Claim },
                { label: 'ICD-10', key: 'icd10Code' as keyof Claim },
                { label: 'Amount', key: 'amount' as keyof Claim },
                { label: 'Submitted', key: 'submittedDate' as keyof Claim },
                { label: 'Days Open', key: 'daysOpen' as keyof Claim },
                { label: 'Status', key: 'status' as keyof Claim },
              ].map(({ label, key }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-4 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer hover:text-slate-700 whitespace-nowrap select-none"
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcon col={key} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {claims.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                  No claims match your search criteria.
                </td>
              </tr>
            ) : (
              claims.map(claim => {
                const statusColor = STATUS_COLORS[claim.status];
                return (
                  <tr
                    key={claim.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => onSelectClaim(claim)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 font-semibold whitespace-nowrap">
                      {claim.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{claim.patientName}</div>
                      <div className="text-xs text-slate-400">{claim.patientId}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <div className="truncate text-slate-700">{claim.provider}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {claim.icd10Code}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-800">
                      {formatCurrency(claim.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 text-xs">
                      {claim.submittedDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs font-medium ${claim.daysOpen > 30 ? 'text-red-600' : claim.daysOpen > 14 ? 'text-amber-600' : 'text-slate-600'}`}>
                        {claim.daysOpen}d
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`badge ${statusColor.bg} ${statusColor.text}`}>
                          {claim.status}
                        </span>
                        {claim.resolvedStatus && (
                          <span className={`badge ${RESOLVED_STATUS_COLORS[claim.resolvedStatus].bg} ${RESOLVED_STATUS_COLORS[claim.resolvedStatus].text}`}>
                            {claim.resolvedStatus.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectClaim(claim)}
                        className="flex items-center gap-1 text-sky-600 hover:text-sky-700 text-xs font-medium hover:bg-sky-50 px-2 py-1 rounded transition-colors"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
        <span>{totalFiltered} claim{totalFiltered !== 1 ? 's' : ''} found</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
