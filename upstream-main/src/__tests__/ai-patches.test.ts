/**
 * AI Field Patching Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { applyAIPatches, applySingleAIPatch, AIFieldPatch, AIFieldRegistry } from '../lib/aiFieldBridge';

// Mock react-hook-form
const mockForm = {
  getValues: vi.fn(),
  setValue: vi.fn(),
};

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

const testFieldRegistry: AIFieldRegistry = {
  incident_date: {
    type: 'date',
    label: 'תאריך האירוע',
    validation: { required: true }
  },
  injury_description: {
    type: 'textarea',
    label: 'תיאור הפציעה',
    validation: { required: true, minLength: 10 }
  }
};

describe('AI Field Patching', () => {
  // Reset mocks before each test
  const resetMocks = () => {
    vi.clearAllMocks();
  };

  it('applies high-confidence patches to empty fields', () => {
    resetMocks();
    mockForm.getValues.mockReturnValue(''); // Empty field
    
    const patches: AIFieldPatch[] = [
      {
        field: 'incident_date',
        value: '2024-01-15',
        confidence: 0.9,
        source: 'ai'
      }
    ];

    applyAIPatches(mockForm as any, patches, testFieldRegistry);
    
    expect(mockForm.setValue).toHaveBeenCalledWith('incident_date', '2024-01-15', { shouldValidate: true });
  });

  it('skips low-confidence patches', () => {
    resetMocks();
    const patches: AIFieldPatch[] = [
      {
        field: 'incident_date',
        value: '2024-01-15',
        confidence: 0.5, // Low confidence
        source: 'ai'
      }
    ];

    applyAIPatches(mockForm as any, patches, testFieldRegistry);
    
    expect(mockForm.setValue).not.toHaveBeenCalled();
  });

  it('skips patches for non-empty fields', () => {
    resetMocks();
    mockForm.getValues.mockReturnValue('existing value'); // Non-empty field
    
    const patches: AIFieldPatch[] = [
      {
        field: 'incident_date',
        value: '2024-01-15',
        confidence: 0.9,
        source: 'ai'
      }
    ];

    applyAIPatches(mockForm as any, patches, testFieldRegistry);
    
    expect(mockForm.setValue).not.toHaveBeenCalled();
  });

  it('applies single field patch successfully', () => {
    resetMocks();
    const result = applySingleAIPatch(
      mockForm as any,
      'injury_description',
      'פציעה בגב',
      testFieldRegistry
    );
    
    expect(result).toBe(true);
    expect(mockForm.setValue).toHaveBeenCalledWith('injury_description', 'פציעה בגב', { shouldValidate: true });
  });

  it('returns false for unknown fields', () => {
    resetMocks();
    const result = applySingleAIPatch(
      mockForm as any,
      'unknown_field',
      'value',
      testFieldRegistry
    );
    
    expect(result).toBe(false);
    expect(mockForm.setValue).not.toHaveBeenCalled();
  });
});