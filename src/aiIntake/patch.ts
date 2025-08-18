export type FieldDef = {
  path: string;
  type: 'text' | 'textarea' | 'select' | 'boolean' | 'date' | 'currency' | 'file';
  label: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
};

export type AIPatch =
  | { op: 'set'; path: string; value: any }
  | { op: 'append'; path: string; value: any }
  | { op: 'addFields'; scenario: string; fields?: FieldDef[] };
