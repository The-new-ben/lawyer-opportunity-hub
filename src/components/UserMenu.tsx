import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : 'משתמש';

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        className="relative h-8 w-8 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-56 z-50 bg-background border border-border rounded-md shadow-lg">
            <div className="p-2">
              <div className="flex flex-col space-y-1 px-2 py-1.5">
                <p className="text-sm font-medium leading-none">
                  {user?.email || 'משתמש'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  חשבון משתמש
                </p>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="p-1">
              <button 
                onClick={() => {
                  navigate('/settings');
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
              >
                <User className="mr-2 h-4 w-4" />
                <span>פרופיל</span>
              </button>
              <button 
                onClick={() => {
                  navigate('/settings');
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>הגדרות</span>
              </button>
            </div>
            <div className="h-px bg-border" />
            <div className="p-1">
              <button 
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full flex items-center px-2 py-1.5 text-sm text-red-600 hover:bg-accent hover:text-red-600 rounded-sm disabled:opacity-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoading ? 'מתנתק...' : 'התנתק'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}