import { useState } from 'react';
import { Share2, Download, MessageCircle, QrCode, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Product } from './ProductCard';
import jsPDF from 'jspdf';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogData: Product[];
}

export function ShareModal({ isOpen, onClose, catalogData }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const catalogUrl = `${window.location.origin}/catalog/shared`;
  const catalogText = catalogData.map(product => 
    `*${product.name}*\n${product.description}\nPrice: ${product.price}\nQuantity: ${product.quantity}\n`
  ).join('\n---\n\n');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(catalogUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Catalog link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`Check out my product catalog:\n\n${catalogText}\n\nView full catalog: ${catalogUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleDownloadQR = () => {
    // Simulate QR code generation
    toast({
      title: "QR Code generated",
      description: "QR code for your catalog has been downloaded",
    });
  };

  const handleGeneratePDF = async () => {
    try {
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Product Catalog", 105, 30, { align: "center" });
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Professional catalog created with CatalogAI", 105, 40, { align: "center" });
      
      // Line under header
      pdf.line(20, 50, 190, 50);
      
      let yPosition = 70;
      
      for (const product of catalogData) {
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        
        // Product name
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(product.name, 20, yPosition);
        yPosition += 10;
        
        // Product description
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        const splitDescription = pdf.splitTextToSize(product.description, 170);
        pdf.text(splitDescription, 20, yPosition);
        yPosition += splitDescription.length * 5 + 5;
        
        // Price and Quantity
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Price: ${product.price}`, 20, yPosition);
        pdf.text(`Quantity: ${product.quantity}`, 120, yPosition);
        yPosition += 15;
        
        // Separator line
        pdf.line(20, yPosition, 190, yPosition);
        yPosition += 15;
      }
      
      // Save PDF
      pdf.save('product-catalog.pdf');
      
      toast({
        title: "PDF exported",
        description: "Your professional catalog has been downloaded as PDF",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            Share Your Catalog
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Share Link</label>
            <div className="flex gap-2">
              <Input
                value={catalogUrl}
                readOnly
                className="flex-1 text-xs sm:text-sm"
              />
              <Button onClick={handleCopyLink} variant="outline" size="sm">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button
              onClick={handleWhatsAppShare}
              variant="outline"
              className="flex flex-col items-center gap-1 sm:gap-2 h-16 sm:h-20 hover:bg-green-50 text-xs sm:text-sm"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              <span className="font-medium">WhatsApp</span>
            </Button>

            <Button
              onClick={handleDownloadQR}
              variant="outline"
              className="flex flex-col items-center gap-1 sm:gap-2 h-16 sm:h-20 text-xs sm:text-sm"
            >
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-medium">QR Code</span>
            </Button>

            <Button
              onClick={handleGeneratePDF}
              variant="outline"
              className="flex flex-col items-center gap-1 sm:gap-2 h-16 sm:h-20 hover:bg-blue-50 text-xs sm:text-sm"
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <span className="font-medium">Export PDF</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-1 sm:gap-2 h-16 sm:h-20 opacity-50 text-xs sm:text-sm"
              disabled
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 text-white rounded flex items-center justify-center">
                <span className="text-xs font-bold">A</span>
              </div>
              <span>Amazon</span>
              <span className="text-xs text-muted-foreground">Soon</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="bg-muted p-2 sm:p-3 rounded-lg">
            <div className="text-xs sm:text-sm text-muted-foreground text-center">
              Sharing {catalogData.length} approved products
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}