import { useState } from 'react';
import { Download, Share2, Grid3X3, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard, Product } from './ProductCard';
import { ShareModal } from './ShareModal';
import { Badge } from '@/components/ui/badge';

interface CatalogViewProps {
  products: Product[];
  onProductUpdate: (id: string, updates: Partial<Product>) => void;
  onProductDelete: (id: string) => void;
}

export function CatalogView({ products, onProductUpdate, onProductDelete }: CatalogViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showShareModal, setShowShareModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const approvedProducts = products.filter(p => p.status === 'approved');
  const pendingProducts = products.filter(p => p.status === 'pending');

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    return product.status === filter;
  });

  const handleApproveAll = () => {
    pendingProducts.forEach(product => {
      onProductUpdate(product.id, { status: 'approved' });
    });
  };

  const handleDownloadPDF = () => {
    // Simulate PDF generation
    const catalogData = approvedProducts.map(p => 
      `${p.name}\n${p.description}\nPrice: ${p.price}\nQuantity: ${p.quantity}\n\n`
    ).join('');
    
    const blob = new Blob([catalogData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-catalog.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 md:space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-start sm:items-center flex-shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Your Catalog</h2>
          <div className="flex gap-2 mt-2">
            <Badge variant="default" className="bg-success text-success-foreground text-xs">
              {approvedProducts.length} Approved
            </Badge>
            <Badge variant="secondary" className="bg-warning text-warning-foreground text-xs">
              {pendingProducts.length} Pending
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {pendingProducts.length > 0 && (
            <Button onClick={handleApproveAll} variant="success" size="sm">
              <span className="hidden sm:inline">Approve All</span>
              <span className="sm:hidden">Approve</span>
            </Button>
          )}
          <Button onClick={handleDownloadPDF} variant="outline" size="sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">PDF</span>
          </Button>
          <Button onClick={() => setShowShareModal(true)} variant="outline" size="sm">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Share</span>
          </Button>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-start sm:items-center flex-shrink-0">
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="text-xs sm:text-sm"
          >
            All ({products.length})
          </Button>
          <Button
            onClick={() => setFilter('approved')}
            variant={filter === 'approved' ? 'default' : 'outline'}
            size="sm"
            className="text-xs sm:text-sm"
          >
            Approved ({approvedProducts.length})
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            className="text-xs sm:text-sm"
          >
            Pending ({pendingProducts.length})
          </Button>
        </div>

        <div className="flex gap-1 sm:gap-2">
          <Button
            onClick={() => setViewMode('grid')}
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="flex-1 min-h-0 overflow-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <Filter className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-medium text-foreground mb-2">No products found</h3>
            <p className="text-sm text-muted-foreground px-4">
              {filter === 'all' 
                ? "Start by adding your first product using the AI assistant"
                : `No ${filter} products in your catalog`
              }
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-4"
              : "space-y-3 md:space-y-4 pb-4"
          }>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onApprove={(id) => onProductUpdate(id, { status: 'approved' })}
                onEdit={onProductUpdate}
                onDelete={onProductDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        catalogData={approvedProducts}
      />
    </div>
  );
}