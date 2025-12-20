'use client';

import { DetectAndLabelClausesOutput } from '@/ai/schemas/detect-and-label-clauses-schema';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  AlertTriangle,
  AlertCircle,
  FileSearch,
  Share2,
  Download,
  RotateCcw,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type AnalysisReportProps = {
  analysisResult: DetectAndLabelClausesOutput;
  contractName: string;
  onStartNew: () => void;
};

const riskLevelToVariant = (
  level: 'High' | 'Medium' | 'Low'
): 'high' | 'medium' | 'low' => {
  return level.toLowerCase() as 'high' | 'medium' | 'low';
};

export default function AnalysisReport({
  analysisResult,
  contractName,
  onStartNew,
}: AnalysisReportProps) {
  const { summaryCards, overallRisk, riskScore } = useMemo(() => {
    const highRiskCount = analysisResult.filter(
      (c) => c.riskLevel === 'High'
    ).length;
    const mediumRiskCount = analysisResult.filter(
      (c) => c.riskLevel === 'Medium'
    ).length;
    const lowRiskCount = analysisResult.filter(
      (c) => c.riskLevel === 'Low'
    ).length;

    let risk = 'Low';
    let score = 90;
    if (highRiskCount > 0) {
      risk = 'High';
      score = 30;
    } else if (mediumRiskCount > 0) {
      risk = 'Medium';
      score = 65;
    }

    return {
      summaryCards: [
        {
          title: 'Total Clauses',
          value: analysisResult.length,
          icon: <FileText className="text-blue-400" />,
          footer: 'Processed',
        },
        {
          title: 'Critical Risks',
          value: highRiskCount,
          icon: <AlertTriangle className="text-red-400" />,
          footer: 'Immediate attention needed',
        },
        {
          title: 'Moderate Risks',
          value: mediumRiskCount,
          icon: <AlertCircle className="text-yellow-400" />,
          footer: 'Standard review advised',
        },
        {
          title: 'Low Risks',
          value: lowRiskCount,
          icon: <FileSearch className="text-green-400" />,
          footer: 'All clear',
        },
      ],
      overallRisk: risk,
      riskScore: score,
    };
  }, [analysisResult]);

  const getRiskColor = () => {
    if (overallRisk === 'High') return 'text-red-400';
    if (overallRisk === 'Medium') return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            {contractName} Analysis
            <Badge variant="secondary" className="bg-green-500/10 text-green-400">
              COMPLETED
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyzed {new Date().toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onStartNew}><RotateCcw className="mr-2 h-4 w-4" /> New Analysis</Button>
          <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
          <Button className="bg-primary hover:bg-primary/90"><Download className="mr-2 h-4 w-4" /> Export Report</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card) => (
          <Card key={card.title} className="glass-card">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.footer}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Risk Assessment */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <div className="relative h-48 w-48">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  <path
                    className="stroke-current text-border"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="2"
                  />
                  <path
                    className={`stroke-current ${getRiskColor()}`}
                    strokeDasharray={`${riskScore}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white">{riskScore}</span>
                  <span className="text-sm text-muted-foreground">SCORE</span>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">
                This document has a{' '}
                <span className={`font-semibold ${getRiskColor()}`}>
                  {overallRisk} Risk
                </span>{' '}
                profile. Review critical clauses before signing.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Key Clause Breakdown */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Key Clause Breakdown</CardTitle>
                <Button variant="link" className="text-primary">Filter by: High Risk First</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {analysisResult.map((clause, index) => (
                  <AccordionItem value={`item-${index}`} key={index} className="bg-secondary/30 rounded-lg border border-border">
                    <AccordionTrigger className="p-4 hover:no-underline text-left">
                       <div className="flex items-center gap-4 w-full">
                        <span className="font-semibold text-lg text-white">
                           {index + 1}. {clause.clauseType}
                        </span>
                        <Badge variant={riskLevelToVariant(clause.riskLevel)} className="ml-auto">
                          {clause.riskLevel.toUpperCase()} RISK
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-4">
                        <div>
                          <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-2">Original Legal Text</h4>
                          <p className="text-sm text-gray-300 leading-relaxed font-mono">{clause.clauseText}</p>
                        </div>
                         <div>
                           <h4 className="text-xs uppercase font-semibold text-primary mb-2">✦ AI Simplification</h4>
                           <p className="text-sm text-white leading-relaxed">{clause.summary}</p>
                           <p className="text-xs text-muted-foreground mt-4">{clause.riskReason}</p>
                           {(clause.riskLevel === 'High' || clause.riskLevel === 'Medium') && (
                            <a href="#" className="text-xs text-primary hover:underline mt-2 block">Why is this critical?</a>
                           )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
