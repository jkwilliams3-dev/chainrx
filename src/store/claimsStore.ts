import { create } from 'zustand';
import type { Claim, ClaimStatus, Priority } from '../types';
import { mockClaims } from '../data/mockClaims';
import { filterClaims, sortClaims, exportToCSV } from '../utils/claimsUtils';

const PAGE_SIZE = 20;

interface ClaimsFilters {
  search: string;
  status: ClaimStatus | 'ALL';
  priority: Priority | 'ALL';
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
}

interface ClaimsState {
  claims: Claim[];
  filters: ClaimsFilters;
  sortKey: keyof Claim;
  sortDir: 'asc' | 'desc';
  page: number;
  selectedClaimId: string | null;
  setFilter: <K extends keyof ClaimsFilters>(key: K, value: ClaimsFilters[K]) => void;
  resetFilters: () => void;
  setSort: (key: keyof Claim) => void;
  setPage: (page: number) => void;
  setSelectedClaim: (id: string | null) => void;
  getFilteredClaims: () => Claim[];
  getPaginatedClaims: () => Claim[];
  getTotalPages: () => number;
  getSelectedClaim: () => Claim | null;
  exportCSV: () => void;
}

const defaultFilters: ClaimsFilters = {
  search: '',
  status: 'ALL',
  priority: 'ALL',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
};

export const useClaimsStore = create<ClaimsState>((set, get) => ({
  claims: mockClaims,
  filters: { ...defaultFilters },
  sortKey: 'submittedDate',
  sortDir: 'desc',
  page: 1,
  selectedClaimId: null,

  setFilter: (key, value) => {
    set(state => ({ filters: { ...state.filters, [key]: value }, page: 1 }));
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters }, page: 1 });
  },

  setSort: (key) => {
    set(state => ({
      sortKey: key,
      sortDir: state.sortKey === key && state.sortDir === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  },

  setPage: (page) => set({ page }),

  setSelectedClaim: (id) => set({ selectedClaimId: id }),

  getFilteredClaims: () => {
    const { claims, filters, sortKey, sortDir } = get();
    const filtered = filterClaims(claims, filters);
    return sortClaims(filtered, sortKey, sortDir);
  },

  getPaginatedClaims: () => {
    const { page } = get();
    const filtered = get().getFilteredClaims();
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  },

  getTotalPages: () => {
    const filtered = get().getFilteredClaims();
    return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  },

  getSelectedClaim: () => {
    const { claims, selectedClaimId } = get();
    if (!selectedClaimId) return null;
    return claims.find(c => c.id === selectedClaimId) ?? null;
  },

  exportCSV: () => {
    const filtered = get().getFilteredClaims();
    exportToCSV(filtered);
  },
}));
