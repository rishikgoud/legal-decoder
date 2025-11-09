import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Shield, Scale, FileX, Globe, Swords, Copyright, Handshake, Columns } from 'lucide-react';

const sampleClauses = [
  {
    icon: <Shield className="h-5 w-5 text-primary" />,
    title: 'Indemnification',
    content: 'The "Indemnifying Party" shall indemnify, defend, and hold harmless the "Indemnified Party" from and against any and all claims, losses, damages, liabilities, and expenses, including reasonable attorneys\' fees, arising out of or related to the Indemnifying Party\'s breach of this Agreement.',
    explanation: 'This clause is a promise by one party to cover the losses of the other party in case of specific events, like a lawsuit arising from the first party\'s actions.',
  },
  {
    icon: <Scale className="h-5 w-5 text-primary" />,
    title: 'Limitation of Liability',
    content: 'In no event shall either party be liable for any indirect, incidental, special, or consequential damages, including loss of profits, data, or business opportunities, arising out of this Agreement.',
    explanation: 'This clause caps the amount of money one party can be required to pay to the other if something goes wrong, often excluding "consequential" or unpredictable damages.',
  },
  {
    icon: <FileX className="h-5 w-5 text-primary" />,
    title: 'Termination',
    content: 'Either party may terminate this Agreement for any reason upon thirty (30) days prior written notice to the other party. This Agreement may be terminated immediately by either party for a material breach by the other party.',
    explanation: 'This defines how and when the contract can be ended by either party, whether for convenience (with notice) or for a serious violation (material breach).',
  },
  {
    icon: <Globe className="h-5 w-5 text-primary" />,
    title: 'Governing Law & Jurisdiction',
    content: 'This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles. The parties consent to the exclusive jurisdiction of the state and federal courts located in Delaware.',
    explanation: 'This specifies which state\'s laws will be used to interpret the contract and where any lawsuit related to the contract must be filed.',
  },
  {
    title: 'Force Majeure',
    icon: <Swords className="h-5 w-5 text-primary" />,
    content: 'Neither party shall be liable for any failure to perform its obligations hereunder where such failure results from any cause beyond its reasonable control, including, without limitation, acts of God, war, riots, or natural disasters.',
    explanation: 'This clause (French for "superior force") excuses a party from not performing its contractual obligations due to unforeseen events beyond its control.',
  },
   {
    icon: <Copyright className="h-5 w-5 text-primary" />,
    title: 'Intellectual Property',
    content: 'All intellectual property rights in and to the services provided shall remain the exclusive property of the Provider. The Client is granted a limited, non-exclusive license to use the service for its internal business purposes.',
    explanation: 'This clause clarifies who owns the intellectual property (like copyrights, patents, or trademarks) created or used in the contract and how the other party is allowed to use it.',
  },
  {
    icon: <Handshake className="h-5 w-5 text-primary" />,
    title: 'Confidentiality',
    content: 'Each party (the "Receiving Party") shall keep confidential all information and documentation of the other party (the "Disclosing Party"), marked as confidential or which would reasonably be considered confidential.',
    explanation: 'A crucial clause that legally requires one or both parties to keep certain information secret and not to share it with third parties.',
  },
   {
    icon: <Columns className="h-5 w-5 text-primary" />,
    title: 'Severability',
    content: 'If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.',
    explanation: 'A safety-net clause. It ensures that if one part of the contract is found to be illegal or invalid by a court, the rest of the contract can still be enforced.',
  },
];

const ClauseExplorer = () => {
  return (
    <Card className="bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Clause Explorer</CardTitle>
        <CardDescription>Learn about common contract clauses and their implications.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {sampleClauses.map((clause, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg hover:no-underline">
                <div className="flex items-center gap-4">
                  {clause.icon}
                  {clause.title}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <div>
                  <h4 className="font-semibold text-base mb-2">Standard Wording Example:</h4>
                  <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground bg-primary/5 p-3 rounded-r-md">
                    {clause.content}
                  </blockquote>
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-2">Plain English Explanation:</h4>
                  <p className="text-foreground/80">{clause.explanation}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ClauseExplorer;
