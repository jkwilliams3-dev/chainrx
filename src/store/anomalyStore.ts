import { create } from 'zustand';
import type { Anomaly, AnomalyType } from '../types';
import { mockAnomalies } from '../data/mockAnomalies';

interface AnomalyState {
  anomalies: Anomaly[];
  filterType: AnomalyType | 'ALL';
  setFilterType: (type: AnomalyType | 'ALL') => void;
  markInvestigated: (id: string) => void;
  escalate: (id: string) => void;
  getFilteredAnomalies: () => Anomaly[];
}

export const useAnomalyStore = create<AnomalyState>((set, get) => ({
  anomalies: mockAnomalies,
  filterType: 'ALL',

  setFilterType: (type) => set({ filterType: type }),

  markInvestigated: (id) => {
    set(state => ({
      anomalies: state.anomalies.map(a =>
        a.id === id ? { ...a, status: 'INVESTIGATED' as const } : a
      ),
    }));
  },

  escalate: (id) => {
    set(state => ({
      anomalies: state.anomalies.map(a =>
        a.id === id ? { ...a, status: 'ESCALATED' as const } : a
      ),
    }));
  },

  getFilteredAnomalies: () => {
    const { anomalies, filterType } = get();
    if (filterType === 'ALL') return anomalies;
    return anomalies.filter(a => a.type === filterType);
  },
}));
