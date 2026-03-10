import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useClaimsStore } from '../store/claimsStore';

describe('useClaimsStore', () => {
  beforeEach(() => {
    act(() => {
      useClaimsStore.getState().resetFilters();
      useClaimsStore.getState().setPage(1);
    });
  });

  it('loads 110 mock claims', () => {
    const { result } = renderHook(() => useClaimsStore());
    expect(result.current.claims).toHaveLength(110);
  });

  it('paginates to 20 per page', () => {
    const { result } = renderHook(() => useClaimsStore());
    const paginated = result.current.getPaginatedClaims();
    expect(paginated.length).toBeLessThanOrEqual(20);
  });

  it('filters by search term on claim ID', () => {
    const { result } = renderHook(() => useClaimsStore());
    const firstId = result.current.claims[0].id;

    act(() => {
      result.current.setFilter('search', firstId);
    });

    const filtered = result.current.getFilteredClaims();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].id).toBe(firstId);
  });

  it('filters by status', () => {
    const { result } = renderHook(() => useClaimsStore());
    act(() => { result.current.setFilter('status', 'INTAKE'); });
    const filtered = result.current.getFilteredClaims();
    filtered.forEach(c => expect(c.status).toBe('INTAKE'));
  });

  it('filters by priority', () => {
    const { result } = renderHook(() => useClaimsStore());
    act(() => { result.current.setFilter('priority', 'CRITICAL'); });
    const filtered = result.current.getFilteredClaims();
    filtered.forEach(c => expect(c.priority).toBe('CRITICAL'));
  });

  it('filters by amount range', () => {
    const { result } = renderHook(() => useClaimsStore());
    act(() => {
      result.current.setFilter('minAmount', '1000');
      result.current.setFilter('maxAmount', '5000');
    });
    const filtered = result.current.getFilteredClaims();
    filtered.forEach(c => {
      expect(c.amount).toBeGreaterThanOrEqual(1000);
      expect(c.amount).toBeLessThanOrEqual(5000);
    });
  });

  it('resets filters back to defaults', () => {
    const { result } = renderHook(() => useClaimsStore());
    act(() => { result.current.setFilter('status', 'RESOLVED'); });
    expect(result.current.getFilteredClaims().length).toBeLessThan(110);

    act(() => { result.current.resetFilters(); });
    expect(result.current.getFilteredClaims()).toHaveLength(110);
  });

  it('sorts by amount ascending', () => {
    const { result } = renderHook(() => useClaimsStore());
    // Force sort key to 'amount' ascending — toggle twice if needed to ensure asc
    act(() => {
      // First call sets sortKey=amount, dir depends on previous state
      // Reset to a known different key first
      result.current.setSort('patientName');
    });
    act(() => {
      // Now set to amount — first call from different key always sets asc
      result.current.setSort('amount');
    });
    // Verify sortDir is asc after switching from a different key
    expect(result.current.sortDir).toBe('asc');
    const sorted = result.current.getFilteredClaims();
    for (let i = 1; i < Math.min(sorted.length, 10); i++) {
      expect(sorted[i].amount).toBeGreaterThanOrEqual(sorted[i - 1].amount);
    }
  });

  it('total pages is correct for 110 claims at 20 per page', () => {
    const { result } = renderHook(() => useClaimsStore());
    expect(result.current.getTotalPages()).toBe(6); // ceil(110/20) = 6
  });

  it('setPage changes current page', () => {
    const { result } = renderHook(() => useClaimsStore());
    act(() => { result.current.setPage(3); });
    expect(result.current.page).toBe(3);
  });

  it('setSelectedClaim stores claim ID', () => {
    const { result } = renderHook(() => useClaimsStore());
    const firstId = result.current.claims[0].id;
    act(() => { result.current.setSelectedClaim(firstId); });
    expect(result.current.selectedClaimId).toBe(firstId);
    const selected = result.current.getSelectedClaim();
    expect(selected?.id).toBe(firstId);
  });
});
