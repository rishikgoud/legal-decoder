
'use client';

import { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

type UploadFormProps = {
  onPreview: (text: string, fileName: string) => void;
  isLoading: boolean;
};

export default function UploadForm({ onPreview, isLoading }: UploadFormProps) {
  const { toast } = useToast();
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.docx')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a PDF, DOCX, or text file.',
      });
      return;
    }

    setIsParsing(true);
    let extractedText = '';
    
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const content = await page.getTextContent();
          extractedText += content.items.map((item: any) => item.str).join(" ") + '\n';
        }
      } else if (file.type === 'text/plain') {
        extractedText = await file.text();
      } else {
        // For DOCX and images, we can add parsing logic here in the future.
        // For now, we'll just show a message.
        toast({
          title: 'File Type Note',
          description: `Support for ${file.type} is coming soon. For now, please use PDF or paste text.`,
        });
        setIsParsing(false);
        return;
      }
      
      toast({
        title: 'File Content Extracted',
        description: 'The text from your file is ready for preview.',
      });
      onPreview(extractedText, file.name);

    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        variant: 'destructive',
        title: 'File Parsing Failed',
        description: 'Could not extract text. Please paste the text manually.',
      });
    } finally {
      setIsParsing(false);
    }
    
    e.target.value = ''; // Reset file input
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pastedText = e.clipboardData.getData('text');
      onPreview(pastedText, 'pasted_contract.txt');
  };

  const isDisabled = isLoading || isParsing;

  return (
    <div className="container mx-auto max-w-4xl py-12 px-6 sm:px-8 md:px-4 animate-in fade-in duration-500">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Contract Analyzer
        </h2>
        <p className="text-md sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your legal document and let our AI decode it for you.
        </p>
      </div>

      <Card className="glass-card glow-border">
        <CardContent className="p-6 md:p-8">
          <div className="flex justify-center mb-6">
            <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt,image/*" disabled={isDisabled} />
            <label htmlFor="file-upload" className="w-full">
              <div className="w-full flex items-center justify-center flex-col h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-white/5 hover:border-primary transition-colors group">
                  {isParsing ? <Loader2 className="mr-4 h-8 w-8 animate-spin text-primary" /> : <UploadCloud className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />}
                  <p className="mt-4 text-lg text-muted-foreground">{isParsing ? 'Parsing File...' : 'Click to upload or drag & drop'}</p>
                  <p className="text-sm text-muted-foreground/70">PDF, DOCX, or Image files</p>
                </div>
            </label>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or Paste Text
              </span>
            </div>
          </div>
          
          <div className="grid w-full gap-2 relative">
            <textarea
              id="contract-text"
              placeholder="Pasting your contract text here will take you to the preview..."
              onPaste={handlePaste}
              className="min-h-[150px] text-sm sm:text-base bg-transparent focus-visible:ring-primary transition-all glass-card p-4 w-full rounded-md border border-input ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isDisabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
