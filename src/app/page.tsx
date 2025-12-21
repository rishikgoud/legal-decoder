
'use client';

import { ArrowRight, BarChart, Bot, FileText, UploadCloud, Users, Zap, Scale, ShieldCheck, Clock, Eye, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import Rellax from 'rellax';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import img from '../../public/stop.png';


const LottieAnimation = dynamic(() => import('@/components/lottie-animation'), {
  ssr: false,
});

const whyUsFeatures = [
    {
        icon: <Zap className="w-8 h-8 text-primary" />,
        title: 'Unmatched Speed',
        description: 'Analyze dense legal documents in seconds, not hours. Our AI processes information at a speed that humans simply can’t match.',
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-primary" />,
        title: 'Bank-Grade Security',
        description: 'Your data is protected with end-to-end encryption and secure, access-controlled cloud infrastructure. Confidentiality is our top priority.',
    },
    {
        icon: <Clock className="w-8 h-8 text-primary" />,
        title: 'Drastic Cost Reduction',
        description: 'Minimize reliance on expensive legal consultations for preliminary contract reviews, saving your business significant operational costs.',
    },
];

const howItWorksSteps = [
    {
        icon: <UploadCloud className="h-8 w-8 text-accent" />,
        title: '1. Secure Upload',
        description: 'Drag and drop your contract in PDF, DOCX, or TXT format. Our platform ensures your document is encrypted and securely processed.',
    },
    {
        icon: <Eye className="h-8 w-8 text-accent" />,
        title: '2. AI Text Extraction',
        description: 'Our advanced OCR and text recognition engine accurately extracts every word from your document, preparing it for deep analysis.',
    },
    {
        icon: <Zap className="h-8 w-8 text-accent" />,
        title: '3. Clause Detection',
        description: 'The AI meticulously scans the text to identify and categorize every legal clause, from confidentiality to liability and termination.',
    },
    {
        icon: <Scale className="h-8 w-8 text-accent" />,
        title: '4. Risk Assessment',
        description: 'Each clause is assigned a risk score—High, Medium, or Low—based on its potential impact, with a clear explanation for the rating.',
    },
    {
        icon: <FileText className="h-8 w-8 text-accent" />,
        title: '5. Plain-English Summary',
        description: 'Complex legal jargon is translated into simple, actionable summaries, empowering you to understand your obligations at a glance.',
    },
    {
        icon: <Briefcase className="h-8 w-8 text-accent" />,
        title: '6. Actionable Insights',
        description: 'Receive a complete interactive report with visual charts, recommendations, and an AI chat to ask specific questions about the contract.',
    },
];

const features = [
  {
    icon: <UploadCloud className="w-8 h-8 text-primary" />,
    title: 'Instant Document Analysis',
    description: 'Securely upload your contracts in various formats including PDF, DOCX, or even image files. Our AI-powered optical character recognition (OCR) extracts the text in seconds, preparing it for a comprehensive analysis.',
  },
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: 'Automated Clause Detection',
    description: 'Forget manual searching. Our AI engine automatically identifies and categorizes all legal clauses within your document, such as indemnification, liability, and confidentiality, providing a structured overview.',
  },
  {
    icon: <Scale className="w-8 h-8 text-primary" />,
    title: 'Intelligent Risk Scoring',
    description: 'Gain immediate clarity on potential pitfalls. We provide a clear risk assessment—High, Medium, or Low—for every clause, complete with a detailed explanation to help you understand the implications.',
  },
  {
    icon: <Bot className="w-8 h-8 text-primary" />,
    title: 'AI Legal Chat',
    description: 'Have a specific question? Ask our AI assistant complex, context-aware questions about your contract (e.g., "What are my termination rights?") and receive instant, accurate answers based on the document\'s content.',
  },
  {
    icon: <BarChart className="w-8 h-8 text-primary" />,
    title: 'Visual Analytics Dashboard',
    description: 'Our interactive dashboard gives you a bird\'s-eye view of your contract\'s risk profile. Use charts and graphs to understand risk distribution and clause types, making complex information easy to digest.',
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: 'Side-by-Side Version Comparison',
    description: 'Quickly identify what\'s changed between two versions of a contract. Our AI instantly highlights added, removed, or modified clauses, saving you from tedious, line-by-line manual comparisons.',
  },
];


