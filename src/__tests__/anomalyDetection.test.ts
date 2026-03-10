import { describe, it, expect } from 'vitest';
import {
  getRiskColor,
  getRiskLabel,
  calculateExposureTotal,
  countHighRisk,
  groupByType,
} from '../utils/anomalyUtils';
import { mockAnomalies } from '../data/mockAnomalies';
import type { Anomaly } from '../types';

describe('anomalyUtils', () => {
  describe('getRiskLabel', () => {
    it('score >= 75 is High Risk', () => {
      expect(getRiskLabel(75)).toBe('High Risk');
      expect(getRiskLabel(90)).toBe('High Risk');
      expect(getRiskLabel(100)).toBe('High Risk');
    });

    it('score 50-74 is Medium Risk', () => {
      expect(getRiskLabel(50)).toBe('Medium Risk');
      expect(getRiskLabel(65)).toBe('Medium Risk');
      expect(getRiskLabel(74)).toBe('Medium Risk');
    });

    it('score < 50 is Low Risk', () => {
      expect(getRiskLabel(0)).toBe('Low Risk');
      expect(getRiskLabel(25)).toBe('Low Risk');
      expect(getRiskLabel(49)).toBe('Low Risk');
    });
  });

  describe('getRiskColor', () => {
    it('returns red stroke for high risk', () => {
      const color = getRiskColor(80);
      expect(color.stroke).toBe('#ef4444');
    });

    it('returns amber stroke for medium risk', () => {
      const color = getRiskColor(60);
      expect(color.stroke).toBe('#f59e0b');
    });

    it('returns green stroke for low risk', () => {
      const color = getRiskColor(30);
      expect(color.stroke).toBe('#10b981');
    });
  });

  describe('calculateExposureTotal', () => {
    it('sums all exposure amounts', () => {
      const total = calculateExposureTotal(mockAnomalies);
      const expected = mockAnomalies.reduce((sum, a) => sum + a.exposureAmount, 0);
      expect(total).toBe(expected);
    });

    it('returns 0 for empty array', () => {
      expect(calculateExposureTotal([])).toBe(0);
    });

    it('calculates correctly for a small set', () => {
      const anomalies: Anomaly[] = [
        { ...mockAnomalies[0], exposureAmount: 500 },
        { ...mockAnomalies[1], exposureAmount: 1000 },
      ];
      expect(calculateExposureTotal(anomalies)).toBe(1500);
    });
  });

  describe('countHighRisk', () => {
    it('counts anomalies with risk score >= 75', () => {
      const count = countHighRisk(mockAnomalies);
      const expected = mockAnomalies.filter(a => a.riskScore >= 75).length;
      expect(count).toBe(expected);
    });

    it('returns 0 when no high risk', () => {
      const lowRisk = mockAnomalies.map(a => ({ ...a, riskScore: 50 }));
      expect(countHighRisk(lowRisk)).toBe(0);
    });

    it('returns correct count for all high risk', () => {
      const allHigh = mockAnomalies.map(a => ({ ...a, riskScore: 90 }));
      expect(countHighRisk(allHigh)).toBe(mockAnomalies.length);
    });
  });

  describe('groupByType', () => {
    it('groups 15 anomalies into 4 types', () => {
      const grouped = groupByType(mockAnomalies);
      const total = Object.values(grouped).reduce((sum, v) => sum + v, 0);
      expect(total).toBe(mockAnomalies.length);
    });

    it('has correct counts for each type', () => {
      const grouped = groupByType(mockAnomalies);
      expect(grouped.DUPLICATE).toBe(4);
      expect(grouped.FREQUENCY).toBe(4);
      expect(grouped.AMOUNT_OUTLIER).toBe(4);
      expect(grouped.EXPIRED_COVERAGE).toBe(3);
    });

    it('returns 0 for all types on empty array', () => {
      const grouped = groupByType([]);
      expect(grouped.DUPLICATE).toBe(0);
      expect(grouped.FREQUENCY).toBe(0);
      expect(grouped.AMOUNT_OUTLIER).toBe(0);
      expect(grouped.EXPIRED_COVERAGE).toBe(0);
    });
  });

  describe('mockAnomalies data', () => {
    it('contains 15 anomalies', () => {
      expect(mockAnomalies).toHaveLength(15);
    });

    it('all anomalies have required fields', () => {
      mockAnomalies.forEach(a => {
        expect(a.id).toBeDefined();
        expect(a.claimId).toBeDefined();
        expect(a.riskScore).toBeGreaterThanOrEqual(0);
        expect(a.riskScore).toBeLessThanOrEqual(100);
        expect(a.exposureAmount).toBeGreaterThan(0);
        expect(a.recommendedAction).toBeDefined();
      });
    });

    it('duplicate anomalies have risk scores 70-85', () => {
      const duplicates = mockAnomalies.filter(a => a.type === 'DUPLICATE');
      duplicates.forEach(a => {
        expect(a.riskScore).toBeGreaterThanOrEqual(70);
        expect(a.riskScore).toBeLessThanOrEqual(85);
      });
    });

    it('expired coverage anomalies have risk scores 85-98', () => {
      const expired = mockAnomalies.filter(a => a.type === 'EXPIRED_COVERAGE');
      expired.forEach(a => {
        expect(a.riskScore).toBeGreaterThanOrEqual(85);
        expect(a.riskScore).toBeLessThanOrEqual(98);
      });
    });
  });
});
