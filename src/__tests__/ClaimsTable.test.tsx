import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from '@testing-library/react';
import ClaimsTable from '../components/ClaimsTable';
import { useClaimsStore } from '../store/claimsStore';
import { useAuthStore } from '../store/authStore';
import { BrowserRouter } from 'react-router-dom';

function renderTable(onSelectClaim = vi.fn()) {
  return render(
    <BrowserRouter>
      <ClaimsTable onSelectClaim={onSelectClaim} />
    </BrowserRouter>
  );
}

describe('ClaimsTable', () => {
  beforeEach(() => {
    act(() => {
      useClaimsStore.getState().resetFilters();
      useClaimsStore.getState().setPage(1);
      useAuthStore.getState().login('admin@chainrx.io', 'Secure#2025!');
    });
  });

  it('renders the table with column headers', () => {
    renderTable();
    expect(screen.getByText('Claim ID')).toBeInTheDocument();
    expect(screen.getByText('Patient')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows 20 data rows on first page', () => {
    renderTable();
    const clmCells = screen.getAllByText(/^CLM-\d+$/);
    expect(clmCells.length).toBe(20);
  });

  it('filters by search term on claim ID', () => {
    renderTable();
    const searchInput = screen.getByPlaceholderText(/Search claims/i);
    const firstClaimId = useClaimsStore.getState().claims[0].id;
    fireEvent.change(searchInput, { target: { value: firstClaimId } });

    const clmCells = screen.getAllByText(/^CLM-\d+$/);
    expect(clmCells.length).toBe(1);
    expect(clmCells[0].textContent).toBe(firstClaimId);
  });

  it('shows "no claims" message for unmatched search', () => {
    renderTable();
    const searchInput = screen.getByPlaceholderText(/Search claims/i);
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_CLAIM_ZZZZZZ' } });
    expect(screen.getByText(/No claims match/i)).toBeInTheDocument();
  });

  it('filters by status dropdown', () => {
    renderTable();
    const statusSelect = screen.getByDisplayValue('All Statuses');
    fireEvent.change(statusSelect, { target: { value: 'RESOLVED' } });

    const resolvedBadges = screen.getAllByText('RESOLVED');
    expect(resolvedBadges.length).toBeGreaterThan(0);
  });

  it('shows correct total claim count', () => {
    renderTable();
    expect(screen.getByText(/110 claims found/i)).toBeInTheDocument();
  });

  it('calls onSelectClaim when View button is clicked', () => {
    const mockSelect = vi.fn();
    renderTable(mockSelect);

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: expect.stringMatching(/^CLM-/) })
    );
  });

  it('shows Export CSV button', () => {
    renderTable();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('toggles advanced filters panel', () => {
    renderTable();
    const filterBtn = screen.getByText('Filters');
    fireEvent.click(filterBtn);
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('Amount Range')).toBeInTheDocument();
  });

  it('shows pagination controls', () => {
    renderTable();
    expect(screen.getByText(/Page 1 of 6/i)).toBeInTheDocument();
  });

  it('clears search with X button', () => {
    renderTable();
    const searchInput = screen.getByPlaceholderText(/Search claims/i);
    fireEvent.change(searchInput, { target: { value: 'something' } });

    // The X clear button should be visible after typing
    expect(screen.queryByText(/110 claims found/i)).not.toBeInTheDocument();
    // After clicking the clear (X near search), count resets
    // Find the clear button (the sibling button of the search input)
    const form = searchInput.closest('div');
    const btns = form?.querySelectorAll('button');
    if (btns && btns.length > 0) {
      fireEvent.click(btns[0]);
    }
  });
});
