import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Pen, CheckCircle, Clock, User } from 'lucide-react';
import { useContracts, DigitalContract } from '@/hooks/useContracts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SignatureDialog } from './SignatureDialog';

interface DigitalContractProps {
  contract: DigitalContract;
  userRole: 'lawyer' | 'client' | 'admin';
}

export function DigitalContractComponent({ contract, userRole }: DigitalContractProps) {
  const { signContract } = useContracts();
  const [showSignature, setShowSignature] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          ממתין לחתימה
        </Badge>;
      case 'signed':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          חתום
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canSign = () => {
    if (userRole === 'lawyer' && !contract.lawyer_signature) return true;
    if (userRole === 'client' && !contract.client_signature) return true;
    return false;
  };

  const handleSign = (signature: string) => {
    signContract.mutate({
      id: contract.id,
      signature,
      role: userRole as 'lawyer' | 'client'
    });
    setShowSignature(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              חוזה דיגיטלי
            </CardTitle>
            <CardDescription>
              נוצר בתאריך {new Date(contract.created_at).toLocaleDateString('he-IL')}
            </CardDescription>
          </div>
          {getStatusBadge(contract.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">תוכן החוזה</h3>
          <div className="bg-muted p-4 rounded-lg">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {contract.contract_content}
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              חתימת עורך דין
            </h4>
            {contract.lawyer_signature ? (
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 font-medium">חתום</p>
                  <p className="text-xs text-green-600">
                    {new Date(contract.lawyer_signed_at!).toLocaleDateString('he-IL')} ב-
                    {new Date(contract.lawyer_signed_at!).toLocaleTimeString('he-IL')}
                  </p>
                </div>
                <div className="border rounded p-2 bg-white">
                  <img 
                    src={contract.lawyer_signature} 
                    alt="חתימת עורך דין" 
                    className="max-h-16 object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">ממתין לחתימה</p>
                </div>
                {userRole === 'lawyer' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowSignature(true)}
                    className="w-full"
                  >
                    <Pen className="h-4 w-4 mr-2" />
                    חתום על החוזה
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              חתימת לקוח
            </h4>
            {contract.client_signature ? (
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 font-medium">חתום</p>
                  <p className="text-xs text-green-600">
                    {new Date(contract.client_signed_at!).toLocaleDateString('he-IL')} ב-
                    {new Date(contract.client_signed_at!).toLocaleTimeString('he-IL')}
                  </p>
                </div>
                <div className="border rounded p-2 bg-white">
                  <img 
                    src={contract.client_signature} 
                    alt="חתימת לקוח" 
                    className="max-h-16 object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">ממתין לחתימה</p>
                </div>
                {userRole === 'client' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowSignature(true)}
                    className="w-full"
                  >
                    <Pen className="h-4 w-4 mr-2" />
                    חתום על החוזה
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {contract.status === 'signed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">החוזה חתום על ידי שני הצדדים</p>
            <p className="text-green-600 text-sm">ניתן להמשיך לתשלום</p>
          </div>
        )}

        <Dialog open={showSignature} onOpenChange={setShowSignature}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>חתימה דיגיטלית</DialogTitle>
            </DialogHeader>
            <SignatureDialog
              onSign={handleSign}
              onCancel={() => setShowSignature(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}