export default function LandingPage() {
    useEffect(() => {
    if (typeof window !== 'undefined' && document.querySelector('.rellax')) {
      new Rellax('.rellax', {
        speed: -2,
        center: false,
        wrapper: null,
        round: true,
        vertical: true,
        horizontal: false
      });
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="flex min-h-screen w-full flex-col text-gray-100 overflow-x-hidden bg-gradient-to-br from-[#0B0C10] to-[#1A1A2E]">
        <div className="w-full h-full">
            <Header />

            <main className="flex-1 z-10">
                {/* Hero Section */}
                <section className="relative w-full h-[calc(100vh-80px)] overflow-hidden">
                    {/* Background Video */}
                    <video
                        className="absolute inset-0 w-full h-full object-cover -z-10"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                    >
                        <source src="/illegalvideo.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Optional dark overlay */}
                    <div className="absolute inset-0 bg-black/60"></div>

                    {/* Hero Content */}
                    <div className="relative z-10 flex h-full items-center justify-center text-center px-6">
                        <div className="max-w-4xl">
                            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-heading !text-white">
                                Transform Complex Contracts into Clear Insights — Instantly.
                            </h1>
                            <p className="mx-auto mt-6 max-w-3xl text-md text-[#CCCCCC] sm:text-lg md:text-xl">
                                AI-powered legal analysis that detects clauses, evaluates risks, and explains everything in plain English.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                                <Button asChild size="lg" className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-gradient-to-r from-primary to-accent font-medium text-white transition-all duration-300 ease-in-out hover:from-accent hover:to-primary">
                                    <Link href="/dashboard">
                                        <span className="relative z-10">Analyze a Contract</span>
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="h-12 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                                    <Link href="#features">Learn More</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                 {/* Why Us Section */}
                <section className="py-16 sm:py-24">
                    <div className="container mx-auto max-w-7xl px-6 sm:px-8 md:px-4">
                        <motion.div 
                            className="text-center"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={itemVariants}
                        >
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading !text-[#EAEAEA]">Why Choose Legal Decoder?</h2>
                            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Go beyond simple analysis. Our platform is built for accuracy, security, and immediate value.</p>
                        </motion.div>
                        <motion.div 
                            className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={containerVariants}
                        >
                            {whyUsFeatures.map((feature) => (
                                <motion.div variants={itemVariants} key={feature.title}>
                                    <Card className="glass-card glow-border h-full text-center p-2">
                                        <CardHeader className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-primary/10 rounded-full">
                                                {feature.icon}
                                            </div>
                                            <CardTitle className="text-xl font-heading !text-[#F5F5F5]">{feature.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground">{feature.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* How It Works Section */}
                <motion.section 
                    className="py-16 sm:py-24 bg-white/5"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={containerVariants}
                >
                    <div className="container mx-auto max-w-7xl px-6 sm:px-8 md:px-4">
                        <motion.div className="text-center" variants={itemVariants}>
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading !text-[#EAEAEA]">A Smarter Path to Legal Clarity</h2>
                            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Our refined process makes complex contract analysis effortless and intuitive from start to finish.</p>
                        </motion.div>
                        <div className="mt-12 sm:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {howItWorksSteps.map((step) => (
                                <motion.div variants={itemVariants} key={step.title}>
                                     <Card className="glass-card glow-border h-full hover:-translate-y-2 transition-transform duration-300">
                                        <CardHeader className="flex flex-row items-center gap-4">
                                        {step.icon}
                                        <CardTitle className="text-xl font-heading !text-[#F5F5F5]">{step.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                        <p className="text-muted-foreground">{step.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>
                
                {/* Features Section */}
                <section id="features" className="py-16 sm:py-24">
                <div className="container mx-auto max-w-7xl px-6 sm:px-8 md:px-4">
                    <motion.div 
                        className="text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        variants={itemVariants}
                    >
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading !text-[#EAEAEA]">
                        An Intelligent Suite of Legal Tools
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        Everything you need to decode legal documents with confidence and precision.
                    </p>
                    </motion.div>
                    <motion.div 
                        className="mt-12 sm:mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={containerVariants}
                    >
                    {features.map((feature) => (
                        <motion.div variants={itemVariants} key={feature.title}>
                        <Card className="glass-card glow-border h-full hover:-translate-y-2 transition-transform duration-300">
                            <CardHeader className="flex flex-row items-center gap-4">
                            {feature.icon}
                            <CardTitle className="text-xl font-heading !text-[#F5F5F5]">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                            <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                        </motion.div>
                    ))}
                    </motion.div>
                </div>
                </section>
                
                {/* Banner Section */}
                <section className="w-full py-16">
                    <div className="relative h-96">
                        <Image
                            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070&auto=format&fit=crop"
                            alt="Team Collaboration"
                            fill
                            style={{objectFit: 'cover'}}
                            className="grayscale"
                            data-ai-hint="collaboration meeting"
                        />
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <motion.div 
                                className="text-center px-4"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.5 }}
                                variants={itemVariants}
                            >
                                <h3 className="text-3xl md:text-4xl font-bold text-white font-heading">Empowering Smarter Negotiations</h3>
                                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">Turn legal complexities into your competitive advantage.</p>
                            </motion.div>
                        </div>
                    </div>
                </section>


                {/* CTA Section */}
                <section className="py-16 sm:py-24">
                    <div className="container mx-auto max-w-7xl px-6 sm:px-8 md:px-4">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/50 via-primary/50 to-fuchsia-500/50 p-8 md:p-12 shadow-2xl bg-grid-white/[0.05]">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                                <motion.div 
                                    className="text-center md:text-left"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.5 }}
                                    variants={itemVariants}
                                >
                                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading !text-[#EAEAEA]">
                                        Stop Wasting Hours Reading Contracts
                                    </h2>
                                    <p className="mt-4 text-lg text-muted-foreground">
                                    Our AI-powered platform is engineered for speed and accuracy, delivering in-depth analysis in seconds. Free up your team to focus on strategy and growth, not on tedious manual reviews. Get the clarity you need to make smarter, faster decisions.
                                    </p>
                                    <div className="mt-8">
                                        <Button asChild size="lg" className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-md bg-gradient-to-r from-primary to-accent font-medium text-white transition-all duration-300 ease-in-out hover:from-accent hover:to-primary">
                                            <Link href="/dashboard">
                                                <span className="relative z-10">Upload and Analyze Now</span>
                                                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="hidden md:flex items-center justify-center"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    transition={{ duration: 0.5 }}
                                >
                                     <Image src={img} alt="CTA Illustration" width={400} height={400} className="rounded-lg shadow-2xl grayscale" data-ai-hint="legal contract" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <footer className="z-10 border-t border-white/10 bg-background/50 backdrop-blur-lg">
                <div className="container mx-auto max-w-7xl px-4 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="flex flex-col items-center text-center md:items-start md:text-left col-span-1 md:col-span-1">
                    <Link href="/" className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                        <Scale className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight font-heading">
                        Legal Decoder
                        </h1>
                    </Link>
                    <p className="text-muted-foreground text-sm max-w-xs">
                        Your AI-powered partner for demystifying complex legal contracts.
                    </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center md:text-left col-span-1 md:col-span-3">
                        <div>
                            <h4 className="font-semibold text-foreground mb-4">Product</h4>
                            <ul className="space-y-3">
                                <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors duration-200">Analyze</Link></li>
                                <li><Link href="/compare" className="text-muted-foreground hover:text-primary transition-colors duration-200">Compare</Link></li>
                                <li><Link href="/clause-explorer" className="text-muted-foreground hover:text-primary transition-colors duration-200">Clause Explorer</Link></li>
                                <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors duration-200">Features</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-4">Company</h4>
                            <ul className="space-y-3">
                                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">About Us</Link></li>
                                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Careers</Link></li>
                                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Contact</Link></li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                            <ul className="space-y-3">
                                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Terms of Service</Link></li>
                                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Privacy Policy</Link></li>
                                 <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">Disclaimer</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Legal Decoder. All Rights Reserved. This is not legal advice.</p>
                </div>
                </div>
            </footer>
        </div>
    </div>
  );
}
