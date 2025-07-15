import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VoiceInput } from './VoiceInput';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatProps {
  onProductGenerated: (productData: any) => void;
}

export function AIChat({ onProductGenerated }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI assistant. Tell me about your products by speaking or typing. For example: 'I sell organic turmeric powder, 10kg available at ₹120 per kg'",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  const processUserInput = async (input: string) => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);

      // Generate product if AI found product info
      if (aiResponse.productData) {
        onProductGenerated(aiResponse.productData);
      }
    }, 1500);
  };

  const generateAIResponse = (input: string) => {
    const lowerInput = input.toLowerCase();

    // Extract price & quantity using regex
    const priceMatch = input.match(/[₹$]?\s*(\d+(?:\.\d+)?)\s*(?:per|\/|\-)\s*(kg|grams?|pieces?|units?|liters?|bottles?|item|unit)|(\d+(?:\.\d+)?)\s*[₹$]/);
    const quantityMatch = input.match(/(\d+(?:\.\d+)?)\s*(kg|grams?|pieces?|units?|liters?|bottles?)/i);

    // Extract possible product name
    const stopWords = ['i', 'have', 'sell', 'available', 'at', 'for', 'per', '₹', 'rs', 'kg', 'grams', 'pieces', 'units', 'liters', 'bottles', 'unit'];
    const words = input.split(/\s+/).filter(w => !stopWords.includes(w.toLowerCase()));
    const productName = words.slice(0, 3).join(' ').replace(/[^\w\s]/g, '').trim();

    // Validate presence of required details
    if (!productName || !priceMatch || !quantityMatch) {
      return {
        message: `I couldn't find enough details. Please mention the product name, quantity and price. Example: "I sell organic turmeric powder, 5kg available at ₹150 per kg"`,
        productData: null,
      };
    }

    const description = `Premium quality ${productName.toLowerCase()} perfect for health-conscious buyers and authentic recipes.`;

    const price = priceMatch ? `₹${priceMatch[1]}/${priceMatch[2] || 'unit'}` : 'Price on request';
    const quantity = quantityMatch ? `${quantityMatch[1]} ${quantityMatch[2]}` : 'Quantity available';

    const productData = {
      id: Date.now().toString(),
      name: productName,
      description: description,
      price,
      quantity,
      status: 'pending' as const,
      image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop',
    };

    return {
      message: `Great! I’ve created a product card for "${productData.name}". You can review, edit, and approve it in your catalog.`,
      productData,
    };
  };

  const handleSendMessage = () => {
    processUserInput(inputValue);
  };

  const handleVoiceTranscript = (transcript: string) => {
    processUserInput(transcript);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-lg">
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Product Assistant</h3>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!message.isUser && (
                <div className="w-8 h-8 rounded-full bg-chat-assistant flex items-center justify-center">
                  <Bot className="w-4 h-4 text-chat-assistant-foreground" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-chat-user text-chat-user-foreground'
                    : 'bg-chat-assistant text-chat-assistant-foreground'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              {message.isUser && (
                <div className="w-8 h-8 rounded-full bg-chat-user flex items-center justify-center">
                  <User className="w-4 h-4 text-chat-user-foreground" />
                </div>
              )}
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-chat-assistant flex items-center justify-center">
                <Bot className="w-4 h-4 text-chat-assistant-foreground" />
              </div>
              <div className="bg-chat-assistant text-chat-assistant-foreground p-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2 items-center">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your product naturally..."
            disabled={isProcessing}
            className="flex-1 h-10"
          />
          <VoiceInput onTranscript={handleVoiceTranscript} disabled={isProcessing} />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || isProcessing}
            size="icon"
            className="h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}