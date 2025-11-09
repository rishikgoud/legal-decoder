
'use client';

import { useState } from 'react';
import { UploadCloud, Loader2, FileCheck2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

type UploadFormMinimalProps = {
  title: string;
  onFileProcessed: (text: string, fileName: string) => void;
  isDisabled: boolean;
  currentFile: string | null;
};

type UploadState = 'idle' | 'parsing' | 'success' | 'error';

export default function UploadFormMinimal({ title, onFileProcessed, isDisabled, currentFile }: UploadFormMinimalProps) {
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processFile(file);
    e.target.value = ''; // Reset file input
  };

  const processFile = async (file: File) => {
    setUploadState('parsing');
    setFileName(file.name);
    
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
        toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: 'Please upload a PDF or plain text file.',
        });
        setUploadState('error');
        return;
      }

      onFileProcessed(extractedText, file.name);
      setUploadState('success');
      toast({
        title: `${title}: File Ready`,
        description: `Text from "${file.name}" has been extracted.`,
      });
    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        variant: 'destructive',
        title: 'File Parsing Failed',
        description: 'Could not extract text from the file.',
      });
      setUploadState('error');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovering(false);
    if (isDisabled || uploadState === 'parsing') return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovering(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovering(false);
  };
  
  const effectiveState = currentFile ? 'success' : uploadState;
  const effectiveFileName = currentFile || fileName;


  const renderContent = () => {
    switch (effectiveState) {
      case 'parsing':
        return (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground px-4 truncate">Parsing "{effectiveFileName}"...</p>
          </>
        );
      case 'success':
        return (
          <>
            <FileCheck2 className="h-10 w-10 text-green-500" />
            <p className="mt-4 text-lg text-muted-foreground truncate px-4">"{effectiveFileName}" ready!</p>
            <p className="text-sm text-muted-foreground/70">Drop a file to replace</p>
          </>
        );
      case 'error':
         return (
          <>
            <XCircle className="h-10 w-10 text-red-500" />
            <p className="mt-4 text-lg text-muted-foreground px-4 truncate">Failed to process "{effectiveFileName}"</p>
            <p className="text-sm text-muted-foreground/70">Please try a different file.</p>
          </>
        );
      case 'idle':
      default:
        return (
          <>
            <UploadCloud className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
            <p className="mt-4 text-lg text-muted-foreground">Click to upload or drag & drop</p>
            <p className="text-sm text-muted-foreground/70">PDF or TXT files</p>
          </>
        );
    }
  };

  return (
    <Card className="glass-card glow-border h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-heading text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <input
          type="file"
          id={`file-upload-${title.replace(' ', '-')}`}
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.txt"
          disabled={isDisabled || uploadState === 'parsing'}
        />
        <label
          htmlFor={`file-upload-${title.replace(' ', '-')}`}
          className={cn(
            "w-full flex items-center justify-center flex-col h-48 border-2 border-dashed border-border rounded-lg cursor-pointer transition-colors group text-center",
            isHovering ? "border-primary bg-primary/10" : "hover:bg-white/5 hover:border-primary"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {renderContent()}
        </label>
      </CardContent>
    </Card>
  );
}
