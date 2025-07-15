import { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recognition. Please type instead.",
        variant: "destructive",
      });
      return;
    }

    setIsRecording(true);
    
    // Simulate voice processing for demo
    setTimeout(() => {
      setIsRecording(false);
      setIsProcessing(true);
      
      // Simulate AI processing
      setTimeout(() => {
        setIsProcessing(false);
        // Example product data
        onTranscript("Organic turmeric powder, 10 kg available, ₹120 per kg");
        toast({
          title: "Voice captured!",
          description: "AI is processing your product details...",
        });
      }, 2000);
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
  };

  const getButtonVariant = () => {
    if (isProcessing) return 'secondary';
    if (isRecording) return 'voice';
    return 'outline';
  };

  const getIcon = () => {
    if (isProcessing) return <Loader2 className="animate-spin" />;
    if (isRecording) return <MicOff />;
    return <Mic />;
  };

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (isRecording) return 'Stop Recording';
    return 'Start Speaking';
  };

  return (
    <Button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled || isProcessing}
      variant={getButtonVariant()}
      size="icon"
      className={`h-10 w-10 ${isRecording ? 'animate-pulse-voice' : ''} ${isProcessing ? 'opacity-75' : ''}`}
    >
      {getIcon()}
    </Button>
  );
}