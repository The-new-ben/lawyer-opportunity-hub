import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pen, Trash2, Save } from 'lucide-react';

interface SignatureDialogProps {
  onSign: (signature: string) => void;
  onCancel: () => void;
}

export function SignatureDialog({ onSign, onCancel }: SignatureDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const dataURL = canvas.toDataURL();
    onSign(dataURL);
  };

  const initCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pen className="h-5 w-5" />
          חתימה דיגיטלית
        </CardTitle>
        <CardDescription>
          חתום בתוך המסגרת למטה
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
          <canvas
            ref={(canvas) => {
              if (canvas) {
                canvasRef.current = canvas;
                initCanvas(canvas);
              }
            }}
            width={400}
            height={200}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-48 cursor-crosshair bg-white rounded border"
            style={{ touchAction: 'none' }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            נקה
          </Button>
          <Button
            onClick={saveSignature}
            disabled={!hasSignature}
            className="flex-1 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            שמור חתימה
          </Button>
          <Button variant="outline" onClick={onCancel}>
            ביטול
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          חתום עם העכבר או במסך מגע
        </p>
      </CardContent>
    </Card>
  );
}