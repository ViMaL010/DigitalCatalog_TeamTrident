import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, LogOut, Menu, X, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { AIChat } from '@/components/AIChat';
import { CatalogView } from '@/components/CatalogView';
import { Product } from '@/components/ProductCard';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [aiPanelMinimized, setAiPanelMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/auth');
      return;
    }
    setUser(JSON.parse(userData));

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You've been successfully logged out",
    });
    navigate('/');
  };

  const handleProductGenerated = (productData: any) => {
    setProducts(prev => [...prev, productData]);
    toast({
      title: "Product added!",
      description: `${productData.name} has been added to your catalog`,
    });
    
    // Close chat on mobile after adding product
    if (isMobile) {
      setShowChat(false);
    }
  };

  const handleProductUpdate = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    
    if (updates.status === 'approved') {
      toast({
        title: "Product approved!",
        description: "Product has been added to your catalog",
      });
    }
  };

  const handleProductDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Product deleted",
      description: "Product has been removed from your catalog",
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">CatalogAI</h1>
              <p className="text-sm text-muted-foreground">Your AI-powered catalog</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Chat Toggle */}
            {isMobile && (
              <Button
                onClick={() => setShowChat(!showChat)}
                variant="outline"
                size="sm"
              >
                {showChat ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              </Button>
            )}

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop: Side-by-side layout */}
        {!isMobile && (
          <>
            {/* Left Sidebar - AI Chat */}
            {!aiPanelMinimized && (
              <div className="w-96 min-w-96 max-w-96 border-r border-border relative flex-shrink-0">
                <Button
                  onClick={() => setAiPanelMinimized(true)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 z-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="h-full p-4">
                  <AIChat onProductGenerated={handleProductGenerated} />
                </div>
              </div>
            )}

            {/* Main Content - Catalog */}
            <div className="flex-1 relative overflow-hidden">
              <div className="p-3 md:p-6 h-full">
                <CatalogView
                  products={products}
                  onProductUpdate={handleProductUpdate}
                  onProductDelete={handleProductDelete}
                />
              </div>
            </div>
          </>
        )}

        {/* Mobile: Conditional layout */}
        {isMobile && (
          <div className="flex-1 relative min-h-0">
            {showChat ? (
              /* Mobile Chat Overlay */
              <div className="absolute inset-0 bg-background z-40">
                <div className="h-full p-3">
                  <AIChat onProductGenerated={handleProductGenerated} />
                </div>
              </div>
            ) : (
              /* Mobile Catalog View */
              <div className="p-3 h-full overflow-hidden">
                <CatalogView
                  products={products}
                  onProductUpdate={handleProductUpdate}
                  onProductDelete={handleProductDelete}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop: Floating AI Panel Button (when minimized) */}
      {!isMobile && aiPanelMinimized && (
        <Button
          onClick={() => setAiPanelMinimized(false)}
          variant="floating"
          size="lg"
          className="fixed bottom-6 left-6 w-14 h-14 shadow-elevated z-30 bg-foreground text-background hover:bg-foreground/90"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}

      {/* Mobile: Floating Action Button */}
      {isMobile && !showChat && (
        <Button
          onClick={() => setShowChat(true)}
          variant="floating"
          size="lg"
          className="fixed bottom-6 right-6 w-14 h-14 shadow-elevated z-30"
        >
          <Mic className="w-6 h-6" />
        </Button>
      )}

      {/* Quick Stats Bar */}
      <div className="border-t border-border bg-muted/50 px-4 py-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            {products.length} products • {products.filter(p => p.status === 'approved').length} approved
          </span>
          <span className="text-muted-foreground">
            {user.language && `Language: ${user.language.toUpperCase()}`}
          </span>
        </div>
      </div>
    </div>
  );
}