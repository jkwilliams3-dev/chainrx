import { describe, it, expect } from 'vitest';
import { canAdvanceStage, STAGE_ORDER, getStageIndex } from '../utils/pipelineUtils';

describe('pipelineUtils', () => {
  describe('STAGE_ORDER', () => {
    it('has 5 stages', () => {
      expect(STAGE_ORDER).toHaveLength(5);
    });

    it('starts with INTAKE', () => {
      expect(STAGE_ORDER[0]).toBe('INTAKE');
    });

    it('ends with RESOLVED', () => {
      expect(STAGE_ORDER[4]).toBe('RESOLVED');
    });

    it('contains all expected stages', () => {
      expect(STAGE_ORDER).toContain('INTAKE');
      expect(STAGE_ORDER).toContain('VERIFICATION');
      expect(STAGE_ORDER).toContain('ADJUDICATION');
      expect(STAGE_ORDER).toContain('REVIEW');
      expect(STAGE_ORDER).toContain('RESOLVED');
    });
  });

  describe('canAdvanceStage', () => {
    it('INTAKE advances to VERIFICATION', () => {
      expect(canAdvanceStage('INTAKE')).toBe('VERIFICATION');
    });

    it('VERIFICATION advances to ADJUDICATION', () => {
      expect(canAdvanceStage('VERIFICATION')).toBe('ADJUDICATION');
    });

    it('ADJUDICATION advances to REVIEW', () => {
      expect(canAdvanceStage('ADJUDICATION')).toBe('REVIEW');
    });

    it('REVIEW advances to RESOLVED', () => {
      expect(canAdvanceStage('REVIEW')).toBe('RESOLVED');
    });

    it('RESOLVED cannot advance (returns null)', () => {
      expect(canAdvanceStage('RESOLVED')).toBeNull();
    });
  });

  describe('getStageIndex', () => {
    it('INTAKE is index 0', () => {
      expect(getStageIndex('INTAKE')).toBe(0);
    });

    it('RESOLVED is index 4', () => {
      expect(getStageIndex('RESOLVED')).toBe(4);
    });

    it('ADJUDICATION is index 2', () => {
      expect(getStageIndex('ADJUDICATION')).toBe(2);
    });
  });
});
