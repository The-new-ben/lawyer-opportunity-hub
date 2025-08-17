/**
 * AI Field Bridge - Dynamic field patching for forms
 * Handles applying AI-generated suggestions to form fields
 */

import { UseFormReturn } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';

export interface AIFieldPatch {
  field: string;
  value: any;
  confidence: number;
  source: 'ai' | 'user';
}

export interface AIFieldRegistry {
  [key: string]: {
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date';
    label: string;
    description?: string;
    options?: { value: string; label: string; }[];
    validation?: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
    };
  };
}

/**
 * Apply AI-generated patches to a react-hook-form instance
 */
export function applyAIPatches(
  form: UseFormReturn<any>,
  patches: AIFieldPatch[],
  fieldRegistry: AIFieldRegistry
) {
  const appliedPatches: string[] = [];
  
  patches.forEach(patch => {
    const { field, value, confidence } = patch;
    
    // Skip low-confidence suggestions
    if (confidence < 0.7) return;
    
    // Skip if field doesn't exist in registry
    if (!fieldRegistry[field]) return;
    
    // Skip if user has already modified this field
    const currentValue = form.getValues(field);
    if (currentValue && currentValue.trim() !== '') return;
    
    try {
      // Apply the patch
      form.setValue(field, value, { shouldValidate: true });
      appliedPatches.push(fieldRegistry[field].label);
    } catch (error) {
      console.warn(`Failed to apply patch for field ${field}:`, error);
    }
  });
  
  if (appliedPatches.length > 0) {
    toast({
      title: "AI Suggestions Applied",
      description: `Updated: ${appliedPatches.join(', ')}`,
      duration: 3000,
    });
  }
}

/**
 * Apply a single field suggestion from AI
 */
export function applySingleAIPatch(
  form: UseFormReturn<any>,
  field: string,
  value: any,
  fieldRegistry: AIFieldRegistry
) {
  if (!fieldRegistry[field]) return false;
  
  try {
    form.setValue(field, value, { shouldValidate: true });
    toast({
      title: "AI Suggestion Applied",
      description: `Updated ${fieldRegistry[field].label}`,
      duration: 2000,
    });
    return true;
  } catch (error) {
    console.warn(`Failed to apply patch for field ${field}:`, error);
    return false;
  }
}