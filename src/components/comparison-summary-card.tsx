
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

type RiskDistribution = {
  name: string;
  value: number;
};

type ComparisonSummaryCardProps = {
  name: string;
  fileName: string;
  summary: string;
  riskDistribution: RiskDistribution[];
};

const PIE_CHART_COLORS = {
  High: 'hsl(var(--risk-high))',
  Medium: 'hsl(var(--risk-medium))',
  Low: 'hsl(var(--risk-low))',
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

export default function ComparisonSummaryCard({
  name,
  fileName,
  summary,
  riskDistribution,
}: ComparisonSummaryCardProps) {
  return (
    <motion.div variants={itemVariants}>
        <Card className="glass-card h-full">
            <CardHeader>
                <CardTitle className="text-2xl font-heading !text-white">{name}</CardTitle>
                <CardDescription className="!text-muted-foreground italic truncate">
                {fileName}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold mb-2">Key Points:</h4>
                    <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                        {summary.split('. ').filter(s => s.length > 1).map((point, i) => (
                            <li key={i}>{point.trim()}{point.endsWith('.') ? '' : '.'}</li>
                        ))}
                    </ul>
                </div>

                {riskDistribution.length > 0 && (
                  <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={riskDistribution}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={60}
                                  fill="#8884d8"
                                  dataKey="value"
                                  nameKey="name"
                                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                              >
                                  {riskDistribution.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[entry.name as keyof typeof PIE_CHART_COLORS]} />
                                  ))}
                              </Pie>
                              <Legend formatter={(value) => <span className="text-white/80">{value}</span>} />
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
                )}
            </CardContent>
        </Card>
    </motion.div>
  );
}
