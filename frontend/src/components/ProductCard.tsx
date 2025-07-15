import { useState } from 'react';
import { Check, X, Edit2, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  quantity: string;
  status: 'pending' | 'approved' | 'rejected';
  image?: string;
}

interface ProductCardProps {
  product: Product;
  onApprove: (id: string) => void;
  onEdit: (id: string, updates: Partial<Product>) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onApprove, onEdit, onDelete }: ProductCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);
  const [imagePreview, setImagePreview] = useState(product.image || '');

  const handleSave = () => {
    onEdit(product.id, { ...editedProduct, image: imagePreview });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProduct(product);
    setImagePreview(product.image || '');
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = () => {
    switch (product.status) {
      case 'approved':
        return <Badge variant="default" className="bg-success text-success-foreground">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200">
      <CardHeader className="pb-3">
        {/* Product Image */}
        {(product.image || imagePreview) && (
          <div className="mb-3 relative">
            <img 
              src={imagePreview || product.image} 
              alt={product.name}
              className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop';
              }}
            />
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editedProduct.name}
                onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                className="font-semibold text-lg"
              />
            ) : (
              <h3 className="font-semibold text-lg text-foreground">{product.name}</h3>
            )}
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isEditing ? (
          <>
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Product Image</label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setImagePreview('')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <Textarea
              value={editedProduct.description}
              onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
              placeholder="Product description"
              className="min-h-20"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                value={editedProduct.price}
                onChange={(e) => setEditedProduct({ ...editedProduct, price: e.target.value })}
                placeholder="Price"
              />
              <Input
                value={editedProduct.quantity}
                onChange={(e) => setEditedProduct({ ...editedProduct, quantity: e.target.value })}
                placeholder="Quantity"
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="font-medium text-primary">{product.price}</span>
              <span className="text-sm text-muted-foreground">{product.quantity}</span>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        {isEditing ? (
          <div className="flex gap-2 w-full">
            <Button onClick={handleSave} variant="success" size="sm" className="flex-1">
              <Check className="w-4 h-4" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {product.status === 'pending' && (
              <Button 
                onClick={() => onApprove(product.id)} 
                variant="success" 
                size="sm"
                className="flex-1"
              >
                <Check className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Approve</span>
              </Button>
            )}
            <Button 
              onClick={() => setIsEditing(true)} 
              variant="outline" 
              size="sm"
              className="flex-1"
            >
              <Edit2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button 
              onClick={() => onDelete(product.id)} 
              variant="destructive" 
              size="sm"
              className="sm:w-auto"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}