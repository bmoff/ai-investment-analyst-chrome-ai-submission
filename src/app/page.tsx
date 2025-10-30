'use client';

import { motion } from "framer-motion";
import { TrendingUp, Zap, BarChart3 } from "lucide-react";
import ChromeAIStatus from "@/features/analysis/components/ChromeAIStatus";
import { TickerSearch } from "@/features/companies/components/TickerSearch";
const Index = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10 relative overflow-hidden">
        {/* Gradient orbs for depth */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        {/* Main content */}
        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center min-h-screen overflow-visible">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl overflow-visible"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-muted-foreground"
            >
              <Zap className="w-4 h-4 text-accent" />
              Powered by AI
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-6xl md:text-7xl font-bold mb-6 tracking-tight"
            >
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                AI Analyst Desk
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              Turn SEC filings and earnings transcripts into actionable insights. Instantly.
            </motion.p>

                   {/* Search Form */}
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.5, duration: 0.8 }}
                     className="max-w-2xl mx-auto mb-16"
                   >
                     <TickerSearch 
                       variant="full" 
                       placeholder="Search by ticker or company name: TSLA, Apple, Microsoft..."
                       showQuickButtons={true}
                     />
                   </motion.div>


                   {/* Feature Pills */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex flex-wrap items-center justify-center gap-4 text-sm mb-8"
                  >
                    {[
                      { icon: TrendingUp, text: "Company Overviews" },
                      { icon: BarChart3, text: "Bull & Bear Cases" },
                      { icon: Zap, text: "Meeting Prep" },
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full glass text-muted-foreground"
                      >
                        <feature.icon className="w-4 h-4 text-accent" />
                        {feature.text}
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Chrome AI Status */}
                  <div className="w-full max-w-2xl mx-auto">
                    <ChromeAIStatus variant="full" />
                  </div>
          </motion.div>
        </div>
      </div>
  );
};

export default Index;