import React, { useEffect, useState } from 'react';

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

const Navbar = ({ totalProducts, lowStockCount, totalValue }) => (
  <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">ProductHub</h1>
          <p className="text-xs text-gray-500">Inventory System</p>
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
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">₹{totalValue.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total Value</div>
        </div>
        <Button variant="outline" size="sm">+ Add Product</Button>
      </div>
    </div>
  </nav>
);

const ProductCard = ({ product, index }) => {
  const getStockStatus = (quantity) => {
    if (quantity === 0) return { variant: 'error', text: 'Out of Stock' };
    if (quantity < 10) return { variant: 'warning', text: 'Low Stock' };
    return { variant: 'success', text: 'In Stock' };
  };

  const stockStatus = getStockStatus(product.quantity);
  const priceValue = parseFloat(product.price.replace(/[^0-9.]/g, ''));

  return (
    <Card 
      hover 
      className="group"
      style={{ animationDelay: `${index * 0.05}s`, animation: 'fadeIn 0.4s ease-out forwards', opacity: 0 }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
          <Badge variant={stockStatus.variant}>{stockStatus.text}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{product.description}</p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xl font-bold text-gray-900">₹{priceValue}</p>
            <p className="text-xs text-gray-500">Price</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{product.quantity}</p>
            <p className="text-xs text-gray-500">Stock</p>
          </div>
          <Button variant="ghost" size="sm">Edit</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:1337/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        // Fallback mock data if API fails
        const fallbackProducts = [
          {
            id: 1,
            name: "Wireless Headphones",
            category: "Electronics",
            description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
            price: 2999,
            quantity: 15
          },
          {
            id: 2,
            name: "Coffee Mug",
            category: "Home",
            description: "Ceramic coffee mug with ergonomic handle. Perfect for daily use.",
            price: 299,
            quantity: 0
          },
          {
            id: 3,
            name: "Laptop Stand",
            category: "Office",
            description: "Adjustable aluminum laptop stand for better ergonomics and cooling.",
            price: 1299,
            quantity: 8
          }
        ];
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.quantity < 10 && p.quantity > 0).length;
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <Navbar totalProducts={totalProducts} lowStockCount={lowStockCount} totalValue={totalValue} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory Overview</h2>
          <p className="text-gray-600">Manage your product inventory with real-time stock tracking</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading products...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
            
            <div className="text-center py-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                Showing {products.length} products • Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}