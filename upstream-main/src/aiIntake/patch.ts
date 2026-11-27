export type FieldDef = {
  path: string;
  type: 'text' | 'textarea' | 'select' | 'boolean' | 'date' | 'currency' | 'file' | 'checkbox';
  label: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: { required?: boolean; minLength?: number };
};

export type AIPatch =
  | { op: 'set'; path: string; value: any; confidence?: number }
  | { op: 'append'; path: string; value: any; confidence?: number }
  | { op: 'addFields'; scenario: string; fields?: FieldDef[]; confidence?: number };
