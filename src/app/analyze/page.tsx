
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DetectAndLabelClausesOutput } from '@/ai/schemas/detect-and-label-clauses-schema';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, Bot } from 'lucide-react';
import { Header } from '@/components/header';
import AuthGuard from '@/components/AuthGuard';
import { User } from '@supabase/supabase-js';
import * as pdfjsLib from 'pdfjs-dist';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';
import AnalysisReport from '@/components/analysis-report';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Chat from '@/components/chat';

pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

function AnalyzePageComponent() {
  const [analysisResult, setAnalysisResult] =
    useState<DetectAndLabelClausesOutput | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [contractText, setContractText] = useState('');
  const [contractFileName, setContractFileName] = useState('New Contract');
  
  const handleAnalyze = async (text: string, fileName: string) => {
    setContractText(text);
    setContractFileName(fileName);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to analyze a contract.',
        });
        return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    setAnalysisId(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          fileName: fileName,
          contractText: text,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      if (result.data?.analysis_data) {
        setAnalysisResult(result.data.analysis_data as DetectAndLabelClausesOutput);
        setAnalysisId(result.data.id); // Save the analysis ID
        toast({
            title: "Analysis Complete",
            description: "Your contract report is ready below."
        })
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error.message || 'An unknown error occurred.',
      });
      setAnalysisResult(null);
      setAnalysisId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewAnalysis = () => {
    setAnalysisResult(null);
    setAnalysisId(null);
    setContractText('');
    setContractFileName('New Contract');
    setIsLoading(false);
     toast({
        title: "Ready for New Analysis",
        description: "The previous report is saved in your dashboard history.",
    });
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-[#0B0C10] to-[#1A1A2E] text-white">
      <Header />
      <main className="flex-1 z-10 py-8 sm:py-12">
        {isLoading ? (
             <div className="container mx-auto max-w-4xl py-12 px-6 sm:px-8 md:px-4 flex items-center justify-center h-full">
                <div className="space-y-4 animate-in fade-in duration-500 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-lg text-muted-foreground">
                    AI is decoding your contract... this may take a moment.
                </p>
                </div>
            </div>
        ) : analysisResult ? (
            <div className="relative">
                <AnalysisReport 
                    analysisResult={analysisResult} 
                    contractName={contractFileName} 
                    onStartNew={handleStartNewAnalysis}
                    analysisId={analysisId}
                />
                <Dialog>
                  <DialogTrigger asChild>
                      <Button className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl" size="icon">
                          <Bot className="h-8 w-8" />
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl h-[70vh] flex flex-col p-0">
                      <DialogHeader className='p-6 pb-2'>
                          <DialogTitle>Ask AI about this Contract</DialogTitle>
                      </DialogHeader>
                      <Chat contractText={contractText} />
                  </DialogContent>
                </Dialog>
            </div>
        ) : (
          <UploadSection onAnalyze={handleAnalyze} />
        )}
      </main>
    </div>
  );
}

function UploadSection({ onAnalyze }: { onAnalyze: (text: string, fileName: string) => void }) {
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      } else if (file.type === 'text/plain' || file.name.endsWith('.docx')) {
         if (file.name.endsWith('.docx')) {
            toast({
                title: 'File Type Note',
                description: `Full DOCX support is in progress. Text will be extracted, but formatting may be lost.`,
            });
         }
        extractedText = await file.text();
      } else {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload a PDF, DOCX, or text file.',
        });
        setIsParsing(false);
        return;
      }
      onAnalyze(extractedText, file.name);

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

  const handlePasteAndAnalyze = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pastedText = e.clipboardData.getData('text');
      if (pastedText.trim().length > 50) {
        onAnalyze(pastedText, 'Pasted Contract');
      } else {
        toast({
          title: "Paste Text",
          description: "Paste your full contract text to start the analysis."
        })
      }
  };

  const isDisabled = isParsing;

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Analyze a New Contract</h1>
            <p className="mt-3 text-lg text-muted-foreground">Get an instant AI summary and risk analysis for any legal document.</p>
        </div>

        <div className="glass-card rounded-xl p-6 max-w-4xl mx-auto">
            <Tabs defaultValue="upload">
                <TabsList className="grid w-full grid-cols-2 bg-slate-900/80">
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                    <TabsTrigger value="paste">Paste Text</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-6">
                    <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" disabled={isDisabled} />
                    <label htmlFor="file-upload" className="w-full flex items-center justify-center flex-col h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-white/5 hover:border-primary transition-colors group">
                        {isParsing ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />}
                        <p className="mt-4 font-semibold text-foreground">{isParsing ? 'Parsing File...' : 'Drag & drop your file here'}</p>
                        <p className="text-sm text-muted-foreground mt-1">Supported formats: PDF, DOCX (Max 20MB)</p>
                        <Button variant="outline" size="sm" className="mt-4 pointer-events-none bg-transparent">Browse Files</Button>
                    </label>
                    <p className="text-xs text-muted-foreground text-center mt-4">Your documents are encrypted and processed securely.</p>
                </TabsContent>
                <TabsContent value="paste" className="mt-6">
                    <Textarea
                        placeholder="Paste your contract text here to begin analysis..."
                        onPaste={handlePasteAndAnalyze}
                        className="min-h-[200px] text-sm bg-transparent"
                        disabled={isDisabled}
                    />
                </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <AuthGuard>
      <AnalyzePageComponent />
    </AuthGuard>
  );
}
