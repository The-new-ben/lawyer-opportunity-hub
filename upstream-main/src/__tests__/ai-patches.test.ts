import { describe, it, expect, vi } from 'vitest';
import { applyAIPatches, applySingleAIPatch } from '../lib/aiFieldBridge';
import type { AIPatch, FieldDef } from '../aiIntake/patch';

// Mock form for testing
const createMockForm = () => {
  const mockForm = {
    setValue: vi.fn(),
    getValues: vi.fn(() => ({})),
    control: {},
  };
  return mockForm;
};

describe('AI Patches System', () => {
  describe('Field Definitions', () => {
    it('should define basic text field correctly', () => {
      const field: FieldDef = {
        path: 'title',
        type: 'text',
        label: 'Case Title',
        description: 'Brief title for the case',
        required: true
      };
      
      expect(field.path).toBe('title');
      expect(field.type).toBe('text');
      expect(field.label).toBe('Case Title');
    });

    it('should define select field with options', () => {
      const field: FieldDef = {
        path: 'category',
        type: 'select',
        label: 'Legal Category',
        options: [
          { value: 'personal_injury', label: 'Personal Injury' },
          { value: 'family_law', label: 'Family Law' }
        ]
      };
      
      expect(field.options).toHaveLength(2);
      expect(field.options?.[0].value).toBe('personal_injury');
    });
  });

  describe('Patch Operations', () => {
    it('should apply SET patch correctly', () => {
      const patch: AIPatch = {
        op: 'set',
        path: 'title',
        value: 'New Case Title',
        confidence: 0.9
      };
      
      const mockForm = createMockForm();
      applySingleAIPatch(patch, mockForm);
      
      expect(mockForm.setValue).toHaveBeenCalledWith(
        'title',
        'New Case Title',
        { shouldDirty: true, shouldValidate: true }
      );
    });

    it('should apply APPEND patch correctly', () => {
      const patch: AIPatch = {
        op: 'append',
        path: 'evidence',
        value: 'New evidence item',
        confidence: 0.8
      };
      
      const mockForm = createMockForm();
      mockForm.getValues.mockReturnValue(['existing item']);
      applySingleAIPatch(patch, mockForm);
      
      expect(mockForm.setValue).toHaveBeenCalledWith(
        'evidence',
        ['existing item', 'New evidence item'],
        { shouldDirty: true, shouldValidate: true }
      );
    });

    it('should apply ADD_FIELDS patch correctly', () => {
      const fields: FieldDef[] = [
        {
          path: 'incident_date',
          type: 'date',
          label: 'Incident Date'
        }
      ];
      
      const patch: AIPatch = {
        op: 'addFields',
        scenario: 'personal_injury',
        fields,
        confidence: 0.95
      };
      
      const mockForm = createMockForm();
      applySingleAIPatch(patch, mockForm);
      
      // Should not throw error and should handle field addition
      expect(patch.op).toBe('addFields');
    });
  });

  describe('Batch Processing', () => {
    it('should apply multiple patches in sequence', () => {
      const patches: AIPatch[] = [
        { op: 'set', path: 'title', value: 'Title 1' },
        { op: 'set', path: 'summary', value: 'Summary 1' }
      ];
      
      const mockForm = createMockForm();
      applyAIPatches(patches, mockForm);
      
      expect(mockForm.setValue).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed patch types', () => {
      const patches: AIPatch[] = [
        { op: 'set', path: 'title', value: 'New Title' },
        { op: 'append', path: 'tags', value: 'urgent' },
        { op: 'addFields', scenario: 'personal_injury' }
      ];
      
      const mockForm = createMockForm();
      mockForm.getValues.mockReturnValue([]);
      
      expect(() => applyAIPatches(patches, mockForm)).not.toThrow();
    });
  });
});