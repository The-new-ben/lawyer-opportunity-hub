/**
 * AI Field Patching Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applyAIPatches, applySingleAIPatch, AIFieldPatch, AIFieldRegistry } from '../lib/aiFieldBridge';

// Mock form methods
const mockForm = {
  setValue: vi.fn(),
  getValues: vi.fn(),
  watch: vi.fn(),
  trigger: vi.fn(),
  reset: vi.fn(),
  handleSubmit: vi.fn(),
  formState: { errors: {}, isDirty: false, isValid: true }
};

// Test field registry
const testFieldRegistry: AIFieldRegistry = {
  caseTitle: {
    type: 'text',
    label: 'Case Title',
    validation: { required: true }
  },
  jurisdiction: {
    type: 'text',
    label: 'Jurisdiction',
    validation: { required: true }
  }
};

// Reset function
const resetMocks = () => {
  vi.clearAllMocks();
};

describe('AI Field Patching', () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetMocks();
  });

  it('applies high-confidence patches to empty fields', () => {
    resetMocks();
    mockForm.getValues.mockReturnValue(''); // Empty field
    
    const patches: AIFieldPatch[] = [
      {
        path: 'caseTitle',
        value: 'Personal Injury Case',
        confidence: 0.9
      }
    ];

    applyAIPatches(mockForm as any, patches, testFieldRegistry);
    
    expect(mockForm.setValue).toHaveBeenCalledWith('caseTitle', 'Personal Injury Case');
  });

  it('skips low-confidence patches', () => {
    resetMocks();
    const patches: AIFieldPatch[] = [
      {
        path: 'caseTitle',
        value: 'Low Confidence Case',
        confidence: 0.4
      }
    ];

    applyAIPatches(mockForm as any, patches, testFieldRegistry);
    
    expect(mockForm.setValue).not.toHaveBeenCalled();
  });

  it('skips patches for non-empty fields', () => {
    resetMocks();
    mockForm.getValues.mockReturnValue('Existing Value');
    
    const patches: AIFieldPatch[] = [
      {
        path: 'caseTitle',
        value: 'Updated Case Title',
        confidence: 0.8
      }
    ];

    applyAIPatches(mockForm as any, patches, testFieldRegistry);
    
    expect(mockForm.setValue).not.toHaveBeenCalled();
  });

  it('applies single field patch successfully', () => {
    resetMocks();
    const result = applySingleAIPatch(
      mockForm as any,
      'jurisdiction',
      'Federal Court',
      0.8
    );
    
    expect(result.success).toBe(true);
    expect(mockForm.setValue).toHaveBeenCalledWith('jurisdiction', 'Federal Court');
  });

  it('rejects single field patch with low confidence', () => {
    resetMocks();
    const result = applySingleAIPatch(
      mockForm as any,
      'jurisdiction',
      'Low Confidence Court',
      0.3
    );
    
    expect(result.success).toBe(false);
    expect(mockForm.setValue).not.toHaveBeenCalled();
  });
});