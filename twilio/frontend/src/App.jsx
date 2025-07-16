import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Card = ({ children, className = '', hover = false }) => (
  <div className={`bg-white rounded-xl border border-gray-200/60 shadow-sm backdrop-blur-sm transition-all duration-300 ${hover ? 'hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1' : ''} ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = 'default', className = '', pulse = false }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    secondary: 'bg-gray-100 text-gray-700 border border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200'
  };
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${variants[variant]} ${pulse ? 'animate-pulse' : ''} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, variant = 'default', size = 'default', className = '', icon, ...props }) => {
  const variants = {
    default: 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400',
    ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md'
  };
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-12 px-6 text-base'
  };
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

const Navbar = () => (
  <nav className="sticky top-0 z-50 w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/80">
    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">📦</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ProductHub</h1>
          <p className="text-xs text-gray-500">Inventory Management</p>
        </div>
      </div>
    </div>
  </nav>
);

const ProductCard = ({ product, index }) => {
  const getStockStatus = (quantity) => {
    if (quantity === 0) return { variant: 'error', text: 'Out of Stock', icon: '❌' };
    if (quantity < 10) return { variant: 'warning', text: 'Low Stock', icon: '⚠️' };
    return { variant: 'success', text: 'In Stock', icon: '✅' };
  };

  const stockStatus = getStockStatus(product.quantity);

  return (
    <Card 
      hover 
      className="group overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-md"
      style={{ animationDelay: `${index * 0.1}s`, animation: 'slideInUp 0.6s ease-out forwards' }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-xl text-gray-900 leading-tight">{product.name}</h3>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
          <Badge variant={stockStatus.variant}><span>{stockStatus.icon}</span> {stockStatus.text}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
        <div className="flex justify-between mt-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">₹{product.price}</p>
            <p className="text-xs text-gray-500">Price</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{product.quantity}</p>
            <p className="text-xs text-gray-500">Stock</p>
          </div>
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
        const res = await axios.get('http://localhost:1337/api/products');
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, idx) => (
              <ProductCard key={idx} product={product} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
