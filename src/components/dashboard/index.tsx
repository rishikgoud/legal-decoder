
'use client';

import type {DetectAndLabelClausesOutput} from '@/ai/flows/detect-and-label-clauses';
import {useMemo} from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {Badge} from '@/components/ui/badge';
import {
  FileText,
  MessageSquare,
  ShieldAlert,
  ShieldHalf,
  ShieldCheck,
} from 'lucide-react';
import Chat from '@/components/chat';

type DashboardProps = {
  analysisResult: DetectAndLabelClausesOutput;
  contractText: string;
};

const riskLevelToVariant = (
  level: 'High' | 'Medium' | 'Low'
): 'high' | 'medium' | 'low' => {
  return level.toLowerCase() as 'high' | 'medium' | 'low';
};

const RiskIcon = ({level}: {level: string}) => {
  switch (level) {
    case 'High':
      return <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0" />;
    case 'Medium':
      return <ShieldHalf className="h-5 w-5 text-yellow-500 flex-shrink-0" />;
    case 'Low':
      return <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />;
    default:
      return null;
  }
};

const PIE_CHART_COLORS = {
  High: 'hsl(var(--risk-high))',
  Medium: 'hsl(var(--risk-medium))',
  Low: 'hsl(var(--risk-low))',
};

export default function Dashboard({
  analysisResult,
  contractText,
}: DashboardProps) {
  const { chartData, pieData, summary, totalClauses } = useMemo(() => {
    const counts = analysisResult.reduce(
      (acc, clause) => {
        acc[clause.riskLevel] = (acc[clause.riskLevel] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const highRiskClauses = analysisResult.filter(c => c.riskLevel === 'High').length;
    const mediumRiskClauses = analysisResult.filter(c => c.riskLevel === 'Medium').length;

    let summaryText = `This contract contains ${analysisResult.length} clauses. `;
    if (highRiskClauses > 0) {
      summaryText += `It has ${highRiskClauses} high-risk and ${mediumRiskClauses} medium-risk clauses that require your attention.`;
    } else if (mediumRiskClauses > 0) {
      summaryText += `It has ${mediumRiskClauses} medium-risk clauses. Overall risk appears moderate.`;
    } else {
      summaryText += 'No high or medium-risk clauses were detected. The overall risk appears low.';
    }

    const pieChartData = [
      { name: 'High', value: counts['High'] || 0 },
      { name: 'Medium', value: counts['Medium'] || 0 },
      { name: 'Low', value: counts['Low'] || 0 },
    ].filter(d => d.value > 0);


    return {
      chartData: [
        {level: 'Low', count: counts['Low'] || 0, fill: 'hsl(var(--risk-low))'},
        {
          level: 'Medium',
          count: counts['Medium'] || 0,
          fill: 'hsl(var(--risk-medium))',
        },
        {level: 'High', count: counts['High'] || 0, fill: 'hsl(var(--risk-high))'},
      ],
      pieData: pieChartData,
      summary: summaryText,
      totalClauses: analysisResult.length,
    };
  }, [analysisResult]);

  return (
    <div className="container mx-auto max-w-7xl py-8 px-6 sm:px-8 md:px-4 animate-in fade-in duration-500">
        <div className="mb-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Analysis Report
            </h2>
            <p className="text-md sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-4">
                An AI-powered overview of your document's structure and potential risks.
            </p>
        </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Analysis Summary</CardTitle>
                    <CardDescription className="!text-muted-foreground">{summary}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <ChartContainer
                            config={{
                            count: {
                                label: 'Clauses',
                            },
                            }}
                        >
                            <BarChart
                            data={chartData}
                            margin={{top: 20, right: 20, left: 0, bottom: 5}}
                            accessibilityLayer
                            >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                            <XAxis
                                dataKey="level"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                stroke="hsl(var(--muted-foreground))"
                                tick={{fontSize: 12}}
                            />
                            <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} />
                            <Tooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="count" radius={8} />
                            </BarChart>
                        </ChartContainer>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className='md:col-span-1'>
            <Card className="h-full glass-card">
                <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                    <CardDescription className="!text-muted-foreground">Total Clauses: {totalClauses}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

                                        return (
                                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold text-sm">
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[entry.name as keyof typeof PIE_CHART_COLORS]} />
                                    ))}
                                </Pie>
                                <Legend formatter={(value) => <span className="text-white/80 text-sm">{value}</span>}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <Tabs defaultValue="clauses" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px] mx-auto">
          <TabsTrigger value="clauses">
            <FileText className="mr-2 h-4 w-4" />
            Clause Analysis
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            AI Legal Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clauses" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Clause Breakdown</CardTitle>
              <CardDescription className="!text-muted-foreground">
                Explore each clause identified in your contract.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {analysisResult.map((clause, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="hover:no-underline text-left text-sm sm:text-base">
                      <div className="flex items-start md:items-center gap-4 w-full">
                        <RiskIcon level={clause.riskLevel} />
                        <span className="font-semibold sm:text-lg flex-1">
                          {clause.clauseType}
                        </span>
                        <Badge variant={riskLevelToVariant(clause.riskLevel)} className="ml-auto">
                          {clause.riskLevel} Risk
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6 bg-white/5 p-4 rounded-b-md">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-md text-foreground/90">
                          Plain English Summary
                        </h4>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          {clause.summary}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-md text-foreground/90">
                          Risk Analysis
                        </h4>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          {clause.riskReason}
                        </p>
                      </div>

                      {(clause.riskLevel === 'High' || clause.riskLevel === 'Medium') && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-md text-foreground/90">
                            Recommendation
                          </h4>
                          <p className="text-muted-foreground text-sm sm:text-base">
                            {clause.recommendation}
                          </p>
                        </div>
                      )}

                      <Accordion
                        type="single"
                        collapsible
                        className="bg-background/50 rounded-md border"
                      >
                        <AccordionItem
                          value="original-text"
                          className="border-b-0"
                        >
                          <AccordionTrigger className="text-xs sm:text-sm py-2 px-4 text-muted-foreground">
                            View Original Clause Text
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <blockquote className="border-l-4 border-primary pl-4 text-xs sm:text-sm text-muted-foreground bg-muted/50 p-4 rounded-r-lg max-h-48 overflow-y-auto">
                              {clause.clauseText}
                            </blockquote>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>AI Legal Chat</CardTitle>
              <CardDescription className="!text-muted-foreground">
                Ask questions about your contract and get contextual answers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chat contractText={contractText} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
