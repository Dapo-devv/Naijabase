import React from "react";
import { motion } from "framer-motion";
import AdSlot from "../components/AdSlot";
import DashboardSummary from "../components/DashboardSummary";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { Sparkles, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { currentUser } = useNaijaBase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#f4f6f9] dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-300 pb-24"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* --- Header with Welcome Message & Ad Space --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-text dark:text-white tracking-tight">
                Dashboard
              </h1>
              <Sparkles className="w-5 h-5 text-primary dark:text-primary-400 animate-pulse" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your financial universe at a glance.
            </p>
          </div>
          
          {/* Premium Ad Slot (Top Right) */}
          <div className="w-full sm:w-auto">
            <AdSlot 
              width={300} 
              height={60} 
              label="Ad Space" 
              className="rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-dashed border-gray-200 dark:border-gray-700" 
            />
          </div>
        </div>

        {/* --- Main Summary Component (No Buttons) --- */}
        <DashboardSummary />

        {/* --- Footer Banner Ad --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <AdSlot 
            width={728} 
            height={90} 
            label="Ad Space" 
            className="rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 border-dashed border-gray-200 dark:border-gray-700" 
          />
        </motion.div>

        {/* --- Bottom Tip / Quick Insight --- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 justify-center pt-2"
        >
          <TrendingUp className="w-3 h-3" /> 
          <span>Pro tip: Use the "Plan Income" tab to budget your monthly spending.</span>
        </motion.div>
      </div>
    </motion.div>
  );
}