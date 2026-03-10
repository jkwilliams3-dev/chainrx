import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from '@testing-library/react';
import AnomalyCard from '../components/AnomalyCard';
import { useAuthStore } from '../store/authStore';
import { useAnomalyStore } from '../store/anomalyStore';
import { mockAnomalies } from '../data/mockAnomalies';
import type { Anomaly } from '../types';
import { BrowserRouter } from 'react-router-dom';

function renderCard(anomaly: Anomaly) {
  return render(
    <BrowserRouter>
      <AnomalyCard anomaly={anomaly} />
    </BrowserRouter>
  );
}

describe('AnomalyCard', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.getState().logout();
      // Reset anomaly store
      useAnomalyStore.setState({ anomalies: [...mockAnomalies] });
    });
  });

  const openAnomaly = mockAnomalies.find(a => a.status === 'OPEN')!;
  const investigatedAnomaly = mockAnomalies.find(a => a.status === 'INVESTIGATED')!;
  const escalatedAnomaly = mockAnomalies.find(a => a.status === 'ESCALATED')!;

  it('renders anomaly type badge', () => {
    renderCard(openAnomaly);
    const typeLabelText = openAnomaly.type === 'DUPLICATE' ? 'Duplicate Submission'
      : openAnomaly.type === 'FREQUENCY' ? 'Unusual Frequency'
      : openAnomaly.type === 'AMOUNT_OUTLIER' ? 'Amount Outlier'
      : 'Expired Coverage';
    // Use getAllByText because the word may appear in description/action too
    const matches = screen.getAllByText(typeLabelText);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('renders the anomaly description', () => {
    renderCard(openAnomaly);
    expect(screen.getByText(openAnomaly.description)).toBeInTheDocument();
  });

  it('renders risk score', () => {
    renderCard(openAnomaly);
    expect(screen.getByText(String(openAnomaly.riskScore))).toBeInTheDocument();
  });

  it('renders claim ID', () => {
    renderCard(openAnomaly);
    expect(screen.getByText(openAnomaly.claimId)).toBeInTheDocument();
  });

  it('renders recommended action', () => {
    renderCard(openAnomaly);
    expect(screen.getByText('Recommended Action')).toBeInTheDocument();
    expect(screen.getByText(openAnomaly.recommendedAction)).toBeInTheDocument();
  });

  it('shows OPEN status badge', () => {
    renderCard(openAnomaly);
    expect(screen.getByText('OPEN')).toBeInTheDocument();
  });

  it('shows INVESTIGATED status badge', () => {
    renderCard(investigatedAnomaly);
    expect(screen.getByText('INVESTIGATED')).toBeInTheDocument();
  });

  it('shows ESCALATED status badge', () => {
    renderCard(escalatedAnomaly);
    expect(screen.getByText('ESCALATED')).toBeInTheDocument();
  });

  describe('as ADMIN', () => {
    beforeEach(() => {
      act(() => { useAuthStore.getState().login('admin@chainrx.io', 'Secure#2025!'); });
    });

    it('shows action buttons for OPEN anomaly', () => {
      renderCard(openAnomaly);
      expect(screen.getByText('Mark Investigated')).toBeInTheDocument();
      expect(screen.getByText('Escalate')).toBeInTheDocument();
    });

    it('clicking Mark Investigated updates store', () => {
      renderCard(openAnomaly);
      const btn = screen.getByText('Mark Investigated');
      fireEvent.click(btn);
      const updated = useAnomalyStore.getState().anomalies.find(a => a.id === openAnomaly.id);
      expect(updated?.status).toBe('INVESTIGATED');
    });

    it('clicking Escalate updates store', () => {
      renderCard(openAnomaly);
      const btn = screen.getByText('Escalate');
      fireEvent.click(btn);
      const updated = useAnomalyStore.getState().anomalies.find(a => a.id === openAnomaly.id);
      expect(updated?.status).toBe('ESCALATED');
    });

    it('shows only Escalate button for INVESTIGATED anomaly', () => {
      renderCard(investigatedAnomaly);
      expect(screen.getByText('Escalate')).toBeInTheDocument();
      expect(screen.queryByText('Mark Investigated')).not.toBeInTheDocument();
    });

    it('shows no action buttons for ESCALATED anomaly', () => {
      renderCard(escalatedAnomaly);
      expect(screen.queryByText('Mark Investigated')).not.toBeInTheDocument();
      expect(screen.queryByText('Escalate')).not.toBeInTheDocument();
    });
  });

  describe('as AUDITOR (read-only)', () => {
    beforeEach(() => {
      act(() => { useAuthStore.getState().login('auditor@chainrx.io', 'Audit#2025!'); });
    });

    it('does NOT show action buttons', () => {
      renderCard(openAnomaly);
      expect(screen.queryByText('Mark Investigated')).not.toBeInTheDocument();
      expect(screen.queryByText('Escalate')).not.toBeInTheDocument();
    });
  });

  describe('as REVIEWER', () => {
    beforeEach(() => {
      act(() => { useAuthStore.getState().login('reviewer@chainrx.io', 'Review#2025!'); });
    });

    it('does NOT show action buttons (reviewer is not admin)', () => {
      renderCard(openAnomaly);
      expect(screen.queryByText('Mark Investigated')).not.toBeInTheDocument();
      expect(screen.queryByText('Escalate')).not.toBeInTheDocument();
    });
  });

  it('displays High Risk label for score >= 75', () => {
    const highRiskAnomaly = { ...openAnomaly, riskScore: 80 };
    renderCard(highRiskAnomaly);
    expect(screen.getByText(/High Risk/i)).toBeInTheDocument();
  });

  it('displays Medium Risk label for score 50-74', () => {
    const medAnomaly = { ...openAnomaly, riskScore: 62 };
    renderCard(medAnomaly);
    expect(screen.getByText(/Medium Risk/i)).toBeInTheDocument();
  });
});
