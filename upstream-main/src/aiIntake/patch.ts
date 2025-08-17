export interface AIPatch {
  op: 'set' | 'append' | 'addFields';
  path: string;
  value?: any;
  fields?: FieldDef[];
  scenario?: string;
}

export interface FieldDef {
  path: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
}