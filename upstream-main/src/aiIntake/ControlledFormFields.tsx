import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const jurisdictions = [
  'Federal Court',
  'State Court',
  'Local Court',
  'Arbitration',
  'Mediation'
];

const legalCategories = [
  'Contract Dispute',
  'Property Rights',
  'Employment Law',
  'Family Law',
  'Personal Injury',
  'Business Law',
  'Criminal Defense',
  'Immigration Law'
];

export function CaseTitleField() {
  const { control } = useFormContext();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="title" className="text-sm font-medium">Case Title *</Label>
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            id="title"
            placeholder="Brief title for your case"
            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
          />
        )}
      />
    </div>
  );
}

export function CaseSummaryField() {
  const { control } = useFormContext();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="summary" className="text-sm font-medium">Case Summary *</Label>
      <Controller
        name="summary"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            id="summary"
            placeholder="Describe your dispute in detail..."
            rows={4}
            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
          />
        )}
      />
    </div>
  );
}

export function JurisdictionField() {
  const { control } = useFormContext();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="jurisdiction" className="text-sm font-medium">Jurisdiction *</Label>
      <Controller
        name="jurisdiction"
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Select jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              {jurisdictions.map(j => (
                <SelectItem key={j} value={j}>{j}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}

export function CategoryField() {
  const { control } = useFormContext();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="category" className="text-sm font-medium">Legal Category *</Label>
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {legalCategories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}

export function GoalField() {
  const { control } = useFormContext();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="goal" className="text-sm font-medium">Discussion Goal *</Label>
      <Controller
        name="goal"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            id="goal"
            placeholder="What do you hope to achieve?"
            rows={3}
            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
          />
        )}
      />
    </div>
  );
}

export function PartiesField() {
  const { control } = useFormContext();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="parties" className="text-sm font-medium">Parties Involved</Label>
      <Controller
        name="parties"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            id="parties"
            placeholder="Plaintiff:John Doe; Defendant:Jane Smith"
            rows={2}
            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
          />
        )}
      />
    </div>
  );
}

export function EvidenceField() {
  const { control } = useFormContext();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="evidence" className="text-sm font-medium">Evidence</Label>
      <Controller
        name="evidence"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            id="evidence"
            placeholder="List relevant documents, witnesses, etc."
            rows={3}
            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
          />
        )}
      />
    </div>
  );
}

export function TimelineField() {
  const { control } = useFormContext();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="timeline" className="text-sm font-medium">Timeline</Label>
      <Controller
        name="timeline"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            id="timeline"
            placeholder="Key dates and sequence of events"
            rows={3}
            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
          />
        )}
      />
    </div>
  );
}