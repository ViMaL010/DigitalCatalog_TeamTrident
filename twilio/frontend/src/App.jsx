import React, { useEffect, useState, useRef } from 'react';
import AnimatedContent from '../animation/AnimatedContent';

// Icon components (optimized with proper aria-labels)
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15,3 21,3 21,9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

// UI Components with improved accessibility
const Card = ({ children, className = '', hover = false }) => (
  <div className={`bg-white rounded-lg border border-gray-200 transition-all duration-300 ${hover ? 'hover:shadow-lg hover:border-gray-300' : ''} ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-4 pb-2 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 pt-0 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-900',
    success: 'bg-black text-white',
    warning: 'bg-gray-800 text-white',
    error: 'bg-gray-600 text-white',
    secondary: 'bg-gray-50 text-gray-700 border border-gray-200'
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-black text-white hover:bg-gray-800',
    outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100'
  };
  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-10 px-6'
  };
  return (
    <button 
      className={`inline-flex items-center justify-center rounded font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const ShareModal = ({ isOpen, onClose, pdfBlob }) => {
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    if (pdfBlob && isOpen) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [pdfBlob, isOpen]);

  const shareViaWebAPI = async () => {
    if (navigator.share && pdfBlob) {
      try {
        const file = new File([pdfBlob], 'ProductHub_Catalog.pdf', { 
          type: 'application/pdf',
          lastModified: Date.now()
        });
        
        await navigator.share({
          title: 'ProductHub - Inventory Catalog',
          text: 'Check out our latest product catalog',
          files: [file]
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Share Catalog</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close share dialog"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Share the product catalog PDF with your team or partners
          </p>
          
          <div className="flex space-x-2">
            {navigator.share ? (
              <Button
                variant="default"
                onClick={shareViaWebAPI}
                className="flex-1"
                aria-label="Share PDF via native share"
              >
                <ShareIcon />
                <span className="ml-2">Share</span>
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => window.open(pdfUrl, '_blank')}
                className="flex-1"
                aria-label="View PDF in new tab"
              >
                <ExternalLinkIcon />
                <span className="ml-2">View PDF</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, index }) => {
  const getStockStatus = (quantity) => {
    if (quantity === 0) return { variant: 'error', text: 'Out of Stock' };
    if (quantity < 10) return { variant: 'warning', text: 'Low Stock' };
    return { variant: 'success', text: 'In Stock' };
  };

  const stockStatus = getStockStatus(product.quantity);
  const priceValue = typeof product.price === 'string' ? 
    parseFloat(product.price.replace(/[^0-9.]/g, '')) : product.price || 0;

  return (
    <Card 
      hover 
      className="group"
      style={{ animationDelay: `${index * 0.05}s`, animation: 'fadeIn 0.4s ease-out forwards', opacity: 0 }}
      aria-labelledby={`product-${product.id}-title`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 id={`product-${product.id}-title`} className="font-semibold text-lg text-gray-900">
              {product.name}
            </h3>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
          <Badge variant={stockStatus.variant}>{stockStatus.text}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {product.description && (
          <p className="text-sm text-gray-600 mb-4">{product.description}</p>
        )}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xl font-bold text-gray-900">
              ₹{priceValue.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-500">Price</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">
              {product.quantity}
            </p>
            <p className="text-xs text-gray-500">Stock</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Navbar = ({ totalProducts, lowStockCount, totalValue, onDownloadPDF, onShare }) => (
  <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {/* <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">P</span>
        </div> */}
        <div>
          <h1 className="text-lg font-bold text-gray-900">Vendor Care</h1>
          <p className="text-xs text-gray-500"></p>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{totalProducts}</div>
          <div className="text-xs text-gray-500">Products</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{lowStockCount}</div>
          <div className="text-xs text-gray-500">Low Stock</div>
        </div>
        {/* <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            ₹{typeof totalValue === 'number' ? totalValue.toLocaleString('en-IN') : '0'}
          </div>
          <div className="text-xs text-gray-500">Total Value</div>
        </div> */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownloadPDF}
            aria-label="Download PDF catalog"
          >
            <DownloadIcon />
            <span className="ml-2">PDF</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShare}
            aria-label="Share catalog"
          >
            <ShareIcon />
            <span className="ml-2">Share</span>
          </Button>
          {/* Add Product button commented out as requested */}
          {/* <Button variant="outline" size="sm">+ Add Product</Button> */}
        </div>
      </div>
    </div>
  </nav>
);

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:1337/api/products');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        alert('Failed to load products. Please check your connection and try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Calculate statistics safely
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => (p.quantity || 0) < 10 && (p.quantity || 0) > 0).length;
  const totalValue = products.reduce((sum, product) => {
    const price = typeof product.price === 'string' ? 
      parseFloat(product.price.replace(/[^0-9.]/g, '')) : 
      product.price || 0;
    const quantity = product.quantity || 0;
    return sum + (price * quantity);
  }, 0);

  const generatePDF = async () => {
    try {
      const [{ jsPDF }, html2canvas] = await Promise.all([
        import('jspdf'),
        import('html2canvas').then(mod => mod.default)
      ]);

      // Create a container for the PDF content
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'fixed';
      pdfContainer.style.left = '-10000px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '800px';
      pdfContainer.style.padding = '20px';
      pdfContainer.style.backgroundColor = 'white';
      document.body.appendChild(pdfContainer);

      // Create PDF content with real data
      pdfContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #ddd; padding-bottom: 20px;">
            <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">ProductHub Inventory</h1>
            <div style="font-size: 14px; color: #666;">
              Generated on ${new Date().toLocaleDateString()}
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
            ${products.map(product => {
              const price = typeof product.price === 'string' ? 
                parseFloat(product.price.replace(/[^0-9.]/g, '')) : 
                product.price || 0;
              const quantity = product.quantity || 0;
              
              return `
                <div style="border: 1px solid #eee; border-radius: 8px; padding: 15px; background: white;">
                  <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${product.name || 'Unnamed Product'}</div>
                  ${product.category ? `
                    <div style="background: #f5f5f5; padding: 3px 8px; border-radius: 12px; font-size: 12px; display: inline-block; margin-bottom: 8px;">
                      ${product.category}
                    </div>
                  ` : ''}
                  ${product.description ? `
                    <div style="font-size: 14px; color: #666; margin-bottom: 10px;">${product.description}</div>
                  ` : ''}
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 20px; font-weight: bold;">₹${price.toLocaleString('en-IN')}</div>
                      <div style="font-size: 12px; color: #999;">Price</div>
                    </div>
                    <div>
                      <div style="font-size: 20px; font-weight: bold; color: ${
                        quantity === 0 ? '#ff0000' : 
                        quantity < 10 ? '#ff9900' : '#009900'
                      };">
                        ${quantity}
                      </div>
                      <div style="font-size: 12px; color: #999;">Stock</div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666;">
            <p>Total Products: ${totalProducts} | Low Stock: ${lowStockCount} | Total Value: ₹${totalValue.toLocaleString('en-IN')}</p>
            <p>© ${new Date().getFullYear()} ProductHub. All rights reserved.</p>
          </div>
        </div>
      `;

      // Convert to canvas with better error handling
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        logging: false,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure all images are loaded in the cloned document
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            if (!img.complete) {
              img.setAttribute('crossorigin', 'anonymous');
            }
          });
        }
      });

      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add image to PDF with proper dimensions
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Save the blob for sharing
      const blob = pdf.output('blob');
      setPdfBlob(blob);
      
      // Download the PDF with a timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      pdf.save(`ProductHub_Inventory_${timestamp}.pdf`);

    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again or check the console for details.');
    } finally {
      // Clean up temporary elements
      const containers = document.querySelectorAll('div[style*="left: -10000px"]');
      containers.forEach(container => container.remove());
    }
  };

  const handleShare = async () => {
    try {
      if (!pdfBlob) {
        await generatePDF();
      }
      setShareModalOpen(true);
    } catch (error) {
      console.error('Error preparing share:', error);
      alert('Failed to prepare PDF for sharing. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <Navbar 
        totalProducts={totalProducts} 
        lowStockCount={lowStockCount} 
        totalValue={totalValue}
        onDownloadPDF={generatePDF}
        onShare={handleShare}
      />
      
      <div className="container mx-auto px-6 py-8" ref={contentRef}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inventory Overview</h1>
          <p className="text-gray-600">Manage your product inventory with real-time stock tracking</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div 
                className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"
                aria-label="Loading"
              />
              <p className="text-gray-500">Loading products...</p>
            </div>
          </div>
        ) : products.length > 0 ? (
          <>
              <AnimatedContent
              distance={150}
              direction="vertical"
              reverse={false}
              duration={1.2}
              ease="bounce.out"
              initialOpacity={0.2}
              animateOpacity
              scale={1.1}
              threshold={0.2}
              delay={0.3}
            >            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product, idx) => (
                <ProductCard 
                  key={product.id || idx} 
                  product={product} 
                  index={idx} 
                />
              ))}
            </div>
            </AnimatedContent>

            
            <div className="text-center py-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                Showing {totalProducts} products • Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500">No products available</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            </div>
          </div>
        )}
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        pdfBlob={pdfBlob}
      />
    </div>
  );
}