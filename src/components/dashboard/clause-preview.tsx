
'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

type ClausePreviewProps = {
  contractText: string;
  onAnalyze: () => void;
  isLoading: boolean;
};

const ClauseTitle = ({ text }: { text: string }) => {
  const CLAUSE_TITLES_REGEX = /^(?:\d+\.\s*)?([\w\s]+(?:Clause|Agreement|Provision|Section|Article))/i;
  
  const match = text.match(CLAUSE_TITLES_REGEX);

  if (match && match[1]) {
    const title = match[1];
    const restOfText = text.substring(match[0].length);
    return (
      <p className="text-base leading-relaxed text-gray-200">
        <strong className="text-primary font-semibold">{match[0].replace(title, title.trim())}</strong>
        {restOfText}
      </p>
    );
  }

  return <p className="text-base leading-relaxed text-gray-200">{text}</p>;
};


export default function ClausePreview({ contractText, onAnalyze, isLoading }: ClausePreviewProps) {
  const clauses = useMemo(() => {
    if (!contractText) return [];
    // Split by lines that start with a number and a dot.
    return contractText
      .split(/\n?\s*(?=\d+\.\s)/g)
      .map(clause => clause.trim())
      .filter(Boolean);
  }, [contractText]);

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:py-20 animate-in fade-in duration-500">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Extracted Contract Clauses
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Review the clauses extracted from your document. When ready, proceed to full analysis.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6 mt-8 max-h-[60vh] overflow-y-auto">
        {clauses.map((clause, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
          >
            <ClauseTitle text={clause} />
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          onClick={onAnalyze}
          disabled={isLoading}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Full Contract'
          )}
        </Button>
      </div>
    </div>
  );
}
