import { useState, useEffect, useRef } from "react";
import { intakeExtract } from "@/lib/api";

interface Field {
  name: string;
  value: string;
  status: 'pending' | 'partial' | 'complete';
  confidence: number;
}

export function useFieldExtraction(text: string) {
  const [fields, setFields] = useState<Field[]>([]);
  const [progress, setProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!text.trim()) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsExtracting(true);
    
    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await intakeExtract(text);
        
        const extractedFields: Field[] = [];
        
        if (result.jurisdiction) {
          extractedFields.push({
            name: 'jurisdiction',
            value: result.jurisdiction,
            status: 'complete',
            confidence: result.confidence?.jurisdiction || 0.8
          });
        }
        
        if (result.parties?.length) {
          extractedFields.push({
            name: 'parties',
            value: result.parties.join(', '),
            status: result.parties.length >= 2 ? 'complete' : 'partial',
            confidence: result.confidence?.parties || 0.7
          });
        }
        
        if (result.category) {
          extractedFields.push({
            name: 'category',
            value: result.category,
            status: 'complete',
            confidence: result.confidence?.category || 0.9
          });
        }

        setFields(extractedFields);
        setProgress(Math.min(extractedFields.length * 25, 100));
      } catch (error) {
        console.error('Field extraction failed:', error);
        setFields([]);
        setProgress(0);
      } finally {
        setIsExtracting(false);
      }
    }, 800);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text]);

  return { fields, progress, isExtracting };
}